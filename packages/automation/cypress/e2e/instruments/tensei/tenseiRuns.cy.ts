import { IrisInstrumentDto } from "../../../util/instrument-simulator";
import { startAndRunNewLabRequest } from "../../../util/tasks/common-steps";
import { ResultSet } from "../../../util/instrument-simulator/Results";

describe("Tensei run workflows", () => {
  let tenseiInstrument: IrisInstrumentDto;
  const resultSet: ResultSet = {
    results: [{ assay: { name: "RBC" }, value: "7.79" }],
    delayAmount: 500,
    postAcceptDelay: 100,
    acceptDelay: 100,
  };

  beforeEach(() => {
    cy.task("ivls:toggle-feature-flag", {
      flag: "TENSEI_CONNECTION",
      enabled: true,
    });
    cy.task("ivls:toggle-feature-flag", {
      flag: "TENSEI_RESULTS",
      enabled: true,
    });
    cy.task("iris:get-instruments", ["Tensei"]).then(([tensei]) => {
      tenseiInstrument = tensei;
      cy.task("iris:set-results", [{ instrumentId: tensei.id, resultSet }]);
    });
  });

  it(`can initiate a whole blood Tensei run and view its results and dot plots`, () => {
    startAndRunNewLabRequest([tenseiInstrument.instrumentSerialNumber], {
      runConfigurationCallbacks: {
        [tenseiInstrument.instrumentSerialNumber]: () => {
          cy.getByTestId("sample-type-select").select("Whole Blood");
        },
      },
    }).then((patientDetails) => {
      cy.getByTestId("recent-result-card")
        .contains(patientDetails.patientName, { timeout: 30000 })
        .should("be.visible")
        .click();
      cy.getByTestId("results-page-result-cell-RBC").should(
        "contain",
        "7.79 M/μL"
      );
      cy.getByTestId("dot-plot-RBC-graph").should("be.visible");
      cy.getByTestId("dot-plot-WBC-graph").should("be.visible");
    });
  });

  const NON_WB_SAMPLE_TYPES = ["Abdominal", "Synovial", "Thoracic", "Other"];

  for (const sampleType of NON_WB_SAMPLE_TYPES) {
    it(`can initiate a Tensei run for sample type ${sampleType} and view its results`, () => {
      startAndRunNewLabRequest([tenseiInstrument.instrumentSerialNumber], {
        runConfigurationCallbacks: {
          [tenseiInstrument.instrumentSerialNumber]: () => {
            cy.getByTestId("sample-type-select").select(sampleType);
          },
        },
      }).then((patientDetails) => {
        cy.getByTestId("recent-result-card")
          .contains(patientDetails.patientName, { timeout: 30000 })
          .should("be.visible")
          .click();
        cy.getByTestId("results-page-result-cell-RBC").should(
          "contain",
          "7.79 M/μL"
        );
      });
    });
  }
});
