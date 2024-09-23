import {
  InstrumentStatus,
  InstrumentStatusDto,
  InstrumentType,
} from "@viewpoint/api";
import {
  randomInstrumentDto,
  randomInstrumentStatus,
  randomLabRequest,
  randomQualityControlDto,
  randomQualityControlRunRecordDto,
} from "@viewpoint/test-utils";
import { viteAsset } from "../../../util/general-utils";

const vetTestReady: InstrumentStatusDto = randomInstrumentStatus({
  instrument: randomInstrumentDto({
    instrumentType: InstrumentType.VetTest,
  }),
  instrumentStatus: InstrumentStatus.Ready,
  connected: true,
});
const vetTestOffline: InstrumentStatusDto = randomInstrumentStatus({
  instrument: randomInstrumentDto({
    instrumentType: InstrumentType.VetTest,
  }),
  instrumentStatus: InstrumentStatus.Offline,
  connected: false,
});

describe("VetTest instruments screen", () => {
  it("should allow navigation to vettest instruments screen and show ready instrument", () => {
    cy.intercept("**/device/status", [vetTestReady]);
    cy.intercept("**/device/*/status", vetTestReady);
    cy.visit(`/instruments/${vetTestReady.instrument.id}`);
    cy.containedWithinTestId("header-left", "Instruments");
    cy.containedWithinTestId("vetTest-instruments-page-main", "VetTest");
    cy.containedWithinTestId("vetTest-instruments-page-main", "Ready");
    cy.getByTestId("vetTest-instruments-page-main")
      .find("img")
      .should("have.attr", "src")
      .and("match", viteAsset("VetTest.png"));
    cy.containedWithinTestId("vetTest-instruments-page-right", "Serial Number");
    cy.containedWithinTestId(
      "vetTest-instruments-page-right",
      "Quality Control"
    );
  });

  it("should allow navigation to vettest instruments screen and show offline instrument", () => {
    cy.intercept("**/device/status", [vetTestOffline]);
    cy.intercept("**/device/*/status", vetTestOffline);
    cy.visit(`/instruments/${vetTestOffline.instrument.id}`);
    cy.containedWithinTestId("vetTest-instruments-page-main", "VetTest");
    cy.containedWithinTestId("vetTest-instruments-page-main", "Offline");
    cy.containedWithinTestId(
      "vetTest-instruments-page-main",
      "VetTest is Offline"
    );
    cy.getByTestId("vetTest-instruments-page-main")
      .find("img")
      .should("have.attr", "src")
      .and("match", viteAsset("VetTest.png"));
    cy.containedWithinTestId("vetTest-instruments-page-right", "Serial Number");
    cy.containedWithinTestId(
      "vetTest-instruments-page-right",
      "Quality Control"
    );
    cy.getByTestId("remove-button").click();
    cy.url().should("eq", `${Cypress.config().baseUrl}/`);
  });
});
