import { fireEvent, getByTestId, waitFor } from "@testing-library/react";
import { describe, vi } from "vitest";
import { render } from "../../../../test-utils/test-utils";
import {
  SnapShotDxInstrumentScreen,
  TestId,
} from "./SnapShotDxInstrumentScreen";
import { InstrumentStatus, InstrumentType } from "@viewpoint/api";
import {
  randomInstrumentDto,
  randomInstrumentStatus,
} from "@viewpoint/test-utils";
import { server } from "../../../../test-utils/mock-server";
import { rest } from "msw";
import userEvent from "@testing-library/user-event";
import { TestId as InstrumentInfoTestId } from "../InstrumentInfo";

const instrument = randomInstrumentStatus({
  instrumentStatus: InstrumentStatus.Ready,
  connected: true,
  instrument: randomInstrumentDto({
    instrumentType: InstrumentType.SNAPshotDx,
  }),
});

describe("SnapShotDxInstrumentScreen", () => {
  beforeEach(() => {
    server.use(
      rest.post("**/api/instrumentEventLogs/:instrumentId", (_req, res, ctx) =>
        res(ctx.delay(100))
      )
    );

    server.use(
      rest.get("**/api/device/status", (_req, res, ctx) =>
        res(ctx.delay(100), ctx.json([instrument]))
      )
    );
  });

  afterEach(() => {
    server.resetHandlers();
  });

  it("should enable 'transmit logs' by default", async () => {
    const { container } = render(
      <SnapShotDxInstrumentScreen instrumentStatus={instrument} />
    );

    const txLogsButton = await getByTestId(
      container,
      TestId.TransmitLogsButton
    );

    expect(txLogsButton).toBeEnabled();
  });

  it("should disable 'transmit logs' while call is in progress", async () => {
    const { container } = render(
      <SnapShotDxInstrumentScreen instrumentStatus={instrument} />
    );

    const txLogsButton = await getByTestId(
      container,
      TestId.TransmitLogsButton
    );

    expect(txLogsButton).toBeEnabled();

    fireEvent.click(txLogsButton);

    await waitFor(() => expect(txLogsButton).toBeDisabled(), {
      timeout: 200,
    });

    await waitFor(() => expect(txLogsButton).toBeEnabled(), {
      timeout: 200,
    });
  });

  it("allows user to remove instrument when not connected", async () => {
    const callback = vi.fn();
    server.use(
      rest.post("**/api/device/:instrumentId/suppress", (req, res, context) => {
        callback(req.params.instrumentId);
        return res(context.delay(100));
      })
    );
    const { container } = render(
      <SnapShotDxInstrumentScreen
        instrumentStatus={{
          ...instrument,
          instrumentStatus: InstrumentStatus.Offline,
          connected: false,
        }}
      />
    );
    const removeButton = await getByTestId(container, "remove-button");
    expect(removeButton).toBeEnabled();
    await userEvent.click(removeButton);
    expect(callback).toHaveBeenCalledWith(`${instrument.instrument.id}`);
  });

  it("shows instrument serial number and software version", async () => {
    const newInstrument = randomInstrumentStatus({
      instrumentStatus: InstrumentStatus.Ready,
      connected: true,
      instrument: randomInstrumentDto({
        instrumentType: InstrumentType.SNAPshotDx,
        softwareVersion: "1.42.143",
        instrumentSerialNumber: "SER09341",
      }),
    });
    const { container } = render(
      <SnapShotDxInstrumentScreen instrumentStatus={newInstrument} />
    );
    expect(
      await getByTestId(
        container,
        InstrumentInfoTestId.InfoProperty("Software Version")
      )
    ).toHaveTextContent(newInstrument.instrument.softwareVersion!);
    expect(
      await getByTestId(
        container,
        InstrumentInfoTestId.InfoProperty("Serial Number")
      )
    ).toHaveTextContent(newInstrument.instrument.instrumentSerialNumber);
  });
});
