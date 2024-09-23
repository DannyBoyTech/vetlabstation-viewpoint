import { randomRecentResult } from "@viewpoint/test-utils";
import { interceptRequestsForHomeScreen } from "../../util/default-intercepts";

describe("complete runs", () => {
  const results = [randomRecentResult(), randomRecentResult()];
  beforeEach(() => {
    interceptRequestsForHomeScreen();
    cy.intercept(
      {
        method: "GET",
        pathname: "/labstation-webapp/api/result/recent",
        query: { days: "7" },
      },
      {
        body: results,
      }
    ).as("recentResults");

    cy.visit("/");
  });

  it("should display a card per result returned from API", () => {
    cy.getByTestId("recent-result-list")
      .find('[data-testid="recent-result-card"]')
      .should("have.length", 2);
  });

  it("should navigate to the result when a card is selected", () => {
    cy.getByTestId("recent-result-list")
      .find('[data-testid="recent-result-card"]')
      .first()
      .click();

    cy.url().should("contain", `/labRequest/${results[0].labRequestId}`);
  });
});
