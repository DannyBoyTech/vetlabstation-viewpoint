import { InstrumentStatus, InstrumentType } from "@viewpoint/api";
import { interceptRequestsForHomeScreen } from "../../util/default-intercepts";
import {
  randomInstrumentDto,
  randomInstrumentStatus,
} from "@viewpoint/test-utils";

describe("home screen navigation", () => {
  beforeEach(() => {
    interceptRequestsForHomeScreen();
  });

  it("allows navigation to analyze sample screen", () => {
    cy.visit("/");

    cy.getByTestId("analyze-sample-button").click();

    cy.location("pathname").should("equal", "/analyzeSample");
  });

  it("allows user to navigate via the nav drop-down", () => {
    cy.visit("/");

    // Navigate to instruments page
    cy.getByTestId("nav-dropdown-button").click();
    cy.getByTestId("nav-popover").contains("Instruments").click();

    cy.url().should("contain", "/system");

    // Navigate to settings page
    cy.getByTestId("nav-dropdown-button").click();
    cy.getByTestId("nav-popover").contains("Settings").click();

    cy.url().should("contain", "/settings");

    // Navigate to help page
    cy.getByTestId("nav-dropdown-button").click();
    cy.getByTestId("nav-popover").contains("Help and Support").click();

    cy.url().should("contain", "/help");

    // Navigate to message center
    cy.getByTestId("nav-dropdown-button").click();
    cy.getByTestId("nav-popover").contains("Messages").click();

    cy.url().should("contain", "/messages");

    // go home
    cy.getByTestId("header-left").click();
    cy.url().should("eq", `${Cypress.config().baseUrl}/`);
  });

  it("allows navigation to instrument screen by selecting icon from the home screen", () => {
    const instruments = [
      randomInstrumentStatus({
        instrument: randomInstrumentDto({
          instrumentType: InstrumentType.CatalystOne,
        }),
        instrumentStatus: InstrumentStatus.Ready,
        connected: true,
      }),
      randomInstrumentStatus({
        instrument: randomInstrumentDto({
          instrumentType: InstrumentType.ProCyteOne,
        }),
        instrumentStatus: InstrumentStatus.Ready,
        connected: true,
      }),
      randomInstrumentStatus({
        instrument: randomInstrumentDto({
          instrumentType: InstrumentType.SediVueDx,
        }),
        instrumentStatus: InstrumentStatus.Ready,
        connected: true,
      }),
    ];
    cy.intercept("GET", "**/device/status", instruments).as("instrumentStatus");
    cy.visit("/");
    cy.wait("@instrumentStatus");

    cy.getByTestId("instrument-bar-root").contains("Catalyst One").click();

    cy.url().should("contain", `instruments/${instruments[0].instrument.id}`);
  });
});
