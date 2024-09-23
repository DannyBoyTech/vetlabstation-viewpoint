import { EventIds, InstrumentStatusDto } from "@viewpoint/api";
import { randomInstrumentStatus } from "@viewpoint/test-utils";
import { describe, vi } from "vitest";
import { ProCyteOneDiagnosticsScreen } from "./ProCyteOneDiagnosticsScreen";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useLocation, useNavigate } from "react-router-dom";
import { render } from "../../../../../test-utils/test-utils";
import { randomLocation } from "../../../../../test-utils/generators";
import {
  EventSourceProvider,
  useEventListener,
} from "../../../../context/EventSourceContext";
import {
  useCancelBleachCleanMutation,
  useRequestBleachCleanMutation,
  useRequestFlowCellSoakMutation,
  useRequestDrainMixChamberMutation,
  useRequestPrimeReagentMutation,
  useRequestPrimeSheathMutation,
  useRequestSystemFlushMutation,
} from "../../../../api/ProCyteOneMaintenanceApi";

vi.mock("react-router-dom", async (origImport) => {
  const origMod = (await origImport()) as object;
  return { ...origMod, useNavigate: vi.fn(), useLocation: vi.fn() };
});

vi.mock("../../../../api/ProCyteOneMaintenanceApi", async (origImport) => {
  const origMod = (await origImport()) as any;
  return {
    ...origMod,
    useCancelBleachCleanMutation: vi.fn(origMod.useCancelBleachCleanMutation),
    useRequestBleachCleanMutation: vi.fn(origMod.useRequestBleachCleanMutation),
    useRequestFlowCellSoakMutation: vi.fn(
      origMod.useRequestFlowCellSoakMutation
    ),
    useRequestDrainMixChamberMutation: vi.fn(origMod.useDrainMixChamberMutaion),
    useRequestPrimeReagentMutation: vi.fn(
      origMod.useRequestPrimeReagentMutation
    ),
    useRequestPrimeSheathMutation: vi.fn(origMod.useRequestPrimeSheathMutation),
    useRequestSystemFlushMutation: vi.fn(origMod.useRequestSystemFlushMutation),
  };
});

vi.mock("../../../../context/EventSourceContext", async (origImport) => {
  const origMod = (await origImport()) as any;
  return {
    ...origMod,
    useEventListener: vi.fn(origMod.useEventListener),
  };
});

describe("Procyte One maintenance screen", () => {
  let instrumentStatus: InstrumentStatusDto;
  const nav = vi.fn();
  const location = randomLocation({ state: {} });
  const cancelBleachClean = vi.fn();
  const requestFlowCellSoak = vi.fn();
  const requestBleachClean = vi.fn();
  const requestDrainMixChamber = vi.fn();
  const requestPrimeReagent = vi.fn();
  const requestPrimeSheath = vi.fn();
  const requestSystemFlush = vi.fn();

  let bleachCleanAcceptedListener: (msg: MessageEvent) => void;
  let bleachCleanProgressListener: (msg: MessageEvent) => void;

  const renderScreen = () => {
    render(
      <EventSourceProvider>
        <ProCyteOneDiagnosticsScreen instrument={instrumentStatus} />
      </EventSourceProvider>
    );
  };

  beforeEach(() => {
    instrumentStatus = randomInstrumentStatus();

    vi.mocked(useLocation).mockImplementation(() => ({
      ...location,
      state: { showWarning: false },
    }));

    vi.mocked(useNavigate).mockImplementation(() => nav);
    vi.mocked(useCancelBleachCleanMutation).mockImplementation(
      () => [cancelBleachClean] as any
    );
    vi.mocked(useRequestFlowCellSoakMutation).mockImplementation(
      () => [requestFlowCellSoak] as any
    );
    vi.mocked(useRequestBleachCleanMutation).mockImplementation(
      () => [requestBleachClean] as any
    );
    vi.mocked(useRequestDrainMixChamberMutation).mockImplementation(
      () => [requestDrainMixChamber] as any
    );
    vi.mocked(useRequestPrimeReagentMutation).mockImplementation(
      () => [requestPrimeReagent] as any
    );
    vi.mocked(useRequestPrimeSheathMutation).mockImplementation(
      () => [requestPrimeSheath] as any
    );
    vi.mocked(useRequestSystemFlushMutation).mockImplementation(
      () => [requestSystemFlush] as any
    );

    vi.mocked(useEventListener).mockImplementation((ev, fn) => {
      if (ev === EventIds.MaintenanceProcedureAccepted) {
        bleachCleanAcceptedListener = fn;
      }
      if (ev === EventIds.InstrumentProgress) {
        bleachCleanProgressListener = fn;
      }
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("should set location state with showWarning=true if not already true/false (initial render)", () => {
    vi.mocked(useLocation)
      .mockReset()
      .mockImplementation(() => ({
        ...location,
        state: {},
      }));

    renderScreen();

    expect(nav).toHaveBeenCalledTimes(1);
    expect(nav).toHaveBeenCalledWith("", {
      replace: true,
      state: { showWarning: true },
    });
  });

  it("should display a warning modal when showWarning is true", async () => {
    vi.mocked(useLocation)
      .mockReset()
      .mockImplementation(() => ({
        ...location,
        state: { showWarning: true },
      }));

    renderScreen();

    const modal = screen.getByTestId("confirm-modal");
    expect(modal).toBeVisible();

    const okButton = within(modal).getByText("OK");
    expect(okButton).toBeVisible();

    const cancelButton = within(modal).getByText("Cancel");
    expect(cancelButton).toBeVisible();
  });

  it("should set showWarning=false on warning modal confirm", async () => {
    vi.mocked(useLocation)
      .mockReset()
      .mockImplementation(() => ({
        ...location,
        state: { showWarning: true },
      }));

    renderScreen();

    const modal = await screen.getByTestId("confirm-modal");

    const okButton = await within(modal).getByText("OK");

    await userEvent.click(okButton);

    expect(nav).toHaveBeenCalledTimes(1);
    expect(nav).toHaveBeenCalledWith("", {
      replace: true,
      state: { showWarning: false },
    });
  });

  it("should navigate back if warning modal cancelled", async () => {
    vi.mocked(useLocation)
      .mockReset()
      .mockImplementation(() => ({
        ...location,
        state: { showWarning: true },
      }));

    renderScreen();

    const modal = await screen.getByTestId("confirm-modal");

    const cancelButton = await within(modal).getByText("Cancel");

    await userEvent.click(cancelButton);

    expect(nav).toHaveBeenCalledTimes(1);
    expect(nav).toBeCalledWith(-1);
  });

  it("should not dismiss warning modal if user clicks outside it", async () => {
    vi.mocked(useLocation)
      .mockReset()
      .mockImplementation(() => ({
        ...location,
        state: { showWarning: true },
      }));

    renderScreen();

    const modal = await screen.getByTestId("confirm-modal");

    expect(modal).toBeVisible();

    await userEvent.click(document.body);

    expect(modal).toBeVisible();
  });

  it("should show modal after click of 'Full System Prime'", async () => {
    renderScreen();

    let modal = await screen.queryByText("ProCyte One Full System Prime");

    expect(modal).not.toBeInTheDocument();

    const button = await screen.queryByText("Full System Prime");

    expect(button).toBeVisible();

    await userEvent.click(button!);

    modal = await screen.queryByText("ProCyte One Full System Prime");

    expect(modal).toBeVisible();
  });

  it("should show modal after click of 'Power Down'", async () => {
    renderScreen();

    let modal = await screen.queryByText("Warning");

    expect(modal).not.toBeInTheDocument();

    const button = await screen.queryByText("Power Down");

    expect(button).toBeVisible();

    await userEvent.click(button!);

    modal = await screen.queryByText("Warning");

    expect(modal).toBeVisible();
  });

  it("should show modal after click of 'Shut Down for Shipping'", async () => {
    renderScreen();

    let modal = await screen.queryByText("Warning");

    expect(modal).not.toBeInTheDocument();

    const button = await screen.queryByText("Shut Down for Shipping");

    expect(button).toBeVisible();

    await userEvent.click(button!);

    modal = await screen.queryByText("Warning");

    expect(modal).toBeVisible();
  });

  it("should request flow soak on click of 'Flow Cell Soak'", async () => {
    renderScreen();

    const button = await screen.findByText("Flow Cell Soak");

    await userEvent.click(button);

    expect(requestFlowCellSoak).toHaveBeenCalledTimes(1);
    expect(requestFlowCellSoak).toHaveBeenCalledWith(
      instrumentStatus.instrument.id
    );
  });

  it("should request prime reagent on click of 'Prime Reagent'", async () => {
    renderScreen();

    const button = await screen.findByText("Prime Reagent");

    await userEvent.click(button);

    expect(requestPrimeReagent).toHaveBeenCalledTimes(1);
    expect(requestPrimeReagent).toHaveBeenCalledWith(
      instrumentStatus.instrument.id
    );
  });

  it("should request prime sheath on click of 'Prime Sheath'", async () => {
    renderScreen();

    const button = await screen.findByText("Prime Sheath");

    await userEvent.click(button);

    expect(requestPrimeSheath).toHaveBeenCalledTimes(1);
    expect(requestPrimeSheath).toHaveBeenCalledWith(
      instrumentStatus.instrument.id
    );
  });

  it("should request system flush on click of 'System Flush'", async () => {
    renderScreen();

    const button = await screen.findByText("System Flush");

    await userEvent.click(button);

    expect(requestSystemFlush).toHaveBeenCalledTimes(1);
    expect(requestSystemFlush).toHaveBeenCalledWith(
      instrumentStatus.instrument.id
    );
  });

  it("should request bleach clean on click of 'Bleach Clean'", async () => {
    renderScreen();

    const button = await screen.findByText("Bleach Clean");

    await userEvent.click(button);

    expect(requestBleachClean).toHaveBeenCalledTimes(1);
    expect(requestBleachClean).toHaveBeenCalledWith(
      instrumentStatus.instrument.id
    );
  });

  it("should request flow soak on click of 'Flow Cell Soak'", async () => {
    renderScreen();

    const button = await screen.findByText("Flow Cell Soak");

    await userEvent.click(button);

    expect(requestFlowCellSoak).toHaveBeenCalledTimes(1);
    expect(requestFlowCellSoak).toHaveBeenCalledWith(
      instrumentStatus.instrument.id
    );
  });

  it("should request drain mix chamber on click of 'Drain Mix Chambers'", async () => {
    renderScreen();

    const button = await screen.findByText("Drain Mix Chambers");

    await userEvent.click(button);

    expect(requestDrainMixChamber).toHaveBeenCalledTimes(1);
    expect(requestDrainMixChamber).toHaveBeenCalledWith(
      instrumentStatus.instrument.id
    );
  });
});
