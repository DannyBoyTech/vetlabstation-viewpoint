import { beforeEach, describe, expect, vi } from "vitest";
import {
  BootItemsDto,
  EventId,
  EventIds,
  SmartServiceAgentNotificationDto,
  SmartServiceStatus,
} from "@viewpoint/api";
import { server } from "../../../../test-utils/mock-server";
import { rest } from "msw";
import { render } from "../../../../test-utils/test-utils";
import {
  TestId,
  usePostRestoreEulaModal,
  useSmartServiceOfflineNotifier,
} from "./SmartServiceHooks";
import { GlobalModalProvider } from "../../../components/global-modals/GlobalModals";
import { act, waitFor } from "@testing-library/react";
import { useEventListener } from "../../../context/EventSourceContext";

vi.mock("../../../context/EventSourceContext", async (orig) => ({
  ...((await orig()) as any),
  useEventListener: vi.fn(),
}));

describe("post restore SS activation prompt", () => {
  beforeEach(() => {
    server.use(
      rest.get("**/api/serverResource/eula/smartservice", (req, res, context) =>
        res(context.json(JSON.stringify("SS Eula")))
      )
    );
  });
  const cases: {
    ssStatus: SmartServiceStatus;
    restorePerformed: boolean;
    modalShown: boolean;
  }[] = [
    {
      ssStatus: SmartServiceStatus.NOT_ACTIVATED,
      restorePerformed: true,
      modalShown: true,
    },
    {
      ssStatus: SmartServiceStatus.NOT_ACTIVATED,
      restorePerformed: false,
      modalShown: false,
    },
    {
      ssStatus: SmartServiceStatus.CONNECTED,
      restorePerformed: true,
      modalShown: false,
    },
    {
      ssStatus: SmartServiceStatus.CONNECTED,
      restorePerformed: false,
      modalShown: false,
    },
    {
      ssStatus: SmartServiceStatus.OFFLINE,
      restorePerformed: true,
      modalShown: false,
    },
    {
      ssStatus: SmartServiceStatus.OFFLINE,
      restorePerformed: false,
      modalShown: false,
    },
    {
      ssStatus: SmartServiceStatus.DISABLED,
      restorePerformed: true,
      modalShown: false,
    },
    {
      ssStatus: SmartServiceStatus.DISABLED,
      restorePerformed: false,
      modalShown: false,
    },
    {
      ssStatus: SmartServiceStatus.CONNECTING,
      restorePerformed: true,
      modalShown: false,
    },
    {
      ssStatus: SmartServiceStatus.CONNECTING,
      restorePerformed: false,
      modalShown: false,
    },
  ];

  it.each(cases)(
    "with smartservice status $ssStatus and restorePerformed: $restorePerformed, EULA/activation modal is shown: $modalShow",
    async ({ ssStatus, restorePerformed, modalShown }) => {
      mockSmartServiceStatus(ssStatus);
      mockBootItems({ isFirstBoot: false, restoreDto: { restorePerformed } });

      const { findByTestId, queryByTestId } = render(<TestBed />);

      if (modalShown) {
        const modal = await waitFor(() => findByTestId("global-confirm-modal"));
        expect(modal).toBeVisible();
      } else {
        await act(async () => await new Promise((res) => setTimeout(res, 100)));
        expect(
          await queryByTestId("global-confirm-modal")
        ).not.toBeInTheDocument();
      }
    }
  );

  const TestBed = () => {
    return (
      <GlobalModalProvider>
        <InnerComponent />
      </GlobalModalProvider>
    );
  };

  const InnerComponent = () => {
    usePostRestoreEulaModal();
    return <div />;
  };
});

function mockBootItems(items: BootItemsDto) {
  server.use(
    rest.get("**/api/boot/getBootItems", (req, res, context) =>
      res(context.json(items))
    )
  );
}

function mockSmartServiceStatus(status: SmartServiceStatus) {
  server.use(
    rest.get("**/api/smartService/status", (req, res, context) =>
      res(context.json(status))
    )
  );
}

describe("offline notifications", () => {
  function expectCallbackFor(event: EventId) {
    return waitFor(() => {
      const callback = vi
        .mocked(useEventListener)
        .mock.calls.filter(([eventId]) => eventId === eventId)
        .pop()?.[1];
      expect(callback).toBeDefined();
      return callback!;
    });
  }

  it("lets the user know how many days SmartService has been offline for", async () => {
    const { getByTestId } = render(
      <GlobalModalProvider>
        <OfflineTestBed />
      </GlobalModalProvider>
    );
    const messageCallback = await expectCallbackFor(
      EventIds.SmartServiceAgentNotification
    );

    const daysOffline = Math.floor(Math.random() * 10 + 3);
    const payload: SmartServiceAgentNotificationDto = {
      id: EventIds.SmartServiceAgentNotification,
      smartServiceStatus: SmartServiceStatus.OFFLINE,
      daysOffline,
      minutesOffline: 0,
      hoursOffline: 0,
    };
    messageCallback!({ data: JSON.stringify(payload) } as MessageEvent);
    const modal = await waitFor(() =>
      getByTestId(TestId.SmartServiceOfflineModal)
    );
    expect(modal).toBeVisible();
    expect(modal).toHaveTextContent(
      `SmartService has been offline for ${daysOffline} days.`
    );
  });

  it("replaces existing modal if an updated message comes in", async () => {
    const { getByTestId } = render(
      <GlobalModalProvider>
        <OfflineTestBed />
      </GlobalModalProvider>
    );
    const messageCallback = await expectCallbackFor(
      EventIds.SmartServiceAgentNotification
    );

    const firstDaysOffline = 5;
    const secondDaysOffline = 6;
    const payload: SmartServiceAgentNotificationDto = {
      id: EventIds.SmartServiceAgentNotification,
      smartServiceStatus: SmartServiceStatus.OFFLINE,
      daysOffline: firstDaysOffline,
      minutesOffline: 0,
      hoursOffline: 0,
    };
    messageCallback!({ data: JSON.stringify(payload) } as MessageEvent);
    const modal = await waitFor(() =>
      getByTestId(TestId.SmartServiceOfflineModal)
    );
    expect(modal).toBeVisible();
    expect(modal).toHaveTextContent(
      `SmartService has been offline for ${firstDaysOffline} days.`
    );

    messageCallback!({
      data: JSON.stringify({ ...payload, daysOffline: secondDaysOffline }),
    } as MessageEvent);
    await waitFor(() =>
      expect(modal).toHaveTextContent(
        `SmartService has been offline for ${secondDaysOffline} days.`
      )
    );
  });

  it("closes modal if smartservice connects", async () => {
    const { getByTestId } = render(
      <GlobalModalProvider>
        <OfflineTestBed />
      </GlobalModalProvider>
    );
    const messageCallback = await expectCallbackFor(
      EventIds.SmartServiceAgentNotification
    );
    const payload: SmartServiceAgentNotificationDto = {
      id: EventIds.SmartServiceAgentNotification,
      smartServiceStatus: SmartServiceStatus.OFFLINE,
      daysOffline: 1,
      minutesOffline: 0,
      hoursOffline: 0,
    };
    act(() =>
      messageCallback!({ data: JSON.stringify(payload) } as MessageEvent)
    );
    const modal = await waitFor(() =>
      getByTestId(TestId.SmartServiceOfflineModal)
    );
    expect(modal).toBeVisible();

    const offlineCallback = await expectCallbackFor(
      EventIds.SmartServiceStatus
    );
    act(() =>
      offlineCallback({
        data: JSON.stringify({
          smartServiceStatus: SmartServiceStatus.CONNECTED,
        }),
      } as MessageEvent)
    );
    await waitFor(() => expect(modal).not.toBeInTheDocument());
  });
});

function OfflineTestBed() {
  useSmartServiceOfflineNotifier();
  return <div />;
}
