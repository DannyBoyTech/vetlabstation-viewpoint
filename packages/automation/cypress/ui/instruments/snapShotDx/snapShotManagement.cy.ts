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

const snapShotDxReady: InstrumentStatusDto = randomInstrumentStatus({
  instrument: randomInstrumentDto({
    instrumentType: InstrumentType.SNAPshotDx,
  }),
  instrumentStatus: InstrumentStatus.Ready,
  connected: true,
});
const snapShotDxOffline: InstrumentStatusDto = randomInstrumentStatus({
  instrument: randomInstrumentDto({
    instrumentType: InstrumentType.SNAPshotDx,
  }),
  instrumentStatus: InstrumentStatus.Offline,
  connected: false,
});
describe("SNAPshot Dx instruments screen", () => {
  it("should allow navigation to snapshotdx instruments screen and show ready instrument", () => {
    cy.intercept("**/api/device/status", [snapShotDxReady]);
    cy.intercept("**/api/device/*/status", snapShotDxReady);
    cy.visit(`/instruments/${snapShotDxReady.instrument.id}`);
    cy.containedWithinTestId("header-left", "Instruments");
    cy.containedWithinTestId("ssdx-instrument-page-main", "SNAPshot Dx");
    cy.containedWithinTestId("ssdx-instrument-page-main", "Ready");
    cy.getByTestId("ssdx-instrument-page-main")
      .find("img")
      .should("have.attr", "src")
      .and("match", viteAsset("SNAPshotDx.png"));
    cy.containedWithinTestId("ssdx-instrument-page-right", "Transmit Logs");
    cy.containedWithinTestId("ssdx-instrument-page-right", "Software Version");
    cy.containedWithinTestId("ssdx-instrument-page-right", "Serial Number");
    cy.containedWithinTestId("ssdx-instrument-page-right", "Cancel Process");
  });

  it("should allow navigation to snapshotdx instruments screen and show offline instrument", () => {
    cy.intercept("**/api/device/status", [snapShotDxOffline]);
    cy.intercept("**/api/device/*/status", snapShotDxOffline);
    cy.visit(`/instruments/${snapShotDxOffline.instrument.id}`);
    cy.containedWithinTestId("header-left", "Instruments");
    cy.containedWithinTestId("ssdx-instrument-page-main", "SNAPshot Dx");
    cy.containedWithinTestId("ssdx-instrument-page-main", "Offline");
    cy.containedWithinTestId(
      "ssdx-instrument-page-main",
      "SNAPshot Dx is Offline"
    );
    cy.getByTestId("ssdx-instrument-page-main")
      .find("img")
      .should("have.attr", "src")
      .and("match", viteAsset("SNAPshotDx.png"));
    cy.containedWithinTestId("ssdx-instrument-page-right", "Transmit Logs");
    cy.containedWithinTestId("ssdx-instrument-page-right", "Software Version");
    cy.containedWithinTestId("ssdx-instrument-page-right", "Serial Number");
    cy.getByTestId("remove-button").click();
    cy.url().should("eq", `${Cypress.config().baseUrl}/`);
  });
});
