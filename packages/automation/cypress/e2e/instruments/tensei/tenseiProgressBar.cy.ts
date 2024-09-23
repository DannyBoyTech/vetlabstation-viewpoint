import { NextTenseiMaintenanceResultDto } from "../../../util/instrument-simulator";

describe("Tensei Progress Bar Removal", () => {
  it("allows user to confirm removal of Vertical Progress Bar when Last Progress Message is less than 100", () => {
    cy.task("iris:get-instruments", ["Tensei"]).then(([tenseiInstrument]) => {
      cy.task("iris:set-maintenance-result", {
        instrumentId: tenseiInstrument.id,
        maintenanceProcedure:
          NextTenseiMaintenanceResultDto.MaintenanceProcedure
            .DrainReactionChamber,
        nextMaintenanceResult: {
          durationInMillis: 5000,
          lastProgressValue: 90,
        },
      }),
        cy.visit("/");
      cy.getByTestId("instrument-bar-root").contains("Tensei").click();
      cy.getByTestId("tensei-diagnostics-button").click();
      cy.getByTestId("drain-reaction-chamber-link").click();
      //Confirm content of Drain Waste Chamber modal
      cy.getByTestId("reaction-chamber-modal").contains(
        "Drain Reaction Chamber"
      );
      cy.getByTestId("done-button").contains("OK").click();
      //Confirm running procedure leaves you on the Tensei instrument screen
      cy.url().should("contain", `${Cypress.config().baseUrl}/instruments`);
      //Navigate to IVLS Home screen
      cy.getByTestId("header-left").click();
      // Confirm progress bar is not longer visible when procedure completes
      cy.getByTestId("vertical-progress-bar").should("be.visible");
      cy.getByTestId("vertical-progress-bar").should("not.exist");
    });
  });
  it("allows user to confirm removal of Vertical Progress Bar when Last Progress Message is greater than 100", () => {
    cy.task("iris:get-instruments", ["Tensei"]).then(([tenseiInstrument]) => {
      cy.task("iris:set-maintenance-result", {
        instrumentId: tenseiInstrument.id,
        maintenanceProcedure:
          NextTenseiMaintenanceResultDto.MaintenanceProcedure.ClearPinchValve,
        nextMaintenanceResult: {
          durationInMillis: 5000,
          lastProgressValue: 101,
        },
      }),
        cy.visit("/");
      cy.getByTestId("instrument-bar-root").contains("Tensei").click();
      cy.getByTestId("tensei-diagnostics-button").click();
      cy.getByTestId("clear-pinch-valve-link").click();
      //Confirm content of Drain Waste Chamber modal
      cy.getByTestId("clear-pinch-valve-modal").contains("Clear Pinch Valve");
      cy.getByTestId("done-button").contains("OK").click();
      //Confirm running procedure leaves you on the Tensei instrument screen
      cy.url().should("contain", `${Cypress.config().baseUrl}/instruments`);
      //Navigate to IVLS Home screen
      cy.getByTestId("header-left").click();
      // Confirm progress bar is not longer visible when procedure completes
      cy.getByTestId("vertical-progress-bar").should("be.visible");
      cy.getByTestId("vertical-progress-bar").should("not.exist");
    });
  });
  it("allows user to confirm removal of Vertical Progress Bar when Last Progress Message contains unexpected characters", () => {
    cy.task("iris:get-instruments", ["Tensei"]).then(([tenseiInstrument]) => {
      cy.task("iris:set-maintenance-result", {
        instrumentId: tenseiInstrument.id,
        maintenanceProcedure:
          NextTenseiMaintenanceResultDto.MaintenanceProcedure.ResetAirPump,
        nextMaintenanceResult: {
          durationInMillis: 5000,
          lastProgressValue: 101.1,
        },
      }),
        cy.visit("/");
      cy.getByTestId("instrument-bar-root").contains("Tensei").click();
      cy.getByTestId("tensei-diagnostics-button").click();
      cy.getByTestId("reset-air-pump-link").click();
      //Confirm content of Drain Waste Chamber modal
      cy.getByTestId("reset-air-pump-modal").contains("Reset Air Pump");
      cy.getByTestId("done-button").contains("OK").click();
      //Confirm running procedure leaves you on the Tensei instrument screen
      cy.url().should("contain", `${Cypress.config().baseUrl}/instruments`);
      //Navigate to IVLS Home screen
      cy.getByTestId("header-left").click();
      // Confirm progress bar is not longer visible when procedure completes
      cy.getByTestId("vertical-progress-bar").should("be.visible");
      cy.getByTestId("vertical-progress-bar").should("not.exist");
    });
  });
  it("allows user to confirm removal of Vertical Progress Bar when Last Progress Message contains a negative integer", () => {
    cy.task("iris:get-instruments", ["Tensei"]).then(([tenseiInstrument]) => {
      cy.task("iris:set-maintenance-result", {
        instrumentId: tenseiInstrument.id,
        maintenanceProcedure:
          NextTenseiMaintenanceResultDto.MaintenanceProcedure
            .DrainReactionChamber,
        nextMaintenanceResult: {
          durationInMillis: 5000,
          lastProgressValue: -100,
        },
      }),
        cy.visit("/");
      cy.getByTestId("instrument-bar-root").contains("Tensei").click();
      cy.getByTestId("tensei-diagnostics-button").click();
      cy.getByTestId("drain-reaction-chamber-link").click();
      //Confirm content of Drain Waste Chamber modal
      cy.getByTestId("reaction-chamber-modal").contains(
        "Drain Reaction Chamber"
      );
      cy.getByTestId("done-button").contains("OK").click();
      //Confirm running procedure leaves you on the Tensei instrument screen
      cy.url().should("contain", `${Cypress.config().baseUrl}/instruments`);
      //Navigate to IVLS Home screen
      cy.getByTestId("header-left").click();
      // Confirm progress bar is not longer visible when procedure completes
      cy.getByTestId("vertical-progress-bar").should("be.visible");
      cy.getByTestId("vertical-progress-bar").should("not.exist");
    });
  });
  it("allows user to confirm removal of Vertical Progress Bar when Tensei does not send a Maintenance Result", () => {
    cy.task("iris:get-instruments", ["Tensei"]).then(([tenseiInstrument]) => {
      cy.task("iris:set-maintenance-result", {
        instrumentId: tenseiInstrument.id,
        maintenanceProcedure:
          NextTenseiMaintenanceResultDto.MaintenanceProcedure.AutoRinse,
        nextMaintenanceResult: {
          durationInMillis: 5000,
          sendMaintenanceResult: false,
        },
      }),
        cy.visit("/");
      cy.getByTestId("instrument-bar-root").contains("Tensei").click();
      cy.getByTestId("tensei-diagnostics-button").click();
      cy.getByTestId("auto-rinse-link").click();
      //Confirm content of Drain Waste Chamber modal
      cy.getByTestId("auto-rinse-modal").contains("Auto Rinse");
      cy.getByTestId("done-button").contains("OK").click();
      //Confirm running procedure leaves you on the Tensei instrument screen
      cy.url().should("contain", `${Cypress.config().baseUrl}/instruments`);
      //Navigate to IVLS Home screen
      cy.getByTestId("header-left").click();
      // Confirm progress bar is not longer visible when procedure completes
      cy.getByTestId("vertical-progress-bar").should("be.visible");
      cy.getByTestId("vertical-progress-bar").should("not.exist");
    });
  });
});
