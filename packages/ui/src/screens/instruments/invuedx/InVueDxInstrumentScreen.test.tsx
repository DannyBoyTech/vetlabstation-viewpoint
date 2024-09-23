import { InVueDxInstrumentScreen, TestId } from "./InVueDxInstrumentScreen";
import {
  InstrumentStatus,
  InstrumentStatusDto,
  InstrumentType,
  MaintenanceProcedure,
} from "@viewpoint/api";
import {
  randomInstrumentDto,
  randomInstrumentStatus,
} from "@viewpoint/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "../../../../test-utils/test-utils";
import { waitFor, within } from "@testing-library/react";
import { TestId as InstrumentInfoTestId } from "../InstrumentInfo";
import { useNavigate } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { GlobalModalProvider } from "../../../components/global-modals/GlobalModals";
import { useExecuteMaintenanceProcedureMutation } from "../../../api/TheiaApi";

vi.mock("react-router-dom", async (origImport) => ({
  ...((await origImport()) as any),
  useNavigate: vi.fn(),
}));

vi.mock("../../../api/TheiaApi", async (actualImport) => {
  const orig = (await actualImport()) as any;
  return {
    ...orig,
    useExecuteMaintenanceProcedureMutation: vi.fn(
      orig.useExecuteMaintenanceProcedureMutation
    ),
  };
});

function getInstrumentScreen(instrumentStatusDto: InstrumentStatusDto) {
  return render(
    <GlobalModalProvider>
      <InVueDxInstrumentScreen instrumentStatusDto={instrumentStatusDto} />
    </GlobalModalProvider>
  );
}

describe("Test InVueDx instrument screen", () => {
  const useNavigateMock = vi.fn();
  const useExecuteMaintenanceProcedureMock = vi.fn();

  let instrumentStatusDto = randomInstrumentStatus();

  beforeEach(() => {
    vi.mocked(useNavigate).mockImplementation(() => useNavigateMock);
    vi.mocked(useExecuteMaintenanceProcedureMutation).mockImplementation(
      () => [useExecuteMaintenanceProcedureMock] as any
    );

    instrumentStatusDto = {
      instrumentStatus: InstrumentStatus.Ready,
      instrument: randomInstrumentDto({
        instrumentType: InstrumentType.Theia,
      }),
      connected: true,
    };
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("Test InVueDxInstrumentScreen image displayed", () => {
    const instrumentScreen = getInstrumentScreen(instrumentStatusDto);

    const instrumentImage = instrumentScreen.getByTestId("instrument-image");
    const img = within(instrumentImage).getByRole("img");
    expect(img).toHaveAttribute("src", expect.stringMatching(/\/Theia.png$/));
  });

  it.each([
    [InstrumentStatus.Ready, "Ready"],
    [InstrumentStatus.Busy, "Busy"],
    [InstrumentStatus.Alert, "Alert"],
  ])(
    "Test '%s' InVueDxInstrumentScreen has label '%s'",
    (instrumentStatus, expectedInstrumentStatusLabel) => {
      instrumentStatusDto.instrumentStatus = instrumentStatus;

      const instrumentScreen = getInstrumentScreen(instrumentStatusDto);

      const pills = Array.from(
        instrumentScreen.container.querySelectorAll(".spot-pill")
      );
      expect(pills).toHaveLength(1);

      const statusPill = pills[0];
      expect(statusPill).toHaveTextContent(expectedInstrumentStatusLabel);
    }
  );

  it.each([
    [TestId.MaintenanceButton],
    [TestId.DiagnosticsButton],
    [TestId.PowerDownButton],
  ])(`disables '%s' button when not connected`, (buttonId) => {
    instrumentStatusDto.connected = false;
    const instrumentScreen = getInstrumentScreen(instrumentStatusDto);
    const button = instrumentScreen.getByTestId(buttonId);
    expect(button).toBeDisabled();
  });

  it.each([
    [TestId.MaintenanceButton],
    [TestId.DiagnosticsButton],
    [TestId.PowerDownButton],
  ])(`enables '%s' button when connected`, (buttonId) => {
    instrumentStatusDto.connected = true;
    const instrumentScreen = getInstrumentScreen(instrumentStatusDto);
    const button = instrumentScreen.getByTestId(buttonId);
    expect(button).toBeEnabled();
  });

  it.each([
    [true, "Serial Number", "SN123", "SN123", "", ""],
    [true, "IP Address", "192.168.0.123", "", "192.168.0.123", ""],
    [true, "Software Version", "v1.0.0.1", "", "", "v1.0.0.1"],

    [false, "Serial Number", "SN123", "SN123", "", ""],
    [false, "IP Address", "--", "", "192.168.0.123", ""],
    [false, "Software Version", "v1.0.0.1", "", "", "v1.0.0.1"],
  ])(
    "Test InVueDxInstrumentScreen connected '%s' has setting '%s' value '%s'",
    (
      connected,
      propertyName,
      expectedPropertyValue,
      serialNumber,
      ipAddress,
      softwareVersion
    ) => {
      instrumentStatusDto.connected = connected;
      instrumentStatusDto.instrument.instrumentSerialNumber = serialNumber;
      instrumentStatusDto.instrument.ipAddress = ipAddress;
      instrumentStatusDto.instrument.softwareVersion = softwareVersion;

      const instrumentScreen = getInstrumentScreen(instrumentStatusDto);

      expect(
        instrumentScreen.getByTestId(
          InstrumentInfoTestId.InfoProperty(propertyName)
        )
      ).toHaveTextContent(expectedPropertyValue);
    }
  );

  describe("Power Down Button", () => {
    it("Check shutdown dialog is shown and hidden on confirmation", async () => {
      const instrumentScreen = getInstrumentScreen(instrumentStatusDto);

      const powerDownButton = instrumentScreen.getByTestId(
        TestId.PowerDownButton
      );
      await userEvent.click(powerDownButton);

      const powerDownModal = await waitFor(() =>
        instrumentScreen.getByTestId(TestId.ModalPowerDown)
      );
      expect(powerDownModal).toBeVisible();

      const powerDownModalButton =
        within(powerDownModal).getByTestId("done-button");
      await userEvent.click(powerDownModalButton);

      expect(useExecuteMaintenanceProcedureMock).toHaveBeenCalledWith({
        instrumentId: instrumentStatusDto.instrument.id,
        maintenanceProcedure: MaintenanceProcedure.SHUTDOWN,
      });

      expect(useNavigateMock).toHaveBeenCalledTimes(1);
      expect(useNavigateMock).toHaveBeenCalledWith("/");

      expect(powerDownModal).not.toBeVisible();
    });
  });

  describe("Maintenance Button", () => {
    it("Button leads to maintenance screen", async () => {
      const instrumentScreen = getInstrumentScreen(instrumentStatusDto);

      const maintenanceButton = instrumentScreen.getByTestId(
        TestId.MaintenanceButton
      );
      await userEvent.click(maintenanceButton);

      expect(useNavigateMock).toHaveBeenCalledTimes(1);
      expect(useNavigateMock).toHaveBeenCalledWith("maintenance");
    });
  });
});
