import "@testing-library/cypress/add-commands";
import "@reportportal/agent-js-cypress/lib/commands/reportPortalCommands";
import "cypress-wait-until";

Cypress.Commands.add("getByTestId", (selector, ...args) =>
  cy.get(`[data-testid="${selector}"]`, ...args)
);

Cypress.Commands.add("getByTestIdContains", (selector, ...args) =>
  cy.get(`[data-testid^="${selector}"]`, ...args)
);

Cypress.Commands.add(
  "containedWithinTestId",
  { prevSubject: "optional" },
  (subject, testId: string, text, options) =>
    (subject ? cy.wrap(subject) : cy).contains(
      `[data-testid="${testId}"]`,
      text,
      options
    )
);

Cypress.Commands.add("nth", { prevSubject: "element" }, (subject, pos) => {
  return cy.wrap(subject).eq(pos);
});
