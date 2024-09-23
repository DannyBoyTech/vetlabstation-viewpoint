import { beforeEach, describe, expect, it } from "vitest";
import ConnectedIcon from "../../assets/smartservice/smartservice-connected.png";
import ConnectingIcon from "../../assets/smartservice/smartservice-connecting.png";
import OfflineIcon from "../../assets/smartservice/smartservice-offline.png";
import DisabledIcon from "../../assets/smartservice/smartservice-disabled.png";
import {
  InstrumentAlertDto,
  InstrumentStatus,
  InstrumentStatusDto,
  InstrumentType,
  MessageCounts,
  SmartServiceStatus,
} from "@viewpoint/api";
import { render } from "../../../test-utils/test-utils";
import { Header } from "./Header";
import { server } from "../../../test-utils/mock-server";
import { rest } from "msw";
import { TestId as SSTestId } from "./SmartServiceIndicator";
import {
  randomInstrumentDto,
  randomInstrumentStatus,
} from "@viewpoint/test-utils";
import { TestId as AlertTestId } from "./AlertIndicator";
import { within } from "@testing-library/react";
import { getInstrumentDisplayImage } from "../../utils/instrument-utils";

// For some reason, Vitest blows up when trying to transform this file
// due to it importing the vtt files. I can't find out why, so for now
// let's just mock out the imports since they aren't needed for this test
vi.mock("../../screens/home/welcome/welcome-video-config", () => ({
  VIDEO_ORDER: [],
  CAPTION_ORDER: [],
  getCueConfiguration: vi.fn(),
}));

describe("viewpoint header", () => {
  beforeEach(() => {
    mockInstrumentStatuses([]);
    mockGetInstrumentAlerts([]);
    mockMessageCounts({ unreadCount: 0, totalCount: 0 });
    mockSmartServiceStatus(SmartServiceStatus.CONNECTED);
  });

  describe("smartservice status", () => {
    const CASES = [
      {
        status: SmartServiceStatus.CONNECTED,
        image: ConnectedIcon,
      },
      {
        status: SmartServiceStatus.CONNECTING,
        image: ConnectingIcon,
      },
      {
        status: SmartServiceStatus.OFFLINE,
        image: OfflineIcon,
      },
      {
        status: SmartServiceStatus.DISABLED,
        image: DisabledIcon,
      },
    ];

    it.each(CASES)(
      "shows the expected smartservice indicator for status $status",
      async ({ status, image }) => {
        mockSmartServiceStatus(status);
        const { findByTestId } = render(<Header />);
        const icon = await findByTestId(SSTestId.Icon);
        expect(icon).toBeVisible();
        expect(icon).toHaveAttribute("src", image);
      }
    );

    it("does not show the smartservice indicator if status is NOT_ACTIVATED", async () => {
      mockSmartServiceStatus(SmartServiceStatus.NOT_ACTIVATED);
      const { queryByTestId } = render(<Header />);
      expect(await queryByTestId(SSTestId.Icon)).not.toBeInTheDocument();
    });
  });

  describe("alerted instruments", () => {
    it("shows an alert pill for instruments with alerts", async () => {
      const instrument = randomInstrumentStatus({
        instrument: randomInstrumentDto({
          instrumentType: InstrumentType.ProCyteOne,
        }),
        instrumentStatus: InstrumentStatus.Alert,
      });
      const instrumentAlert: InstrumentAlertDto = {
        instrumentId: instrument.instrument.id,
        alerts: Array.from({ length: 5 }).map((_, index) => ({
          name: `alert-${index}`,
          uniqueId: `${index}`,
        })),
      };
      mockInstrumentStatuses([instrument]);
      mockGetInstrumentAlerts([instrumentAlert]);
      const { findAllByTestId } = render(<Header />);
      const alerts = await findAllByTestId(AlertTestId.AlertPill);
      expect(alerts).toHaveLength(1);
      const alert = alerts[0];
      expect(alert).toBeVisible();
      expect(alert).toHaveTextContent("5");
      const image = await within(alert).findByRole("img");
      expect(image).toBeVisible();
      expect(image).toHaveAttribute(
        "src",
        getInstrumentDisplayImage(InstrumentType.ProCyteOne)
      );
    });
  });

  it("shows 9+ for instruments with >=9 alerts", async () => {
    const instrument = randomInstrumentStatus({
      instrument: randomInstrumentDto({
        instrumentType: InstrumentType.ProCyteOne,
      }),
      instrumentStatus: InstrumentStatus.Alert,
    });
    const instrumentAlert: InstrumentAlertDto = {
      instrumentId: instrument.instrument.id,
      alerts: Array.from({ length: 9 }).map((_, index) => ({
        name: `alert-${index}`,
        uniqueId: `${index}`,
      })),
    };
    mockInstrumentStatuses([instrument]);
    mockGetInstrumentAlerts([instrumentAlert]);
    const { findAllByTestId } = render(<Header />);
    const [alert] = await findAllByTestId(AlertTestId.AlertPill);
    expect(alert).toBeVisible();
    expect(alert).toHaveTextContent("9+");
  });
});

function mockSmartServiceStatus(status: SmartServiceStatus) {
  server.use(
    rest.get("**/api/smartService/status", (req, res, context) =>
      res(context.json(status))
    )
  );
}

function mockInstrumentStatuses(statuses: InstrumentStatusDto[]) {
  server.use(
    rest.get("**/api/device/status", (req, res, context) =>
      res(context.json(statuses))
    )
  );
}

function mockGetInstrumentAlerts(alerts: InstrumentAlertDto[]) {
  server.use(
    rest.get("**/api/instruments/alerts", (req, res, context) =>
      res(context.json(alerts))
    )
  );
}

function mockMessageCounts(count: MessageCounts) {
  server.use(
    rest.get("**/api/notifications/counts", (req, res, context) =>
      res(context.json(count))
    )
  );
}
