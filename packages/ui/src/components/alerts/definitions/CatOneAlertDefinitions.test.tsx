import { describe, expect } from "vitest";
import { AlertDto, CatalystOneAlerts, InstrumentType } from "@viewpoint/api";
import { getCatOneAlertContent } from "./CatOneAlertDefinitions";
import {
  randomInstrumentDto,
  randomInstrumentStatus,
} from "@viewpoint/test-utils";
import { render } from "../../../../test-utils/test-utils";

describe("CatOne alerts", () => {
  const FORCE_RUN_CASES = [
    {
      alert: CatalystOneAlerts.INCORRECT_SLIDE_OR_REAGENT_IGNORABLE,
      duringRun: true,
    },
    {
      alert: CatalystOneAlerts.INCORRECT_SLIDE_OR_REAGENT_IGNORABLE,
      duringRun: false,
    },

    { alert: CatalystOneAlerts.INSUFFICIENT_PIPETTE_TIPS, duringRun: true },
    { alert: CatalystOneAlerts.INSUFFICIENT_PIPETTE_TIPS, duringRun: false },

    { alert: CatalystOneAlerts.MISSING_REAGENT_IGNORABLE, duringRun: true },
    { alert: CatalystOneAlerts.MISSING_REAGENT_IGNORABLE, duringRun: false },

    { alert: CatalystOneAlerts.PHBR_LOAD_ERROR_IGNORABLE, duringRun: true },
    { alert: CatalystOneAlerts.PHBR_LOAD_ERROR_IGNORABLE, duringRun: false },

    {
      alert: CatalystOneAlerts.SLIDE_REAGENT_MISMATCH_IGNORABLE,
      duringRun: true,
    },
    {
      alert: CatalystOneAlerts.SLIDE_REAGENT_MISMATCH_IGNORABLE,
      duringRun: false,
    },
  ];

  it.each(FORCE_RUN_CASES)(
    "alert $alert shows ignore button: $duringRun when during-run arg is $duringRun",
    async ({ alert, duringRun }) => {
      const alertDto: AlertDto = {
        name: alert,
        uniqueId: alert,
        args: { "during-run": duringRun },
      };

      const content = getCatOneAlertContent(
        randomInstrumentStatus({
          instrument: randomInstrumentDto({
            instrumentType: InstrumentType.CatalystOne,
          }),
        }),
        alertDto,
        () => {}
      );

      const { queryAllByRole } = render(<>{content}</>);
      const buttons = await queryAllByRole("button");
      if (duringRun) {
        expect(buttons.length).toEqual(1);
        expect(buttons[0]).toHaveTextContent("Ignore");
      } else {
        expect(buttons.length).toEqual(0);
      }
    }
  );
});
