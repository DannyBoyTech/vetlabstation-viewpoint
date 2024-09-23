import { describe, expect } from "vitest";
import { InstrumentStatus, InstrumentType } from "@viewpoint/api";
import {
  randomInstrumentDto,
  randomInstrumentStatus,
} from "@viewpoint/test-utils";
import { render } from "../../../../test-utils/test-utils";
import { CatOneInstrumentScreen } from "../catone/CatOneInstrumentsScreen";

describe("Upgrade Now button", () => {
  const CASES = [
    [InstrumentStatus.Ready, true],
    [InstrumentStatus.Busy, false],
    [InstrumentStatus.Standby, false],
    [InstrumentStatus.Alert, true],
  ] as const;

  it.each(CASES)(
    "for instrument status %s, 'upgrade now' button is enabled: %s",
    async (status, enabled) => {
      const instrumentStatus = randomInstrumentStatus({
        instrumentStatus: status,
        connected: true,
        instrument: randomInstrumentDto({
          instrumentStringProperties: { upgrade: "1.2.3" },
        }),
      });

      const { getByRole, getByTestId } = render(
        <CatOneInstrumentScreen instrument={instrumentStatus} />
      );

      const upgradeButton = getByRole("button", { name: "Upgrade Now" });
      expect(upgradeButton).toBeVisible();
      if (enabled) {
        expect(upgradeButton).toBeEnabled();
      } else {
        expect(upgradeButton).not.toBeEnabled();
      }
    }
  );
});
