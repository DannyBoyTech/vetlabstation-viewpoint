import { IrisInstrumentDto } from "../../../util/instrument-simulator";
import { startAndRunNewLabRequest } from "../../../util/tasks/common-steps";
import { ResultSet } from "../../../util/instrument-simulator/Results";

describe("ProCyte Dx run workflows", () => {
  let proCyteInstrument: IrisInstrumentDto;
  const resultSet: ResultSet = {
    results: [{ assay: { name: "RBC" }, value: "1.0" }],
    delayAmount: 500,
    postAcceptDelay: 100,
    acceptDelay: 100,
  };

  beforeEach(() => {
    cy.task("iris:get-instruments", ["ProCyte Dx"]).then(([pdx]) => {
      proCyteInstrument = pdx;
      (proCyteInstrument as any).oldInstrumentSerialNumber =
        proCyteInstrument.instrumentSerialNumber;
      proCyteInstrument.instrumentSerialNumber = `${proCyteInstrument.mainUnitSerialNumber}${proCyteInstrument.instrumentSerialNumber}`;
      cy.task("iris:set-results", [{ instrumentId: pdx.id, resultSet }]);
    });
  });

  it(`can initiate a whole blood ProCyte Dx run and view its results and dot plots`, () => {
    startAndRunNewLabRequest([proCyteInstrument.instrumentSerialNumber]).then(
      (patientDetails) => {
        cy.getByTestId("recent-result-card")
          .contains(patientDetails.patientName, { timeout: 30000 })
          .should("be.visible")
          .click();
        cy.getByTestId("results-page-result-cell-RBC").should(
          "contain",
          "1.00 M/μL"
        );
        cy.getByTestId("dot-plot-RBC-graph").should("be.visible");
        cy.getByTestId("dot-plot-WBC-graph").should("be.visible");
      }
    );
  });

  const NON_WB_SAMPLE_TYPES = ["Abdominal", "Synovial", "Thoracic", "Other"];

  for (const sampleType of NON_WB_SAMPLE_TYPES) {
    it(`can initiate a ProCyte Dx run for sample type ${sampleType} and view its results`, () => {
      startAndRunNewLabRequest([proCyteInstrument.instrumentSerialNumber], {
        runConfigurationCallbacks: {
          [proCyteInstrument.instrumentSerialNumber]: () => {
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
          "1.00 M/μL"
        );
      });
    });
  }
});
