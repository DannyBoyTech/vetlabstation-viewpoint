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

const vetAutoReadReady: InstrumentStatusDto = randomInstrumentStatus({
  instrument: randomInstrumentDto({
    instrumentType: InstrumentType.AutoReader,
  }),
  instrumentStatus: InstrumentStatus.Ready,
  connected: true,
});
const vetAutoReadOffline: InstrumentStatusDto = randomInstrumentStatus({
  instrument: randomInstrumentDto({
    instrumentType: InstrumentType.AutoReader,
  }),
  instrumentStatus: InstrumentStatus.Offline,
  connected: false,
});
describe("VetAutoRead instruments screen", () => {
  it("should allow navigation to instrument screen and show ready instrument", () => {
    cy.intercept("**/api/device/status", [vetAutoReadReady]);
    cy.intercept("**/api/device/*/status", vetAutoReadReady);
    cy.visit(`/instruments/${vetAutoReadReady.instrument.id}`);
    cy.containedWithinTestId("header-left", "Instruments");
    cy.containedWithinTestId("legacy-instrument-main", "VetAutoread");
    cy.containedWithinTestId("legacy-instrument-main", "Ready");
    cy.getByTestId("legacy-instrument-main")
      .find("img")
      .should("have.attr", "src")
      .and("match", viteAsset("VetAutoReader.png"));
    cy.containedWithinTestId("legacy-instrument-right-panel", "Serial Number");
  });

  it("should allow navigation to instrument screen and show offline instrument", () => {
    cy.intercept("**/api/device/status", [vetAutoReadOffline]);
    cy.intercept("**/api/device/*/status", vetAutoReadOffline);
    cy.visit(`/instruments/${vetAutoReadOffline.instrument.id}`);
    cy.containedWithinTestId("header-left", "Instruments");
    cy.containedWithinTestId("legacy-instrument-main", "VetAutoread");
    cy.containedWithinTestId("legacy-instrument-main", "Offline");
    cy.containedWithinTestId(
      "legacy-instrument-main",
      "VetAutoread is Offline"
    );
    cy.getByTestId("legacy-instrument-main")
      .find("img")
      .should("have.attr", "src")
      .and("match", viteAsset("VetAutoReader.png"));
    cy.containedWithinTestId("legacy-instrument-right-panel", "Serial Number");
    cy.getByTestId("remove-button").click();
    cy.url().should("eq", `${Cypress.config().baseUrl}/`);
  });
});
