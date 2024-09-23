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

const VetStatReady: InstrumentStatusDto = randomInstrumentStatus({
  instrument: randomInstrumentDto({
    instrumentType: InstrumentType.VetStat,
  }),
  instrumentStatus: InstrumentStatus.Ready,
  connected: true,
});
const VetStatOffline: InstrumentStatusDto = randomInstrumentStatus({
  instrument: randomInstrumentDto({
    instrumentType: InstrumentType.VetStat,
  }),
  instrumentStatus: InstrumentStatus.Offline,
  connected: false,
});
describe("VetStat instruments screen", () => {
  it("should allow navigation to VetStat instruments screen and show ready instrument", () => {
    cy.intercept("**/api/device/status", [VetStatReady]);
    cy.intercept("**/api/device/*/status", VetStatReady);
    cy.visit(`/instruments/${VetStatReady.instrument.id}`);
    cy.containedWithinTestId("header-left", "Instruments");
    cy.containedWithinTestId("legacy-instrument-main", "VetStat");
    cy.containedWithinTestId("legacy-instrument-main", "Ready");
    cy.getByTestId("legacy-instrument-main")
      .find("img")
      .should("have.attr", "src")
      .and("match", viteAsset("VetStat.png"));
    cy.containedWithinTestId("legacy-instrument-right-panel", "Serial Number");
  });

  it("should allow navigation to VetStat instruments screen and show offline instrument", () => {
    cy.intercept("**/api/device/status", [VetStatOffline]);
    cy.intercept("**/api/device/*/status", VetStatOffline);
    cy.visit(`/instruments/${VetStatOffline.instrument.id}`);
    cy.containedWithinTestId("header-left", "Instruments");
    cy.containedWithinTestId("legacy-instrument-main", "VetStat");
    cy.containedWithinTestId("legacy-instrument-main", "Offline");
    cy.containedWithinTestId("legacy-instrument-main", "VetStat is Offline");
    cy.getByTestId("legacy-instrument-main")
      .find("img")
      .should("have.attr", "src")
      .and("match", viteAsset("VetStat.png"));
    cy.containedWithinTestId("legacy-instrument-right-panel", "Serial Number");
    cy.getByTestId("remove-button").click();
    cy.url().should("eq", `${Cypress.config().baseUrl}/`);
  });
});
