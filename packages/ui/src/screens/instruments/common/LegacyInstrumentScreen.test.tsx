import { describe, expect, it } from "vitest";
import { render } from "../../../../test-utils/test-utils";
import {
  randomInstrumentDto,
  randomInstrumentStatus,
} from "@viewpoint/test-utils";
import { InstrumentStatus, InstrumentType } from "@viewpoint/api";
import { LegacyInstrumentScreen, TestId } from "./LegacyInstrumentScreen";
import { screen } from "@testing-library/react";

describe("legacy instrument screen", () => {
  it("reflects instrument status", async () => {
    const status = randomInstrumentStatus({
      instrumentStatus: InstrumentStatus.Alert,
      instrument: randomInstrumentDto({
        instrumentType: InstrumentType.VetStat,
      }),
    });
    const { container, rerender } = render(
      <LegacyInstrumentScreen instrumentStatus={status} />
    );
    const statusPill = await container.querySelector(".spot-pill");
    expect(statusPill).toBeVisible();
    expect(statusPill).toHaveClass("spot-pill--negative");
    expect(statusPill).toHaveTextContent("Alert");

    rerender(
      <LegacyInstrumentScreen
        instrumentStatus={{
          ...status,
          instrumentStatus: InstrumentStatus.Ready,
        }}
      />
    );

    const updatedStatusPill = await container.querySelector(".spot-pill");
    expect(updatedStatusPill).toBeVisible();
    expect(updatedStatusPill).toHaveClass("spot-pill--positive");
    expect(updatedStatusPill).toHaveTextContent("Ready");
  });

  it("displays instrument serial number in side bar", async () => {
    const status = randomInstrumentStatus({
      instrument: randomInstrumentDto({
        instrumentType: InstrumentType.CoagDx,
        instrumentSerialNumber: "SER12345",
      }),
    });
    render(<LegacyInstrumentScreen instrumentStatus={status} />);
    const rightPanel = await screen.findByTestId(TestId.RightPanel);
    expect(rightPanel).toHaveTextContent("Serial Number");
    expect(rightPanel).toHaveTextContent("SER12345");
  });

  it("shows generic offline instructions for offline instrument", async () => {
    const status = randomInstrumentStatus({
      connected: false,
      instrumentStatus: InstrumentStatus.Offline,
      instrument: randomInstrumentDto({
        instrumentType: InstrumentType.CoagDx,
      }),
    });
    render(<LegacyInstrumentScreen instrumentStatus={status} />);
    const offlineInstructions = await screen.findByTestId(
      TestId.OfflineInstructions
    );
    expect(offlineInstructions).toBeVisible();
  });
});
