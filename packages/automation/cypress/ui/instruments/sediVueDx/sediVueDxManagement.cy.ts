import {
  InstrumentStatus,
  InstrumentStatusDto,
  InstrumentType,
} from "@viewpoint/api";
import { svdxOfflineText } from "../../../util/instrument-texts";
import { viteAsset } from "../../../util/general-utils";
import { interceptRequestsForHomeScreen } from "../../../util/default-intercepts";
import {
  randomInstrumentDto,
  randomInstrumentStatus,
} from "@viewpoint/test-utils";

const sediVueDxReady: InstrumentStatusDto = randomInstrumentStatus({
  instrumentStatus: InstrumentStatus.Ready,
  connected: true,
  instrument: randomInstrumentDto({
    instrumentType: InstrumentType.SediVueDx,
  }),
});
const sediVueDxOffline: InstrumentStatusDto = randomInstrumentStatus({
  instrumentStatus: InstrumentStatus.Offline,
  connected: false,
  instrument: randomInstrumentDto({
    instrumentType: InstrumentType.SediVueDx,
  }),
});
describe("SediVue Dx Instrument Screen", () => {
  it("Should have all expected elements of Ready SediVue Dx instruments screen", () => {
    cy.intercept("**/api/device/status", [sediVueDxReady]);
    cy.intercept("**/api/device/*/status", sediVueDxReady);
    cy.visit(`/instruments/${sediVueDxReady.instrument.id}`);
    cy.getByTestId("instrument-image")
      .find("img")
      .should("have.attr", "src")
      .and("match", viteAsset("SediVueDx.png"));
    cy.getByTestId("svdx-maintenance-screen").containedWithinTestId(
      "svdx-maintenance-screen",
      "Cartridge Status"
    );
    cy.getByTestId("svdx-cart-status-gauge");
    cy.getByTestId("svdx-cart-status-remaining");
    cy.getByTestId("svdx-cart-status-lot-number");
    cy.getByTestId("svdx-cart-status-expire-date");
    cy.getByTestId("svdx-cart-status-install-date");
    cy.getByTestId("svdx-diagnostics-button").should("be.enabled");
    cy.getByTestId("svdx-qc-button").should("be.enabled");
    cy.getByTestId("svdx-settings-button").should("be.enabled");
    cy.getByTestId("svdx-power-down-button").should("be.enabled");
    cy.getByTestId("svdx-maintenance-screen")
      .containedWithinTestId("svdx-maintenance-screen", "SediVue Dx")
      .containedWithinTestId("svdx-maintenance-screen", "Ready");
    cy.getByTestId("maintenance-screen-right")
      .containedWithinTestId("maintenance-screen-right", "Software Version")
      .containedWithinTestId(
        "maintenance-screen-right",
        sediVueDxReady.instrument.softwareVersion
      )
      .containedWithinTestId("maintenance-screen-right", "Serial Number")
      .containedWithinTestId(
        "maintenance-screen-right",
        sediVueDxReady.instrument.instrumentSerialNumber
      )
      .containedWithinTestId("maintenance-screen-right", "IP Address");
  });

  it("should allow user to remove offline instrument and return to home screen", () => {
    interceptRequestsForHomeScreen();
    cy.intercept("**/api/device/status", [sediVueDxOffline]);
    cy.intercept("**/api/device/*/status", sediVueDxOffline);
    cy.visit(`/instruments/${sediVueDxOffline.instrument.id}`);
    cy.getByTestId("instrument-image")
      .find("img")
      .should("have.attr", "src")
      .and("match", viteAsset("SediVueDx.png"));
    cy.getByTestId("svdx-diagnostics-button").should("be.disabled");
    cy.getByTestId("svdx-qc-button").should("be.enabled");
    cy.getByTestId("svdx-settings-button").should("be.enabled");
    cy.getByTestId("svdx-power-on-button").should("be.enabled");
    cy.getByTestId("svdx-maintenance-screen")
      .containedWithinTestId("svdx-maintenance-screen", "SediVue Dx")
      .containedWithinTestId("svdx-maintenance-screen", "Offline")
      .containedWithinTestId("svdx-maintenance-screen", "SediVue Dx is Offline")
      .containedWithinTestId("svdx-maintenance-screen", svdxOfflineText);
    cy.getByTestId("maintenance-screen-right")
      .containedWithinTestId("maintenance-screen-right", "Software Version")
      .containedWithinTestId(
        "maintenance-screen-right",
        sediVueDxOffline.instrument.softwareVersion
      )
      .containedWithinTestId("maintenance-screen-right", "Serial Number")
      .containedWithinTestId(
        "maintenance-screen-right",
        sediVueDxOffline.instrument.instrumentSerialNumber
      )
      .containedWithinTestId("maintenance-screen-right", "IP Address")
      .containedWithinTestId("maintenance-screen-right", "--"); //IP address field blank when offline
    cy.getByTestId("remove-button").click();
    cy.url().should("eq", `${Cypress.config().baseUrl}/`);
  });
});
