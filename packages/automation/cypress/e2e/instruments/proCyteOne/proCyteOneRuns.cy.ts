import { IrisInstrumentDto } from "../../../util/instrument-simulator";
import { startAndRunNewLabRequest } from "../../../util/tasks/common-steps";
import { ResultSet } from "../../../util/instrument-simulator/Results";

describe("ProCyte One run workflows", () => {
  let proCyteOneInstrument: IrisInstrumentDto;
  const resultSet: ResultSet = {
    results: [{ assay: { name: "RBC" }, value: "1.0" }],
    delayAmount: 100,
  };

  beforeEach(() => {
    cy.task("iris:get-instruments", ["Acadia Dx"]).then(([pco]) => {
      proCyteOneInstrument = pco;
      cy.task("iris:set-results", [{ instrumentId: pco.id, resultSet }]);
    });
  });

  it("can initiate a ProCyte One run and view its results", () => {
    startAndRunNewLabRequest([
      proCyteOneInstrument.instrumentSerialNumber,
    ]).then((patientDetails) => {
      cy.getByTestId("recent-result-card")
        .contains(patientDetails.patientName)
        .should("be.visible")
        .click();
      cy.getByTestId("results-page-result-cell-RBC").should(
        "contain",
        "1.00 M/μL"
      );

      cy.getByTestId("dot-plot-RBC-graph").should("be.visible");
      cy.getByTestId("dot-plot-WBC-graph").should("be.visible");
    });
  });
});
