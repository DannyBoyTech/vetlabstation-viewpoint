import { NextSediVueDxMaintenanceResultDto } from "../../../util/instrument-simulator";

describe("SediVue Dx maintenance", () => {
  it("allows user to power down the SediVue Dx and then power it back on", () => {
    cy.task("iris:get-instruments", ["SediVue Dx"]).then(([svdxInstrument]) => {
      cy.task("iris:set-maintenance-result", {
        instrumentId: svdxInstrument.id,
        maintenanceProcedure:
          NextSediVueDxMaintenanceResultDto.MaintenanceProcedure.Shutdown,
        nextMaintenanceResult: { durationInMillis: 1000 },
      });
      cy.task("iris:set-maintenance-result", {
        instrumentId: svdxInstrument.id,
        maintenanceProcedure:
          NextSediVueDxMaintenanceResultDto.MaintenanceProcedure.Initialize,
        nextMaintenanceResult: { durationInMillis: 1000 },
      });
      cy.visit("/");
      cy.getByTestId("instrument-bar-root").contains("SediVue Dx").click();

      cy.getByTestId("svdx-power-down-button").should("be.enabled").click();
      cy.getByTestId("svdx-modal-power-down-button")
        .should("be.visible")
        .click();

      // Wait for instrument to go offline
      cy.getByTestId("instrument-bar-root").contains("SediVue Dx").click();
      cy.get(".spot-button").contains("Remove Instrument").should("be.visible");

      // Power it back on
      cy.getByTestId("svdx-power-on-button").click();

      // Wait for instrument to come back online
      cy.getByTestId("instrument-bar-root").contains("SediVue Dx").click();
      cy.get(".spot-button")
        .contains("Remove Instrument", { timeout: 30000 })
        .should("not.exist");
      cy.getByTestId("svdx-cart-status-gauge").should("be.visible");
    });
  });
});
