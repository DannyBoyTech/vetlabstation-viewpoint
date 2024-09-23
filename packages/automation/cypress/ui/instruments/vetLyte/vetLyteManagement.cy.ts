import {
  InstrumentStatus,
  InstrumentStatusDto,
  InstrumentType,
} from "@viewpoint/api";
import {
  randomInstrumentDto,
  randomInstrumentStatus,
} from "@viewpoint/test-utils";
import { viteAsset } from "../../../util/general-utils";

const vetLyteReady: InstrumentStatusDto = randomInstrumentStatus({
  instrument: randomInstrumentDto({
    instrumentType: InstrumentType.VetLyte,
  }),
  instrumentStatus: InstrumentStatus.Ready,
  connected: true,
});
const vetLyteOffline: InstrumentStatusDto = randomInstrumentStatus({
  instrument: randomInstrumentDto({
    instrumentType: InstrumentType.VetLyte,
  }),
  instrumentStatus: InstrumentStatus.Offline,
  connected: false,
});
describe("VetLyte instruments screen", () => {
  it("should allow navigation to vetlyte instruments screen and show ready instrument", () => {
    cy.intercept("**/api/device/status", [vetLyteReady]);
    cy.intercept("**/api/device/*/status", vetLyteReady);
    cy.visit(`/instruments/${vetLyteReady.instrument.id}`);
    cy.containedWithinTestId("header-left", "Instruments");
    cy.containedWithinTestId("legacy-instrument-main", "VetLyte");
    cy.containedWithinTestId("legacy-instrument-main", "Ready");
    cy.getByTestId("legacy-instrument-main")
      .find("img")
      .should("have.attr", "src")
      .and("match", viteAsset("VetLyte.png"));
    cy.containedWithinTestId("legacy-instrument-right-panel", "Serial Number");
  });

  it("should allow navigation to vetlyte instruments screen and show offline instrument", () => {
    cy.intercept("**/api/device/status", [vetLyteOffline]);
    cy.intercept("**/api/device/*/status", vetLyteOffline);
    cy.visit(`/instruments/${vetLyteOffline.instrument.id}`);
    cy.containedWithinTestId("header-left", "Instruments");
    cy.containedWithinTestId("legacy-instrument-main", "VetLyte");
    cy.containedWithinTestId("legacy-instrument-main", "Offline");
    cy.containedWithinTestId("legacy-instrument-main", "VetLyte is Offline");
    cy.getByTestId("legacy-instrument-main")
      .find("img")
      .should("have.attr", "src")
      .and("match", viteAsset("VetLyte.png"));
    cy.containedWithinTestId("legacy-instrument-right-panel", "Serial Number");
    cy.getByTestId("remove-button").click();
    cy.url().should("eq", `${Cypress.config().baseUrl}/`);
  });
});
