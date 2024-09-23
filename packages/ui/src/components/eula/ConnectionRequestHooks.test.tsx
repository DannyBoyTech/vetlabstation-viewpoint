import { beforeEach, describe, expect, it, vi } from "vitest";
import { GlobalModalProvider } from "../global-modals/GlobalModals";
import { TestId, useConnectionRequestActions } from "./ConnectionRequestHooks";
import { render } from "../../../test-utils/test-utils";
import { server } from "../../../test-utils/mock-server";
import { rest } from "msw";
import { randomInstrumentDto } from "@viewpoint/test-utils";
import { InstrumentDto, InstrumentType } from "@viewpoint/api";
import {
  act,
  getByRole,
  getByTestId,
  queryByTestId,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("../../context/EventSourceContext", async (orig) => ({
  ...((await orig()) as any),
  useEventListener: vi.fn(),
}));

describe("ConnectionRequestHook", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe("procyte dx", () => {
    beforeEach(() => {
      // No instruments needed on mount
      server.use(
        rest.get("**/api/device/awaitingApproval", (req, res, context) =>
          res(context.json([]))
        )
      );
    });

    it("checks for devices awaiting approval on mount and renders a confirm EULA modal for ProCyte Dx", async () => {
      const instrument = randomInstrumentDto({
        instrumentType: InstrumentType.ProCyteDx,
      });
      captureSubmission(instrument);

      const { container } = render(<TestBed />);

      await waitFor(async () =>
        expect(
          await getByTestId(container, TestId.EulaContentBody)
        ).toBeVisible()
      );
    });

    it("allows user to accept the EULA", async () => {
      const instrument = randomInstrumentDto({
        instrumentType: InstrumentType.ProCyteDx,
      });
      const capture = captureSubmission(instrument);

      const { container } = render(<TestBed />);

      await waitFor(async () =>
        expect(
          await getByTestId(container, TestId.EulaContentBody)
        ).toBeVisible()
      );

      await userEvent.click(
        await getByRole(container, "button", { name: "I Agree" })
      );

      expect(capture).toHaveBeenCalledWith(`${instrument.id}`, true);
    });

    it("allows user to decline the EULA", async () => {
      const instrument = randomInstrumentDto({
        instrumentType: InstrumentType.ProCyteDx,
      });
      const capture = captureSubmission(instrument);

      const { container } = render(<TestBed />);

      await waitFor(async () =>
        expect(
          await getByTestId(container, TestId.EulaContentBody)
        ).toBeVisible()
      );

      await userEvent.click(
        await getByRole(container, "button", { name: "I Disagree" })
      );

      expect(capture).toHaveBeenCalledWith(`${instrument.id}`, false);
    });
  });
});

const HookTest = () => {
  useConnectionRequestActions();
  return <div />;
};

const TestBed = () => (
  <GlobalModalProvider>
    <HookTest />
  </GlobalModalProvider>
);

function captureSubmission(instrument: InstrumentDto) {
  const capture = vi.fn();
  server.use(
    rest.get("**/api/device/awaitingApproval", (req, res, context) =>
      res(context.json([{ instrument }]))
    ),
    rest.post("**/api/device/:instrumentId/approved", async (req, res, ctx) => {
      capture(
        req.params["instrumentId"],
        req.url.searchParams.get("approved") === "true"
      );
      return res(ctx.json({}));
    })
  );
  return capture;
}
