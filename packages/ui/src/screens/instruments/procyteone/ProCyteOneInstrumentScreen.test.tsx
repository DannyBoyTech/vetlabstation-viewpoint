import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "../../../../test-utils/test-utils";
import {
  randomInstrumentDto,
  randomInstrumentStatus,
} from "@viewpoint/test-utils";
import {
  EventIds,
  FluidPackStatusResponseDto,
  InstrumentMaintenanceResultDto,
  InstrumentStatus,
  InstrumentType,
  MaintenanceProcedure,
  MaintenanceResult,
} from "@viewpoint/api";
import {
  ProCyteOneInstrumentScreen,
  TestId,
} from "./ProCyteOneInstrumentsScreen";
import { act, screen, waitFor, within } from "@testing-library/react";
import { TestId as InfoTestId } from "../InstrumentInfo";
import { server } from "../../../../test-utils/mock-server";
import { rest } from "msw";
import { TestId as ReplaceFluidTestId } from "./maintenance/ProCyteOneReplaceFluidModal";
import { useEventListener } from "../../../context/EventSourceContext";

vi.mock("../../../context/EventSourceContext", () => ({
  useEventListener: vi.fn(),
}));

beforeEach(() => {
  vi.resetAllMocks();
});

describe("ProCyte One instrument screen", () => {
  it("renders details about the instrument", async () => {
    const instrument = randomInstrumentStatus({
      instrument: randomInstrumentDto({
        instrumentType: InstrumentType.ProCyteOne,
        softwareVersion: "1.99.76",
        ipAddress: "127.0.0.1",
      }),
      instrumentStatus: InstrumentStatus.Ready,
    });
    render(<ProCyteOneInstrumentScreen instrument={instrument} />);

    expect(
      await screen.findByTestId(InfoTestId.InfoProperty("Software Version"))
    ).toHaveTextContent(instrument.instrument.softwareVersion!);
    expect(
      await screen.findByTestId(
        InfoTestId.InfoProperty("SQC Target File Version")
      )
    ).toHaveTextContent("--");
    expect(
      await screen.findByTestId(InfoTestId.InfoProperty("Serial Number"))
    ).toHaveTextContent(instrument.instrument.instrumentSerialNumber);
    expect(
      await screen.findByTestId(InfoTestId.InfoProperty("IP Address"))
    ).toHaveTextContent(instrument.instrument.ipAddress!);
  });

  it("renders dashes for missing properties", async () => {
    const instrument = randomInstrumentStatus({
      instrument: randomInstrumentDto({
        instrumentType: InstrumentType.ProCyteOne,
        instrumentSerialNumber: undefined,
        softwareVersion: undefined,
        ipAddress: undefined,
      }),
      instrumentStatus: InstrumentStatus.Ready,
    });
    render(<ProCyteOneInstrumentScreen instrument={instrument} />);

    expect(
      await screen.findByTestId(InfoTestId.InfoProperty("Software Version"))
    ).toHaveTextContent("--");
    expect(
      await screen.findByTestId(
        InfoTestId.InfoProperty("SQC Target File Version")
      )
    ).toHaveTextContent("--");
    expect(
      await screen.findByTestId(InfoTestId.InfoProperty("Serial Number"))
    ).toHaveTextContent("--");
    expect(
      await screen.findByTestId(InfoTestId.InfoProperty("IP Address"))
    ).toHaveTextContent("--");
  });

  it("requests fluid pack status on mount", async () => {
    const mockReq = vi.fn();
    server.use(
      rest.post(`*/acadia/*/fluidPacks`, (req) => mockReq(req.url.pathname))
    );
    const instrument = randomInstrumentStatus({
      instrument: randomInstrumentDto({
        instrumentType: InstrumentType.ProCyteOne,
      }),
      instrumentStatus: InstrumentStatus.Ready,
    });
    render(<ProCyteOneInstrumentScreen instrument={instrument} />);
    // Wait for condition to pass -- since it's run as an effect, it can sometimes take
    // a few moments after mount before it's actually called
    await waitFor(() =>
      expect(mockReq).toHaveBeenCalledWith(
        `/api/acadia/${instrument.instrument.id}/fluidPacks`
      )
    );
  });

  it("renders sheath information", async () => {
    const instrument = randomInstrumentStatus({
      instrument: randomInstrumentDto({
        instrumentType: InstrumentType.ProCyteOne,
      }),
      instrumentStatus: InstrumentStatus.Ready,
    });
    render(<ProCyteOneInstrumentScreen instrument={instrument} />);

    expect(vi.mocked(useEventListener)).toHaveBeenCalledWith(
      EventIds.FluidPackStatusUpdate,
      expect.anything()
    );
    const callback = vi.mocked(useEventListener).mock.calls[0][1];
    // Invoke callback with a fake SSE message
    const update: FluidPackStatusResponseDto = {
      id: EventIds.FluidPackStatusUpdate,
      instrumentId: instrument.instrument.id,
      packType: "Sheath",
      daysLeft: 20,
      percentLeft: 73,
    };
    const msg = { data: JSON.stringify(update) };

    await act(() => callback(msg as MessageEvent));

    expect(await screen.findByTestId(TestId.SheathPercent)).toHaveTextContent(
      "Sheath: 73%"
    );
    expect(await screen.findByTestId(TestId.SheathExpires)).toHaveTextContent(
      "Expires in 20 days"
    );

    const gaugeContainer = await screen.findByTestId(TestId.Gauge("Sheath"));
    expect(within(gaugeContainer).getByRole("meter")).toHaveStyle(
      "height: 73%"
    );
  });

  it("renders reagent information", async () => {
    const instrument = randomInstrumentStatus({
      instrument: randomInstrumentDto({
        instrumentType: InstrumentType.ProCyteOne,
      }),
      instrumentStatus: InstrumentStatus.Ready,
    });
    render(<ProCyteOneInstrumentScreen instrument={instrument} />);

    expect(vi.mocked(useEventListener)).toHaveBeenCalledWith(
      EventIds.FluidPackStatusUpdate,
      expect.anything()
    );
    const callback = vi.mocked(useEventListener).mock.calls[0][1];
    // Invoke callback with a fake SSE message
    const update: FluidPackStatusResponseDto = {
      id: EventIds.FluidPackStatusUpdate,
      instrumentId: instrument.instrument.id,
      packType: "Reagent",
      daysLeft: 10,
      runsLeft: 12,
      percentLeft: 32,
    };
    const msg = { data: JSON.stringify(update) };

    await act(() => callback(msg as MessageEvent));

    expect(await screen.findByTestId(TestId.ReagentRuns)).toHaveTextContent(
      "Reagent: 12 runs"
    );
    expect(await screen.findByTestId(TestId.ReagentExpires)).toHaveTextContent(
      "Expires in 10 days"
    );

    const gaugeContainer = await screen.findByTestId(TestId.Gauge("Reagent"));
    expect(within(gaugeContainer).getByRole("meter")).toHaveStyle(
      "height: 32%"
    );
  });

  it("does not show fluid pack information when instrument is offline", async () => {
    const instrument = randomInstrumentStatus({
      instrument: randomInstrumentDto({
        instrumentType: InstrumentType.ProCyteOne,
      }),
      connected: false,
      instrumentStatus: InstrumentStatus.Offline,
    });
    render(<ProCyteOneInstrumentScreen instrument={instrument} />);

    expect(
      await screen.queryByTestId(TestId.FluidLevels)
    ).not.toBeInTheDocument();
  });

  it("disables settings and diagnostics buttons when instrument is offline", async () => {
    const instrument = randomInstrumentStatus({
      instrument: randomInstrumentDto({
        instrumentType: InstrumentType.ProCyteOne,
      }),
      connected: false,
      instrumentStatus: InstrumentStatus.Offline,
    });
    render(<ProCyteOneInstrumentScreen instrument={instrument} />);

    expect(await screen.queryByTestId(TestId.DiagnosticsButton)).toBeDisabled();
    expect(await screen.queryByTestId(TestId.SettingsButton)).toBeDisabled();
  });

  it("disables settings and diagnostics buttons when instrument is busy", async () => {
    const instrument = randomInstrumentStatus({
      instrument: randomInstrumentDto({
        instrumentType: InstrumentType.ProCyteOne,
      }),
      instrumentStatus: InstrumentStatus.Busy,
    });
    render(<ProCyteOneInstrumentScreen instrument={instrument} />);

    expect(await screen.queryByTestId(TestId.DiagnosticsButton)).toBeDisabled();
    expect(await screen.queryByTestId(TestId.SettingsButton)).toBeDisabled();
  });

  it("disables settings when instrument is alerted", async () => {
    const instrument = randomInstrumentStatus({
      instrument: randomInstrumentDto({
        instrumentType: InstrumentType.ProCyteOne,
      }),
      instrumentStatus: InstrumentStatus.Alert,
    });
    render(<ProCyteOneInstrumentScreen instrument={instrument} />);

    expect(await screen.queryByTestId(TestId.SettingsButton)).toBeDisabled();
  });

  it("allows instrument to be removed when offline", async () => {
    const instrument = randomInstrumentStatus({
      instrument: randomInstrumentDto({
        instrumentType: InstrumentType.ProCyteOne,
      }),
      connected: false,
      instrumentStatus: InstrumentStatus.Offline,
    });
    const mockSuppress = vi.fn();
    server.use(
      rest.post(`*/device/*/suppress`, (req) => mockSuppress(req.url.pathname))
    );

    render(<ProCyteOneInstrumentScreen instrument={instrument} />);
    const removeButton = await screen.findByTestId("remove-button");
    expect(removeButton).toBeEnabled();
    await userEvent.click(removeButton);

    expect(mockSuppress).toHaveBeenCalledWith(
      `/api/device/${instrument.instrument.id}/suppress`
    );
  });

  it("closes replace reagent modal when replace reagent maintenance message is published", async () => {
    const instrument = randomInstrumentStatus({
      instrument: randomInstrumentDto({
        instrumentType: InstrumentType.ProCyteOne,
      }),
      instrumentStatus: InstrumentStatus.Ready,
    });
    render(<ProCyteOneInstrumentScreen instrument={instrument} />);

    expect(vi.mocked(useEventListener)).toHaveBeenCalledWith(
      EventIds.InstrumentMaintenanceResult,
      expect.anything()
    );
    const callback = vi
      .mocked(useEventListener)
      .mock.calls.find(
        ([eventId]) => eventId === EventIds.InstrumentMaintenanceResult
      )?.[1];
    expect(callback).toBeDefined();

    // Click to open the replace reagent modal
    await userEvent.click(await screen.findByTestId("replace-reagent-button"));
    expect(
      await screen.findByTestId(ReplaceFluidTestId.Modal("Reagent"))
    ).toBeVisible();

    // Invoke callback, verify modal is closed
    const update: InstrumentMaintenanceResultDto = {
      instrument: instrument.instrument,
      maintenanceType: MaintenanceProcedure.REPLACE_REAGENT,
      result: MaintenanceResult.SUCCESS,
    };
    const msg = { data: JSON.stringify(update) };

    await act(() => callback!(msg as MessageEvent));

    expect(
      await screen.queryByTestId(ReplaceFluidTestId.Modal("Reagent"))
    ).not.toBeInTheDocument();
  });

  it("closes replace sheath modal when replace sheath maintenance message is published", async () => {
    const instrument = randomInstrumentStatus({
      instrument: randomInstrumentDto({
        instrumentType: InstrumentType.ProCyteOne,
      }),
      instrumentStatus: InstrumentStatus.Ready,
    });
    render(<ProCyteOneInstrumentScreen instrument={instrument} />);

    expect(vi.mocked(useEventListener)).toHaveBeenCalledWith(
      EventIds.InstrumentMaintenanceResult,
      expect.anything()
    );
    const callback = vi
      .mocked(useEventListener)
      .mock.calls.find(
        ([eventId]) => eventId === EventIds.InstrumentMaintenanceResult
      )?.[1];
    expect(callback).toBeDefined();

    // Click to open the replace reagent modal
    await userEvent.click(await screen.findByTestId("replace-sheath-button"));
    expect(
      await screen.findByTestId(ReplaceFluidTestId.Modal("Sheath"))
    ).toBeVisible();

    // Invoke callback, verify modal is closed
    const update: InstrumentMaintenanceResultDto = {
      instrument: instrument.instrument,
      maintenanceType: MaintenanceProcedure.REPLACE_SHEATH,
      result: MaintenanceResult.SUCCESS,
    };
    const msg = { data: JSON.stringify(update) };

    await act(() => callback!(msg as MessageEvent));

    expect(
      await screen.queryByTestId(ReplaceFluidTestId.Modal("Sheath"))
    ).not.toBeInTheDocument();
  });
});
