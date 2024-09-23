import { startAndRunNewLabRequest } from "../util/tasks/common-steps";
import {
  getSerialNumberForIrisInstrument,
  IrisInstrumentType,
  IrisInstrumentTypeMappings,
} from "../util/tasks/task-utils";
import { INSTRUMENT_NAMES } from "../util/translation-utils";
import {
  IrisInstrumentDto,
  IrisInstruments,
} from "../util/instrument-simulator";
import { ResultSet } from "../util/instrument-simulator/Results";
import { FeatureFlagName } from "@viewpoint/api";

const DelayedResults: ResultSet = {
  results: [],
  delayAmount: 15000,
};

describe("Cancel analyzer run", () => {
  before(() => {
    cy.task("ivls:toggle-theia-flags", true);
    cy.task("ivls:toggle-feature-flag", {
      flag: FeatureFlagName.TENSEI_CONNECTION,
      enabled: true,
    });
  });

  const INSTRUMENTS: IrisInstruments[] = Object.values(IrisInstrumentType);

  for (const instrument of INSTRUMENTS) {
    it(`user can cancel an analyzer run for ${instrument} instruments`, () => {
      cy.intercept("POST", "**/instrumentRun/**/cancel").as("cancel");
      cy.task("iris:get-instruments", [instrument])
        .then(([irisInstrument]) => {
          cy.task("iris:set-results", [
            {
              instrumentId: irisInstrument.id,
              resultSet: DelayedResults,
            },
          ]);
          return startAndRunNewLabRequest(
            [
              getExecutableSerialNumberForIrisInstrument(
                irisInstrument,
                instrument
              ),
            ],
            {
              runConfigurationCallbacks: {
                [getExecutableSerialNumberForIrisInstrument(
                  irisInstrument,
                  instrument
                )]: () => {
                  if (instrument === "Theia") {
                    cy.getByTestId("sample-type-select").select("Ear Swab");
                  } else if (instrument === "Tensei") {
                    cy.getByTestId("sample-type-select").select("Whole Blood");
                  }
                },
              },
            }
          );
        })
        .then(({ patientName, labRequest }) => {
          // Cancel the instrument
          cy.getByTestId("in-process-card").should("be.visible");
          cy.getByTestId("in-process-card")
            .containedWithinTestId("in-process-card", patientName)
            .getByTestId("in-process-run")
            .contains(INSTRUMENT_NAMES[IrisInstrumentTypeMappings[instrument]])
            .click();
          cy.getByTestId("run-action-popover").contains("Cancel").click();
          cy.contains("Cancel").should("be.visible");
          cy.contains("Cancel").click();
          cy.contains("Yes").should("be.visible");
          cy.contains("Yes").click();
          cy.wait("@cancel");
          cy.containedWithinTestId("in-process-card", patientName).should(
            "not.exist"
          );
        });
    });
  }
});

export function getExecutableSerialNumberForIrisInstrument(
  instrument: IrisInstrumentDto,
  type: IrisInstruments
): string {
  if (type === IrisInstrumentType.SnapPro) {
    return "SnapPro";
  }
  return getSerialNumberForIrisInstrument(instrument);
}
