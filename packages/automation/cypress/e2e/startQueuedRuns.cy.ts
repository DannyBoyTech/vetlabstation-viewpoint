import { startAndRunNewLabRequest } from "../util/tasks/common-steps";
import { ResultSet } from "../util/instrument-simulator/Results";

describe("start queued runs", () => {
  it("should not allow user to start a queued run if instrument is not yet available", () => {
    cy.task("iris:get-instruments", ["Acadia Dx"]).then(([proCyteOne]) => {
      // Set first run delay to 10 seconds
      const firstRunResults: ResultSet = {
        results: [{ assay: { name: "WBC" }, value: "1.0" }],
        delayAmount: 10000,
        postAcceptDelay: 2500,
      };
      cy.task("iris:set-results", [
        { instrumentId: proCyteOne.id, resultSet: firstRunResults },
      ]).then(() => {
        // start one LR
        startAndRunNewLabRequest([proCyteOne.instrumentSerialNumber])
          .then((firstPatient) =>
            startAndRunNewLabRequest([proCyteOne.instrumentSerialNumber], {
              allowSubmitWhenBusy: true,
            }).then((secondPatient) => ({
              firstPatient,
              secondPatient,
            }))
          )
          .then(({ firstPatient, secondPatient }) => {
            cy.containedWithinTestId(
              "in-process-card",
              secondPatient.patientName
            )
              .findByTestId("in-process-run")
              .click();

            //should not allow user to select start run for the second patient if instrument is unavailable
            cy.contains("Start Run").should(
              "have.css",
              "pointer-events",
              "none"
            );
            //wait for first instrument to finish run
            cy.containedWithinTestId(
              "in-process-card",
              firstPatient.patientName,
              { timeout: 15000 }
            ).should("not.exist");

            // Now run can be started
            cy.contains("Start Run")
              .should("not.have.css", "pointer-events", "none")
              .click();

            //wait for first instrument to finish run
            cy.containedWithinTestId(
              "in-process-card",
              secondPatient.patientName,
              { timeout: 15000 }
            ).should("not.exist");
          });
      });
    });
  });

  it("should allow user to start a queued run when instrument becomes available", () => {
    cy.task("iris:get-instruments", ["Acadia Dx"]).then(([proCyteOne]) => {
      // Set first run delay to 10 seconds
      const firstRunResults: ResultSet = {
        results: [{ assay: { name: "WBC" }, value: "1.0" }],
        delayAmount: 10000,
      };
      cy.task("iris:set-results", [
        { instrumentId: proCyteOne.id, resultSet: firstRunResults },
      ]).then(() => {
        startAndRunNewLabRequest([proCyteOne.instrumentSerialNumber])
          .then((firstPatient) =>
            startAndRunNewLabRequest([proCyteOne.instrumentSerialNumber], {
              allowSubmitWhenBusy: true,
            }).then((secondPatient) => ({ firstPatient, secondPatient }))
          )
          .then(({ firstPatient, secondPatient }) => {
            cy.location("pathname").should("eq", "/");

            //wait for first instrument to finish run
            cy.getByTestId("in-process-card")
              .contains(firstPatient.patientName)
              .should("not.exist");

            //start the queued run
            cy.containedWithinTestId(
              "in-process-card",
              secondPatient.patientName
            )
              .findByTestId("in-process-run")
              .click();
            cy.getByTestId("run-action-popover").contains("Start Run").click();

            //wait for the run to complete
            cy.getByTestId("in-process-card", { timeout: 15000 }).should(
              "not.exist"
            );
          });
      });
    });
  });
});
