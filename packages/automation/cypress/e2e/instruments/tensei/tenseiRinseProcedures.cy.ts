import { NextTenseiMaintenanceResultDto } from "../../../util/instrument-simulator";
describe("Tensei Rinse Procedures", () => {
  it("allows user to view Flow Cell Rinse procedure modal and run procedure", () => {
    cy.task("iris:get-instruments", ["Tensei"]).then(([tenseiInstrument]) => {
      cy.task("iris:set-maintenance-result", {
        instrumentId: tenseiInstrument.id,
        maintenanceProcedure:
          NextTenseiMaintenanceResultDto.MaintenanceProcedure.FlowCellRinse,
        nextMaintenanceResult: { durationInMillis: 1000 },
      });
      cy.visit("/");
      cy.getByTestId("instrument-bar-root").contains("Tensei").click();
      cy.getByTestId("tensei-diagnostics-button").click();
      cy.getByTestId("flow-cell-rinse-link").click();
      //Confirm content of Flow Cell Rinse modal
      cy.getByTestId("confirm-modal").contains("Flow Cell Rinse");
      cy.getByTestId("done-button").contains("Cancel Rinse");
      //Confirm running procedure leaves you on the Tensei instrument screen
      cy.url().should("contain", `${Cypress.config().baseUrl}/instruments`);
    });
  });

  it("allows user to view Monthly Rinse procedure modal and run procedure", () => {
    cy.task("iris:get-instruments", ["Tensei"]).then(([tenseiInstrument]) => {
      cy.task("iris:set-maintenance-result", {
        instrumentId: tenseiInstrument.id,
        maintenanceProcedure:
          NextTenseiMaintenanceResultDto.MaintenanceProcedure.MonthlyRinse,
        nextMaintenanceResult: { durationInMillis: 1000 },
      });
      cy.visit("/");
      cy.getByTestId("instrument-bar-root").contains("Tensei").click();
      cy.getByTestId("tensei-diagnostics-button").click();
      cy.getByTestId("monthly-rinse-link").click();
      //Confirm content of Monthly Rinse modal
      cy.getByTestId("confirm-modal").contains("Monthly Rinse");
      cy.getByTestId("done-button").contains("Cancel Rinse");
      //Confirm running procedure leaves you on the Tensei instrument screen
      cy.url().should("contain", `${Cypress.config().baseUrl}/instruments`);
    });
  });

  it("allows user to view Waste Chamber Rinse procedure modal and run procedure", () => {
    cy.task("iris:get-instruments", ["Tensei"]).then(([tenseiInstrument]) => {
      cy.task("iris:set-maintenance-result", {
        instrumentId: tenseiInstrument.id,
        maintenanceProcedure:
          NextTenseiMaintenanceResultDto.MaintenanceProcedure.WasteChamberRinse,
        nextMaintenanceResult: { durationInMillis: 1000 },
      });
      cy.visit("/");
      cy.getByTestId("instrument-bar-root").contains("Tensei").click();
      cy.getByTestId("tensei-diagnostics-button").click();
      cy.getByTestId("waste-chamber-rinse-link").click();
      //Confirm content of Waste Chamber Rinse modal
      cy.getByTestId("confirm-modal").contains("Waste Chamber Rinse");
      cy.getByTestId("done-button").contains("Cancel Rinse");
      //Confirm running procedure leaves you on the Tensei instrument screen
      cy.url().should("contain", `${Cypress.config().baseUrl}/instruments`);
    });
  });

  it("allows user to cancel Flow Cell Rinse, Monthly Rinse, and Waste Chamber Rinse from modal", () => {
    cy.task("iris:get-instruments", ["Tensei"]).then(([tenseiInstrument]) => {
      // set next maintenance result Flow Cell Rinse
      cy.task("iris:set-maintenance-result", {
        instrumentId: tenseiInstrument.id,
        maintenanceProcedure:
          NextTenseiMaintenanceResultDto.MaintenanceProcedure.FlowCellRinse,
        nextMaintenanceResult: {
          durationInMillis: 1000,
          waitForStartButtonPress: true,
        },
      });
      // set next maintenance result Monthly Rinse
      cy.task("iris:set-maintenance-result", {
        instrumentId: tenseiInstrument.id,
        maintenanceProcedure:
          NextTenseiMaintenanceResultDto.MaintenanceProcedure.MonthlyRinse,
        nextMaintenanceResult: {
          durationInMillis: 1000,
          waitForStartButtonPress: true,
        },
      });
      // set next maintenance result Flow Cell Rinse
      cy.task("iris:set-maintenance-result", {
        instrumentId: tenseiInstrument.id,
        maintenanceProcedure:
          NextTenseiMaintenanceResultDto.MaintenanceProcedure.WasteChamberRinse,
        nextMaintenanceResult: {
          durationInMillis: 1000,
          waitForStartButtonPress: true,
        },
      });
      //Navigate to Diagnostics procedure menu
      cy.visit("/");
      cy.getByTestId("instrument-bar-root").contains("Tensei").click();
      cy.getByTestId("tensei-diagnostics-button").click();
      cy.getByTestId("flow-cell-rinse-link").click();
      //cancel Flow Cell Rinse
      cy.getByTestId("done-button").should("be.enabled").click();
      //user should remain on Diagnostics procedure screen
      cy.url().should(
        "match",
        new RegExp(`${Cypress.config().baseUrl}/instruments/.*/diagnostics`)
      );
      cy.getByTestId("monthly-rinse-link").click();
      //cancel Monthly Rinse
      cy.getByTestId("done-button").should("be.enabled").click();
      //user should remain on Diagnostics procedure screen
      cy.url().should(
        "match",
        new RegExp(`${Cypress.config().baseUrl}/instruments/.*/diagnostics`)
      );
      cy.getByTestId("waste-chamber-rinse-link").click();
      //cancel Waste Chamber Rinse
      cy.getByTestId("done-button").should("be.enabled").click();
      //user should remain on Diagnostics procedure screen
      cy.url().should(
        "match",
        new RegExp(`${Cypress.config().baseUrl}/instruments/.*/diagnostics`)
      );
    });
  });

  it("user should be able to view alert received during a procedure", () => {
    cy.task("iris:get-instruments", ["Tensei"]).then(([tenseiInstrument]) => {
      // set next maintenance result Flow Cell Rinse
      cy.task("iris:set-maintenance-result", {
        instrumentId: tenseiInstrument.id,
        maintenanceProcedure:
          NextTenseiMaintenanceResultDto.MaintenanceProcedure.FlowCellRinse,
        nextMaintenanceResult: {
          durationInMillis: 100,
          fault: "UNSPECIFIED_ALERT_SYSTEM",
        },
      });
      cy.visit("/");
      cy.getByTestId("instrument-bar-root").contains("Tensei").click();
      cy.getByTestId("tensei-diagnostics-button").click();
      cy.getByTestId("flow-cell-rinse-link").click();
      cy.getByTestId("confirm-modal").contains("Flow Cell Rinse");
      //Confirm running procedure leaves you on the Tensei instrument screen
      cy.url().should("contain", `${Cypress.config().baseUrl}/instruments`);
      //Tensei should be alerted
      cy.getByTestId("tensei-instruments-screen-content")
        .contains("Alert")
        .click();
      cy.getByTestId("alert-modal-content").contains(
        "Unspecified Fault Text System."
      );
    });
  });
});
