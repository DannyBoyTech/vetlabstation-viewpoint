import { viteAsset } from "../../../util/general-utils";
import { NextCatOneMaintenanceResultDto } from "../../../util/instrument-simulator";
import MaintenanceProcedure = NextCatOneMaintenanceResultDto.MaintenanceProcedure;

describe("Catalyst One alerts", () => {
  it("should show cleaning required alert and allow launching cleaning wizard", () => {
    cy.task("iris:get-instruments", ["Catalyst One"]).then(([catOne]) => {
      cy.task("iris:set-maintenance-result", {
        instrumentId: catOne.id,
        maintenanceProcedure: MaintenanceProcedure.GeneralClean,
        nextMaintenanceResult: { durationInMillis: 3000 },
      });
      // Send the fault
      cy.task("iris:send-catOne-fault", {
        instrumentId: catOne.id,
        fault: "CLEANING_REQUIRED",
      });
      cy.visit("/");
      // Click the instrument icon
      cy.getByTestId("displayed-instruments").contains("Catalyst One").click();
      // Verify alert modal presence and instrument image
      cy.getByTestId("alert-title")
        .should("be.visible")
        .contains("Cleaning Required");
      cy.getByTestId("alert-modal-side-bar-image")
        .find("img")
        .should("have.attr", "src")
        .and("match", viteAsset("CatOne.png"));
      cy.get(".spot-modal")
        .find("img")
        .should("have.attr", "src")
        .and("match", viteAsset("CatOne.png"));
      // Verify content
      cy.getByTestId("alert-modal-content").contains(
        "The Catalyst One Chemistry Analyzer requires cleaning. Follow the on-screen instructions found in the Catalyst One Instruments tab. If you continue to receive this error after cleaning, call IDEXX Support"
      );
      // Launch cleaning wizard
      cy.getByTestId("alert-action-button").contains("Clean").click();

      // First page
      cy.getByTestId("cleaning-wizard").should("be.visible");
      cy.getByTestId("wizard-next-button").click();
      // Second page
      cy.getByTestId("wizard-back-button")
        .should("be.visible")
        .should("be.enabled");
      cy.getByTestId("wizard-next-button").click();
      // Third page
      cy.getByTestId("wizard-back-button")
        .should("be.visible")
        .should("be.enabled");
      cy.getByTestId("wizard-next-button").click();
      // Fourth page
      cy.getByTestId("wizard-back-button")
        .should("be.visible")
        .should("be.enabled");
      cy.getByTestId("wizard-next-button").click();
      // Complete
      cy.contains("Your Catalyst One analyzer was cleaned successfully.", {
        timeout: 15000,
      }).should("be.visible");
    });
  });

  it("should show insufficient pipette tips alert", () => {
    cy.task("iris:get-instruments", ["Catalyst One"]).then(([catOne]) => {
      // Send fault
      cy.task("iris:send-catOne-fault", {
        instrumentId: catOne.id,
        fault: "INSUFFICIENT_PIPETTE_TIPS",
      });
      cy.visit("/");
      // Click instrument icon
      cy.getByTestId("displayed-instruments").contains("Catalyst One").click();

      // Verify alert modal presence and instrument image
      cy.getByTestId("alert-title")
        .should("be.visible")
        .contains("Insufficient Pipette Tips for Run");
      cy.getByTestId("alert-modal-side-bar-image")
        .find("img")
        .should("have.attr", "src")
        .and("match", viteAsset("CatOne.png"));
      cy.get(".spot-modal")
        .find("img")
        .should("have.attr", "src")
        .and("match", viteAsset("CatOne.png"));

      // Verify content
      cy.getByTestId("alert-modal-content").should(
        "contain.text",
        "There are not enough pipette tips for this run. To resolve, wait for the sample drawer to unlock then fill the tip section in the sample drawer and then press the Start button. If you do not add tips, the run will proceed but not all results will be reported."
      );
      // Minimize the alert with the x button in the header
      cy.getByTestId("alert-modal-content")
        .findByTestId("spot-modal-cancel-button")
        .click();
      cy.getByTestId("alert-modal-content").should("not.exist");
    });
  });

  it("should show Upgrade Available alert and allow user to ignore for now", () => {
    cy.task("iris:get-instruments", ["Catalyst One"]).then(([catOne]) => {
      // Send fault
      cy.task("iris:send-catOne-fault", {
        instrumentId: catOne.id,
        fault: "UPDATE_AVAILABLE",
      });
      cy.visit("/");
      // Click instrument icon
      cy.getByTestId("displayed-instruments").contains("Catalyst One").click();

      // Verify alert modal presence and instrument image
      cy.getByTestId("alert-title")
        .should("be.visible")
        .contains("Software upgrade version is ready to be installed.");
      cy.getByTestId("alert-modal-side-bar-image")
        .find("img")
        .should("have.attr", "src")
        .and("match", viteAsset("CatOne.png"));
      cy.get(".spot-modal")
        .find("img")
        .should("have.attr", "src")
        .and("match", viteAsset("CatOne.png"));

      // Verify content
      cy.getByTestId("alert-modal-content").contains(
        "You can upgrade the analyzer at any time by going to the Catalyst One instrument screen."
      );
      // Verify action buttons
      cy.containedWithinTestId("alert-action-button", "Upgrade Now").should(
        "be.enabled"
      );
      // Upgrade Later
      cy.getByTestId("alert-action-button").contains("Upgrade Later").click();

      //Instrument should be in a ready state now
      cy.getByTestId("alert-modal-content").should("not.exist");
      cy.getByTestId("analyzer-overview")
        .should("contain", "Catalyst One")
        .should("contain", "Ready");
    });
  });

  //parameterized test for acknowledge faults. Sends fault, checks title, click "OK" to clear.
  const alertTitleChecks = [
    { input: "ALG_DRY_READ_VARIANCE", title: "Processing Error" },
    { input: "BARCODE_READ_ERROR", title: "Barcode Read Error" },
    {
      input: "ERR_ALG_ALGORITHM_INTERFERING_SUBSTANCE",
      title: "Dilution Needed for CREA",
    },
  ];

  alertTitleChecks.forEach(({ input, title }) => {
    it(`should display expected text for ${input} alert`, () => {
      cy.task("iris:get-instruments", ["Catalyst One"]).then(([catOne]) => {
        // Send fault
        cy.task("iris:send-catOne-fault", {
          instrumentId: catOne.id,
          fault: input,
        });
        cy.visit("/");
        // Click instrument icon
        cy.getByTestId("displayed-instruments")
          .contains("Catalyst One")
          .click();
        cy.getByTestId("alert-title").should("be.visible").contains(title);
        cy.getByTestId("alert-action-button").click();
      });
    });
  });
});
