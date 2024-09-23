import { fireEvent, getByTestId, waitFor } from "@testing-library/react";
import { describe } from "vitest";
import { render } from "../../../../test-utils/test-utils";
import { CatDxInstrumentScreen, TestIds } from "./CatDxInstrumentsScreen";
import { InstrumentType, InstrumentStatus } from "@viewpoint/api";
import { randomInstrumentStatus } from "@viewpoint/test-utils";
import { server } from "../../../../test-utils/mock-server";
import { rest } from "msw";

const instrument = randomInstrumentStatus({
  instrumentStatus: InstrumentStatus.Ready,
  connected: true,
  instrument: {
    id: 123,
    maxQueueableRuns: 2,
    instrumentType: InstrumentType.CatalystDx,
    instrumentSerialNumber: "987",
    supportedRunConfigurations: [],
    runnable: true,
    displayOrder: 0,
    manualEntry: false,
  },
});

describe("CatDxInstrumentsScreen", () => {
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
      <CatDxInstrumentScreen instrumentStatus={instrument} />
    );

    const txLogsButton = await getByTestId(
      container,
      TestIds.CatDxInstrumentTransmitLogsButton
    );

    expect(txLogsButton).toBeEnabled();
  });

  it("should disable 'transmit logs' while call is in progress", async () => {
    const { container } = render(
      <CatDxInstrumentScreen instrumentStatus={instrument} />
    );

    const txLogsButton = await getByTestId(
      container,
      TestIds.CatDxInstrumentTransmitLogsButton
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
});
