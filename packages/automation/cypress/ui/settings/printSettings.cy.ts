import { interceptRequestsForHomeScreen } from "../../util/default-intercepts";

import { SettingTypeEnum } from "@viewpoint/api";

const printSettings: { [key in SettingTypeEnum]?: string } = {
  AUTOPRINT_EXCEPTION_SNAPPRO: "true",
  PRINT_RESULT_REPORT_NATURAL_PAGEBREAK: "false",
  DEFAULT_PAPER_SIZE: "LETTER",
  AUTOPRINT_EXCEPTION_MANUALSNAP: "true",
  AUTOMATICALLY_PRINT: "true",
  PRINT_NUMBER_OF_COPIES: "1",
  DEFAULT_PRINTER: "CutePDF Writer",
};

describe("print settings", () => {
  beforeEach(() => {
    interceptRequestsForHomeScreen();
  });

  it("should allow a user to navigate to printing and show view previously made settings", () => {
    cy.intercept({ pathname: "**/api/settings", method: "GET" }, printSettings);
    cy.visit("/");
    cy.getByTestId("nav-dropdown-button").as("gearCog").click();
    cy.contains("Settings").click();
    cy.contains("Printing").click();
    cy.containedWithinTestId("header-left", "Settings");
    cy.containedWithinTestId("print-settings-screen", "Printing");
    cy.containedWithinTestId("print-settings-screen", "Auto Print Settings");
    cy.containedWithinTestId(
      "print-settings-screen",
      "Automatically print report when all tests are complete"
    );
    cy.containedWithinTestId(
      "print-settings-screen",
      "Do not auto print manual SNAP results"
    );
    cy.containedWithinTestId(
      "print-settings-screen",
      "Do not auto print SNAP Pro results"
    );
    cy.containedWithinTestId("print-settings-screen", "Number of Copies");
    cy.containedWithinTestId("print-settings-screen", "Default Printer");
    cy.containedWithinTestId("print-settings-screen", "Paper Format");
    cy.containedWithinTestId("print-settings-screen", "Letter");
    cy.containedWithinTestId("print-settings-screen", "A4");
    cy.containedWithinTestId("print-settings-screen", "Legal");
    cy.containedWithinTestId("print-settings-screen", "Page Break Options");
    cy.containedWithinTestId("print-settings-screen", "Natural Page Breaks");
    cy.getByTestId("auto-print-manual-snap").should("be.checked");
    cy.getByTestId("auto-print-reports").should("be.enabled");
    cy.getByTestId("auto-print-snap-pro").should("be.checked");
    cy.getByTestId("number-of-copies").find(":selected").contains("1");
    cy.getByTestId("header-left").as("goHome").click();
    cy.url().should("eq", `${Cypress.config().baseUrl}/`);
  });
});
