import { InstrumentType } from "@viewpoint/api";
import { interceptRequestsForHomeScreen } from "../../util/default-intercepts";
import { randomInstrumentDto } from "@viewpoint/test-utils";

describe("connection approval requests", () => {
  beforeEach(() => {
    interceptRequestsForHomeScreen();

    // Return an instrument to indicate awaiting request approval
    const instrument = randomInstrumentDto({
      instrumentType: InstrumentType.ProCyteDx,
    });
    cy.intercept("GET", "**/api/device/awaitingApproval", [{ instrument }]).as(
      "connection-requests"
    );
    // Capture approval
    cy.intercept(
      { pathname: "**/api/device/*/approved", method: "POST" },
      {}
    ).as("connection-approval");

    // Go to the home page (doesn't really matter what page we're on)
    cy.visit("/");
    cy.wait("@connection-requests");

    // Verify modal is present
    cy.getByTestId("eula-modal").contains(
      "A new Information Processing Unit (IPU) has been detected. Please review and agree to the license agreement below."
    );
  });
  it("shows connection approval modal for ProCyte Dx and allows acceptance", () => {
    cy.getByTestId("eula-modal").find('[data-testid="done-button"]').click();

    cy.wait("@connection-approval")
      .its("request.url")
      .should("contain", "approved=true");
  });

  it("shows connection approval modal for ProCyte Dx and allows user to decline", () => {
    cy.getByTestId("eula-modal").find('[data-testid="later-button"]').click();

    cy.wait("@connection-approval")
      .its("request.url")
      .should("contain", "approved=false");
  });
});
