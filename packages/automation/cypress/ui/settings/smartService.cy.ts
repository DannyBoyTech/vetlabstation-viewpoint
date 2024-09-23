import { SmartServiceStatus } from "@viewpoint/api";

describe("SmartService", () => {
  beforeEach(() => {
    cy.intercept("**/api/smartService/enable", {}).as("enable");
    cy.intercept(
      "**/api/smartService/status",
      JSON.stringify(SmartServiceStatus.NOT_ACTIVATED)
    ).as("status");
  });

  it("should allow navigation to SmartService screen and perform an activation", () => {
    cy.visit("/settings");
    cy.wait("@status");
    //defaults to SmartService screen
    cy.getByTestId("idexx-trademark").should("be.visible");
    cy.getByTestId("how-help").should("be.visible");
    cy.getByTestId("image").should("be.visible");
    cy.getByTestId("cards").should("be.visible");
    //activation
    cy.get(".spot-button").contains("Activate").click();
    cy.getByTestId("tos-modal").should("be.visible");
    cy.contains("Close").should("be.enabled");
    cy.contains("I Agree").should("be.enabled");
    //escape the workflow
    cy.contains("Close").click();
    cy.getByTestId("tos-modal").should("not.exist");
    //complete activation workflow
    cy.get(".spot-button").contains("Activate").click();
    cy.contains("I Agree").click();
    cy.wait("@enable");
  });
});
