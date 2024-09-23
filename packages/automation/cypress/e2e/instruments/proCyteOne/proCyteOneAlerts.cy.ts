import { viteAsset } from "../../../util/general-utils";

describe("ProCyte One alerts", () => {
  it("should show Reagent Empty alert", () => {
    cy.task("iris:get-instruments", ["Acadia Dx"]).then(([ProCyteOne]) => {
      // Send the fault
      cy.task("iris:send-acadia-fault", {
        instrumentId: ProCyteOne.id,
        fault: "REAGENT_EMPTY",
      });
      cy.visit("/");

      // Click the instrument icon
      cy.getByTestId("displayed-instruments").contains("ProCyte One").click();
      // Verify alert modal presence and instrument image
      cy.getByTestId("alert-title")
        .should("be.visible")
        .contains("WARNING: Reagent is Empty");
      cy.getByTestId("alert-modal-side-bar-image")
        .find("img")
        .should("have.attr", "src")
        .and("match", viteAsset("AcadiaDx.png"));
      cy.get(".spot-modal")
        .find("img")
        .should("have.attr", "src")
        .and("match", viteAsset("AcadiaDx.png"));
      // Verify content
      cy.getByTestId("alert-modal-content").contains(
        "Your reagent pack is empty."
      );
      cy.getByTestId("alert-modal-content").contains(
        "To continue using your analyzer, tap Replace Reagent and follow the on-screen instructions."
      );
      // Replace the reagent
      cy.getByTestId("alert-action-button").contains("Replace Reagent").click();
      cy.getByTestId("done-button").click();
      cy.getByTestId("alert-modal-content").should("not.exist");
      cy.url().should("contain", `${Cypress.config().baseUrl}/instruments`);
    });
  });

  it("should show an Update Pending alert", () => {
    cy.task("iris:get-instruments", ["Acadia Dx"]).then(([ProCyteOne]) => {
      // Send the fault
      cy.task("iris:send-acadia-fault", {
        instrumentId: ProCyteOne.id,
        fault: "UPDATE_PENDING",
      });
      cy.visit("/");

      // Click the instrument icon
      cy.getByTestId("displayed-instruments").contains("ProCyte One").click();
      // Verify alert modal presence and instrument image
      cy.getByTestId("alert-title")
        .should("be.visible")
        .contains("Software upgrade version 1.0.0 is ready to be installed.");
      cy.getByTestId("alert-modal-side-bar-image")
        .find("img")
        .should("have.attr", "src")
        .and("match", viteAsset("AcadiaDx.png"));
      cy.get(".spot-modal")
        .find("img")
        .should("have.attr", "src")
        .and("match", viteAsset("AcadiaDx.png"));
      // Verify content
      cy.getByTestId("alert-modal-content").contains(
        "Please wait approximately 2 minutes while the ProCyte One analyzer is automatically upgraded and restarted."
      );
      cy.getByTestId("alert-modal-content").contains(
        "The process is complete when the ProCyte One returns to Ready."
      );
      cy.getByTestId("alert-modal-content")
        .findByTestId("spot-modal-cancel-button")
        .click();
      cy.getByTestId("alert-modal-content").should("not.exist");
      // Should be onthe instruments screen
      cy.url().should("contain", `${Cypress.config().baseUrl}/instruments`);
    });
  });

  it("should show a QC Reminder alert", () => {
    cy.task("iris:get-instruments", ["Acadia Dx"]).then(([ProCyteOne]) => {
      cy.task("iris:send-acadia-fault", {
        instrumentId: ProCyteOne.id,
        fault: "QC_REMINDER",
      });
      cy.visit("/");
      // Click the instrument icon
      cy.getByTestId("displayed-instruments").contains("ProCyte One").click();
      // Verify alert modal presence and instrument image
      cy.getByTestId("alert-title")
        .should("be.visible")
        .contains("Your SmartQC Will Expire Soon");
      cy.getByTestId("alert-modal-side-bar-image")
        .find("img")
        .should("have.attr", "src")
        .and("match", viteAsset("AcadiaDx.png"));
      cy.get(".spot-modal")
        .find("img")
        .should("have.attr", "src")
        .and("match", viteAsset("AcadiaDx.png"));
      // Verify content
      cy.getByTestId("alert-modal-content").contains(
        "The SmartQC vial will expire prior to your next scheduled automated QC run. Please replace it with a non-expired vial."
      );
      cy.getByTestId("alert-action-button").contains("OK").click();
      cy.getByTestId("alert-modal-content").should("not.exist");
      cy.getByTestId("analyzer-overview")
        .should("contain", "ProCyte One")
        .should("contain", "Ready");
    });
  });
});
