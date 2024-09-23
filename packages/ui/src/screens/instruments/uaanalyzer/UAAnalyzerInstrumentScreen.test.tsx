import { describe, it } from "vitest";
import {
  TestId,
  UAAnalyzerInstrumentScreen,
} from "./UAAnalyzerInstrumentScreen";
import { vi, beforeEach } from "vitest";
import {
  InstrumentStatus,
  InstrumentStatusDto,
  InstrumentType,
} from "@viewpoint/api";
import {
  randomFrom,
  randomInstrumentDto,
  randomInstrumentStatus,
} from "@viewpoint/test-utils";
import { useNavigate } from "react-router-dom";
import { render } from "../../../../test-utils/test-utils";
import { within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("react-router-dom", async (origImport) => ({
  ...((await origImport()) as any),
  useNavigate: vi.fn(),
}));

describe("UA Analyzer Instrument Screen", () => {
  const nav = vi.fn();
  let instrumentStatusDto: InstrumentStatusDto;

  beforeEach(() => {
    vi.mocked(useNavigate).mockImplementation(() => nav);

    const instrumentDto = randomInstrumentDto({
      instrumentType: InstrumentType.UAAnalyzer,
    });
    instrumentStatusDto = randomInstrumentStatus({ instrument: instrumentDto });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("should display instrument image", async () => {
    const screen = render(
      <UAAnalyzerInstrumentScreen instrumentStatus={instrumentStatusDto} />
    );

    const instrumentImage = screen.getByTestId("instrument-image");
    const img = await within(instrumentImage).findByRole("img");
    expect(img).toHaveAttribute(
      "src",
      expect.stringMatching(/\/UAAnalyzer.png$/)
    );
  });

  it("should display instrument status", () => {
    const instrumentStatus = randomFrom([
      InstrumentStatus.Ready,
      InstrumentStatus.Busy,
      InstrumentStatus.Alert,
    ]);
    instrumentStatusDto = randomInstrumentStatus({ instrumentStatus });
    const expectedStatus = (
      {
        [InstrumentStatus.Ready]: "Ready",
        [InstrumentStatus.Busy]: "Busy",
        [InstrumentStatus.Alert]: "Alert",
      } as any
    )[instrumentStatus];

    const { container } = render(
      <UAAnalyzerInstrumentScreen instrumentStatus={instrumentStatusDto} />
    );

    const pills = Array.from(container.querySelectorAll(".spot-pill"));
    expect(pills).toHaveLength(1);

    const statusPill = pills[0];
    expect(statusPill).toHaveTextContent(expectedStatus);
  });

  it("should display instrument serial number", () => {
    const screen = render(
      <UAAnalyzerInstrumentScreen instrumentStatus={instrumentStatusDto} />
    );

    const serialNumberElem = screen.getByTestId(
      TestId.InfoProperty("Serial Number")
    );

    expect(serialNumberElem).toHaveTextContent(
      instrumentStatusDto.instrument.instrumentSerialNumber
    );
  });

  it("should enable settings button when instrument is not busy", () => {
    instrumentStatusDto.instrumentStatus = InstrumentStatus.Ready;

    const screen = render(
      <UAAnalyzerInstrumentScreen instrumentStatus={instrumentStatusDto} />
    );

    const settingsButton = screen.getByRole("button", { name: "Settings" });

    expect(settingsButton).toBeEnabled();
  });

  it("should disable settings button when instrument is busy", () => {
    instrumentStatusDto.instrumentStatus = InstrumentStatus.Busy;

    const screen = render(
      <UAAnalyzerInstrumentScreen instrumentStatus={instrumentStatusDto} />
    );

    const settingsButton = screen.getByTestId(TestId.SettingsButton);

    expect(settingsButton).toBeDisabled();
  });

  it("should navigate when settings button is clicked", async () => {
    instrumentStatusDto.instrumentStatus = InstrumentStatus.Ready;

    const screen = render(
      <UAAnalyzerInstrumentScreen instrumentStatus={instrumentStatusDto} />
    );

    const settingsButton = screen.getByTestId(TestId.SettingsButton);
    await userEvent.click(settingsButton);

    expect(nav).toHaveBeenCalledTimes(1);
    expect(nav).toHaveBeenCalledWith("settings");
  });
});
