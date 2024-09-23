import { TenseiInstrumentScreen, TestId } from "./TenseiInstrumentScreen";
import {
  InstrumentStatus,
  InstrumentStatusDto,
  InstrumentType,
} from "@viewpoint/api";
import {
  randomInstrumentDto,
  randomInstrumentStatus,
} from "@viewpoint/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "../../../../test-utils/test-utils";
import { within } from "@testing-library/react";
import { TestId as InstrumentInfoTestId } from "../InstrumentInfo";
import { useNavigate } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { GlobalModalProvider } from "../../../components/global-modals/GlobalModals";

vi.mock("react-router-dom", async (origImport) => ({
  ...((await origImport()) as any),
  useNavigate: vi.fn(),
}));

function getInstrumentScreen(instrumentStatusDto: InstrumentStatusDto) {
  return render(
    <GlobalModalProvider>
      <TenseiInstrumentScreen instrumentStatusDto={instrumentStatusDto} />
    </GlobalModalProvider>
  );
}

describe("Test Tensei instrument screen", () => {
  const useNavigateMock = vi.fn();

  let instrumentStatusDto = randomInstrumentStatus();

  beforeEach(() => {
    vi.mocked(useNavigate).mockImplementation(() => useNavigateMock);

    instrumentStatusDto = {
      instrumentStatus: InstrumentStatus.Ready,
      instrument: randomInstrumentDto({
        instrumentType: InstrumentType.Tensei,
      }),
      connected: true,
    };
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("Tensei Instrument screen instrument image displayed", () => {
    const instrumentScreen = getInstrumentScreen(instrumentStatusDto);

    const instrumentImage = instrumentScreen.getByTestId("instrument-image");
    const img = within(instrumentImage).getByRole("img");
    expect(img).toHaveAttribute("src", expect.stringMatching(/\/Crimson.png$/));
  });

  it.each([
    [InstrumentStatus.Ready, "Ready"],
    [InstrumentStatus.Busy, "Busy"],
    [InstrumentStatus.Alert, "Alert"],
  ])(
    "Tensei Instrument screen instrument with status as '%s'  has label '%s'",
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
    [InstrumentStatus.Ready, TestId.QCButton, true],
    [InstrumentStatus.Ready, TestId.DiagnosticsButton, true],
    [InstrumentStatus.Ready, TestId.SettingsButton, true],

    [InstrumentStatus.Busy, TestId.QCButton, true],
    [InstrumentStatus.Busy, TestId.DiagnosticsButton, false],
    [InstrumentStatus.Busy, TestId.SettingsButton, false],

    [InstrumentStatus.Alert, TestId.QCButton, true],
    [InstrumentStatus.Alert, TestId.DiagnosticsButton, false],
    [InstrumentStatus.Alert, TestId.SettingsButton, false],
  ])(
    "Tensei Instrument screen instrument with status '%s'  has button '%s' enabled '%s'",
    (instrumentStatus, selector, enabled) => {
      instrumentStatusDto.instrumentStatus = instrumentStatus;

      const instrumentScreen = getInstrumentScreen(instrumentStatusDto);

      const button = instrumentScreen.getByTestId(selector);
      if (enabled) {
        expect(button).toBeEnabled();
      } else {
        expect(button).toBeDisabled();
      }
    }
  );

  it.each([
    [true, "Serial Number", "SN123", "SN123", "", ""],
    [true, "IP Address", "192.168.0.123", "", "192.168.0.123", ""],
    [true, "Software Version", "v1.0.0.1", "", "", "v1.0.0.1"],

    [false, "Serial Number", "SN123", "SN123", "", ""],
    [false, "IP Address", "--", "", "192.168.0.123", ""],
    [false, "Software Version", "v1.0.0.1", "", "", "v1.0.0.1"],
  ])(
    "Tensei Instrument screen instrument connected '%s' has setting '%s' value '%s'",
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

  describe("Tensei Instrument screen with Diagnostics Button", () => {
    it("Button leads to diagnostics screen", async () => {
      const instrumentScreen = getInstrumentScreen(instrumentStatusDto);

      const diagnosticsButton = instrumentScreen.getByTestId(
        TestId.DiagnosticsButton
      );
      await userEvent.click(diagnosticsButton);

      expect(useNavigateMock).toHaveBeenCalledTimes(1);
      expect(useNavigateMock).toHaveBeenCalledWith("diagnostics");
    });
  });
});
