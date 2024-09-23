import {
  InstrumentStatus,
  InstrumentStatusDto,
  InstrumentType,
} from "@viewpoint/api";
import {
  catDxOfflineStep1,
  catDxOfflineStep2,
  catDxOfflineStep3,
  catDxOfflineStep4,
  catDxOfflineText,
} from "../../../util/instrument-texts";
import {
  randomInstrumentDto,
  randomInstrumentStatus,
} from "@viewpoint/test-utils";
import { interceptRequestsForHomeScreen } from "../../../util/default-intercepts";

const catDxInstrumentStatusReady: InstrumentStatusDto = randomInstrumentStatus({
  instrumentStatus: InstrumentStatus.Ready,
  connected: true,
  instrument: randomInstrumentDto({
    id: 1,
    instrumentType: InstrumentType.CatalystDx,
    instrumentSerialNumber: "CAT001",
    supportsInstrumentScreen: true,
  }),
});

const catDxInstrumentStatusOffline: InstrumentStatusDto =
  randomInstrumentStatus({
    instrumentStatus: InstrumentStatus.Offline,
    connected: false,
    instrument: randomInstrumentDto({
      id: 2,
      instrumentType: InstrumentType.CatalystDx,
      instrumentSerialNumber: "CAT002",
    }),
  });

describe("CatDx Instruments screen", () => {
  beforeEach(() => {
    interceptRequestsForHomeScreen();
    cy.intercept("GET", "**/device/1/runs?", []);

    cy.intercept("GET", "**/pims/pending", []);

    cy.intercept("**/api/device/status", [catDxInstrumentStatusReady]);
    cy.intercept("**/api/device/*/status", catDxInstrumentStatusReady);
  });

  it("should allow navigation to instrument page from nav bar menu", () => {
    cy.visit("/");
    cy.getByTestId("nav-dropdown-button").click();
    cy.getByTestId("nav-popover").contains("Instruments").click();
    cy.getByTestId("header-left").should("contain.text", "Instruments");
    cy.contains("System").should("be.visible");
    cy.contains("Catalyst Dx").click({ force: true });
    cy.getByTestId("cat-dx-instrument-page-right-panel")
      .containedWithinTestId(
        "cat-dx-instrument-page-right-panel",
        "Quality Control"
      )
      .containedWithinTestId(
        "cat-dx-instrument-page-right-panel",
        "IDEXX Use Only"
      )
      .containedWithinTestId(
        "cat-dx-instrument-page-right-panel",
        "Transmit Logs"
      )
      .containedWithinTestId(
        "cat-dx-instrument-page-right-panel",
        "Software Version"
      )
      .containedWithinTestId(
        "cat-dx-instrument-page-right-panel",
        "Serial Number"
      )
      .containedWithinTestId(
        "cat-dx-instrument-page-right-panel",
        "Cancel Process"
      );
  });

  it("should allow user to remove offline instrument and return to home screen", () => {
    cy.intercept("GET", "**/pims/pending", []);
    cy.intercept("**/api/device/status", [catDxInstrumentStatusOffline]);
    cy.intercept("**/api/device/*/status", catDxInstrumentStatusOffline);

    cy.visit("/instruments");
    cy.contains("System").should("be.visible");
    cy.contains("Catalyst Dx").click({ force: true });
    cy.getByTestId("cat-dx-instrument-screen-main")
      .containedWithinTestId(
        "cat-dx-instrument-screen-main",
        "Catalyst Dx is Offline"
      )
      .containedWithinTestId(
        "cat-dx-instrument-screen-main",
        "On the Catalyst Dx analyzer, tap Tools to ensure the analyzer has an IP address."
      )
      .containedWithinTestId(
        "cat-dx-instrument-screen-main",
        "Follow these steps to reestablish the connection:"
      )
      .containedWithinTestId("cat-dx-instrument-screen-main", catDxOfflineText);
    cy.getByTestId("catd-dx-offline-follow-steps").containedWithinTestId(
      "catd-dx-offline-follow-steps",
      catDxOfflineStep1
    );
    cy.getByTestId("catd-dx-offline-follow-steps").containedWithinTestId(
      "catd-dx-offline-follow-steps",
      catDxOfflineStep2
    );
    cy.getByTestId("catd-dx-offline-follow-steps").containedWithinTestId(
      "catd-dx-offline-follow-steps",
      catDxOfflineStep3
    );
    cy.getByTestId("catd-dx-offline-follow-steps").containedWithinTestId(
      "catd-dx-offline-follow-steps",
      catDxOfflineStep4
    );
    cy.getByTestId("cat-dx-instrument-screen-main").containedWithinTestId(
      "cat-dx-instrument-screen-main",
      "If the IP address is present and the problem persists, please contact IDEXX Support."
    );
    cy.getByTestId("remove-button").click();
    cy.url().should("eq", `${Cypress.config().baseUrl}/`);
  });

  it("should allow navigation to IDEXX use only page", () => {
    cy.visit("/instruments");
    cy.contains("Catalyst Dx").click({ force: true });
    cy.contains("IDEXX Use Only").click();
    cy.getByTestId("title").should("contain.text", "IDEXX Use Only");
    cy.getByTestId("warning-text").should("be.visible");
    cy.contains("Scalars").should("be.visible");
    cy.getByTestId("scalars").should("be.visible");
    cy.contains("Offsets").should("be.visible");
    cy.getByTestId("offsets").should("be.visible");
    cy.contains("SDMA").should("be.visible");
    cy.getByTestId("SDMA").should("be.visible");
    cy.contains("Back").click();
    cy.getByTestId("header-left").should("contain.text", "Instruments");
  });

  it("should show password modal on attempt to update advanced settings", () => {
    cy.visit("/instruments");
    cy.contains("Catalyst Dx").click({ force: true });
    cy.contains("IDEXX Use Only").click();
    cy.contains("Update").click();
    cy.getByTestId("password-modal").should("be.visible");
    cy.getByTestId("password-modal").containedWithinTestId(
      "password-modal",
      "Warning: These options are advanced diagnostic functions that should be used only under the guidance of IDEXX Support personnel."
    );
    cy.contains("Cancel").click();
    cy.getByTestId("header-left").should("contain.text", "IDEXX Use Only");
  });
});
