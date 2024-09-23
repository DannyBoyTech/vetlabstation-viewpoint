import {
  InstrumentStatus,
  InstrumentStatusDto,
  InstrumentType,
} from "@viewpoint/api";
import { viteAsset } from "../../../util/general-utils";
import {
  randomInstrumentDto,
  randomInstrumentStatus,
} from "@viewpoint/test-utils";

const CoagDxReady: InstrumentStatusDto = randomInstrumentStatus({
  instrument: randomInstrumentDto({
    instrumentType: InstrumentType.CoagDx,
  }),
  instrumentStatus: InstrumentStatus.Ready,
  connected: true,
});
const CoagDxOffline: InstrumentStatusDto = randomInstrumentStatus({
  instrument: randomInstrumentDto({
    instrumentType: InstrumentType.CoagDx,
  }),
  instrumentStatus: InstrumentStatus.Offline,
  connected: false,
});
describe("Coag Dx instruments screen", () => {
  it("should allow navigation to coag dx instruments screen and show ready instrument", () => {
    cy.intercept("**/api/device/status", [CoagDxReady]);
    cy.intercept("**/api/device/*/status", CoagDxReady);
    cy.visit(`/instruments/${CoagDxReady.instrument.id}`);
    cy.containedWithinTestId("header-left", "Instruments");
    cy.containedWithinTestId("legacy-instrument-main", "Coag Dx");
    cy.containedWithinTestId("legacy-instrument-main", "Ready");
    cy.getByTestId("legacy-instrument-main")
      .find("img")
      .should("have.attr", "src")
      .and("match", viteAsset("CoagDx.png"));
    cy.containedWithinTestId("legacy-instrument-right-panel", "Serial Number");
  });

  it("should allow navigation to coag dx instruments screen and show offline instrument", () => {
    cy.intercept("**/api/device/status", [CoagDxOffline]);
    cy.intercept("**/api/device/*/status", CoagDxOffline);
    cy.visit(`/instruments/${CoagDxOffline.instrument.id}`);
    cy.containedWithinTestId("header-left", "Instruments");
    cy.containedWithinTestId("legacy-instrument-main", "Coag Dx");
    cy.containedWithinTestId("legacy-instrument-main", "Offline");
    cy.containedWithinTestId("legacy-instrument-main", "Coag Dx is Offline");
    cy.getByTestId("legacy-instrument-main")
      .find("img")
      .should("have.attr", "src")
      .and("match", viteAsset("CoagDx.png"));
    cy.containedWithinTestId("legacy-instrument-right-panel", "Serial Number");
    cy.getByTestId("remove-button").click();
    cy.url().should("eq", `${Cypress.config().baseUrl}/`);
  });
});
