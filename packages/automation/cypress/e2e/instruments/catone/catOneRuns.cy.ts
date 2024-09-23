import { IrisInstrumentDto } from "../../../util/instrument-simulator";
import { startAndRunNewLabRequest } from "../../../util/tasks/common-steps";
import { ResultSet } from "../../../util/instrument-simulator/Results";

describe("Catalyst One run workflows", () => {
  let catOneInstrument: IrisInstrumentDto;
  const resultSet: ResultSet = {
    results: [{ assay: { name: "CREA" }, value: "1.0" }],
    delayAmount: 100,
  };

  beforeEach(() => {
    cy.task("iris:get-instruments", ["Catalyst One"]).then(([catOne]) => {
      catOneInstrument = catOne;
      cy.task("iris:set-results", [{ instrumentId: catOne.id, resultSet }]);
    });
  });

  it("can initiate a Catalyst One run and view its results", () => {
    startAndRunNewLabRequest([catOneInstrument.instrumentSerialNumber]).then(
      (patientDetails) => {
        cy.getByTestId("recent-result-card")
          .contains(patientDetails.patientName)
          .click();
        cy.getByTestId("results-page-result-cell-CREA").should(
          "contain",
          "1.0 mg/dL"
        );
      }
    );
  });

  it("can initiate a Catalyst One dilution run and verify the results applied the dilution factor", () => {
    startAndRunNewLabRequest([catOneInstrument.instrumentSerialNumber], {
      runConfigurationCallbacks: {
        [catOneInstrument.instrumentSerialNumber]: () => {
          cy.getByTestId("run-config-toggle-label-DILUTION").click();
          cy.getByTestId("add-button").click(); // One click ups the dilution to 1 + 3 = 4 total parts
          cy.get(".spot-button").contains("Save").click();
        },
      },
    }).then((patientDetails) => {
      cy.getByTestId("recent-result-card")
        .contains(patientDetails.patientName)
        .should("be.visible")
        .click();
      cy.getByTestId("results-page-result-cell-CREA").should(
        "contain",
        "1.0 mg/dL"
      );
      cy.contains(
        "Test results for the latest analyzer run have been multiplied by the dilution factor for a dilution of 1 in 4 total"
      ).should("be.visible");
    });
  });

  it("can initiate a Catalyst One UPC run and verify the results applied the dilution factor", () => {
    const upcResultSet: ResultSet = {
      results: [{ assay: { name: "UPC" }, value: "1.0" }],
    };

    cy.task("iris:set-results", [
      { instrumentId: catOneInstrument.id, resultSet: upcResultSet },
    ]);
    startAndRunNewLabRequest([catOneInstrument.instrumentSerialNumber], {
      runConfigurationCallbacks: {
        [catOneInstrument.instrumentSerialNumber]: () => {
          cy.getByTestId("run-config-toggle-label-UPC").click();
        },
      },
    }).then((patientDetails) => {
      cy.getByTestId("recent-result-card")
        .contains(patientDetails.patientName)
        .should("be.visible")
        .click();
      cy.getByTestId("results-page-result-cell-UPC").should("contain", "1.00");
      cy.contains(
        "UPC Ratio = urine protein divided by urine creatinine (UPRO/UCRE)"
      ).should("be.visible");
    });
  });
});
