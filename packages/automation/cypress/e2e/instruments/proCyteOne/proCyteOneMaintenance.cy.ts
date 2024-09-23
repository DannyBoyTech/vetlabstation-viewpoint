describe("ProCyte One maintenance", () => {
  it("allows user to enter barcode for a replacement SmartQC vial", () => {
    cy.task("iris:get-instruments", ["Acadia Dx"]).then(([proCyteOne]) => {
      cy.visit("/");
      cy.getByTestId("instrument-bar-root").contains("ProCyte One").click();
      cy.getByTestId("pco-diagnostics-button").should("be.enabled").click();
      cy.get(".spot-button").contains("OK").click();
      cy.get(".spot-link").contains("Lot Entry").click();
      cy.get(".spot-form__radio-label").contains("SmartQC").click();
      cy.task("iris:send-maintenance-result", {
        instrumentId: proCyteOne.id,
        maintenanceResult: {
          procedure: "ReplaceOBC",
          result: "Success",
        },
      });
      cy.contains("The SmartQC vial was successfully replaced.")
        .as("toast")
        .should("be.visible");
      cy.get(".dismiss").click();
      cy.get("@toast").should("not.exist");
    });
  });

  it("should show Unable to Run Procedure pop up when rejected at instrument", () => {
    cy.task("iris:get-instruments", ["Acadia Dx"]).then(([proCyteOne]) => {
      cy.visit("/");
      cy.getByTestId("instrument-bar-root").contains("ProCyte One").click();
      cy.getByTestId("pco-diagnostics-button").should("be.enabled").click();
      cy.get(".spot-button").contains("OK").click();
      cy.task("iris:set-maintenance-result", {
        instrumentId: proCyteOne.id,
        maintenanceProcedure: "BleachClean",
        nextMaintenanceResult: { reject: true, durationInMillis: 1 },
      });
      cy.get(".spot-link").contains("Bleach Clean").click();
      cy.getByTestId("global-info-modal").should("be.visible");
      cy.containedWithinTestId(
        "global-info-modal",
        "This procedure cannot be run because another diagnostic procedure is in progress or the analyzer has an Alert."
      );
      cy.containedWithinTestId("global-info-modal", "ProCyte One");
      cy.containedWithinTestId("global-info-modal", "Unable to Run Procedure");
      cy.containedWithinTestId(
        "global-info-modal",
        "If the message persists, call IDEXX Support."
      );
      cy.getByTestId("done-button").should("be.visible");
      cy.getByTestId("done-button").click();
      cy.getByTestId("global-info-modal").should("not.exist");
    });
  });
});
