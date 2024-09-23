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

const urisysDxReady: InstrumentStatusDto = randomInstrumentStatus({
  instrument: randomInstrumentDto({
    instrumentType: InstrumentType.UriSysDx,
  }),
  instrumentStatus: InstrumentStatus.Ready,
  connected: true,
});

const urisysDxBusy: InstrumentStatusDto = randomInstrumentStatus({
  instrument: randomInstrumentDto({
    instrumentType: InstrumentType.UriSysDx,
  }),
  instrumentStatus: InstrumentStatus.Busy,
  connected: true,
});

const urisysDxOffline: InstrumentStatusDto = randomInstrumentStatus({
  instrument: randomInstrumentDto({
    instrumentType: InstrumentType.UriSysDx,
  }),
  instrumentStatus: InstrumentStatus.Offline,
  connected: false,
});

const urisysDxSettings = {
  MANUAL_UA_AUTO_ADD: "true",
  UA_REPORTING_UNIT_TYPE: "Arbitrary",
  URISYS_DX_SAMPLE_PREP_INSTRUCTIONS_ENABLED: "true",
};

const calibrationRuns = [
  {
    runId: 93,
    runDate: 1711922391764,
    result: "FAIL",
  },
  {
    runId: 92,
    runDate: 1711922303337,
    result: "PASS",
  },
];

describe("UrisysDx instruments screen", () => {
  it("should allow navigation to urisysDx instruments screen and show a ready instrument", () => {
    cy.intercept("**/api/device/status", [urisysDxReady]);
    cy.visit(`/instruments/${urisysDxReady.instrument.id}`);
    cy.containedWithinTestId("header-left", "Instruments");
    cy.contains("UA Analyzer").click();
    cy.containedWithinTestId("ngua-screen-main", "UA Analyzer");
    cy.containedWithinTestId("ngua-screen-main", "Ready");
    cy.getByTestId("ngua-screen-main")
      .find("img")
      .should("have.attr", "src")
      .and("match", viteAsset("UriSysDx.png"));
    cy.containedWithinTestId("ngua-screen-right", "Calibration");
    cy.containedWithinTestId("ngua-screen-right", "Settings");
    cy.containedWithinTestId("ngua-screen-right", "Cancel Process");
    cy.containedWithinTestId("ngua-screen-right", "Initialize");
    cy.containedWithinTestId("ngua-screen-right", "Power Down");
    cy.containedWithinTestId("ngua-screen-right", "Software Version");
    cy.containedWithinTestId("ngua-screen-right", "IP Address");
    cy.containedWithinTestId(
      "ngua-screen-right",
      urisysDxReady.instrument.softwareVersion
    );
    cy.containedWithinTestId(
      "ngua-screen-right",
      urisysDxReady.instrument.instrumentSerialNumber
    );
    cy.containedWithinTestId(
      "ngua-screen-right",
      urisysDxReady.instrument.ipAddress
    );
  });

  it("should allow navigation to urisysDx instruments screen and show a busy instrument", () => {
    cy.intercept("**/api/device/status", [urisysDxBusy]);
    cy.visit(`/instruments/${urisysDxBusy.instrument.id}`);
    cy.containedWithinTestId("header-left", "Instruments");
    cy.contains("UA Analyzer").click();
    cy.containedWithinTestId("ngua-screen-main", "UA Analyzer");
    cy.containedWithinTestId("ngua-screen-main", "Busy");
    cy.contains("Calibration").should("be.enabled");
    cy.contains("Cancel Process").should("be.enabled");
    cy.contains("Settings").should("not.be.enabled");
    cy.contains("Initialize").should("not.be.enabled");
    cy.contains("Power Down").should("not.be.enabled");
  });

  it("should allow navigation to urisysDx instruments screen and show an offline instrument", () => {
    cy.intercept("**/api/device/status", [urisysDxOffline]);
    cy.visit(`/instruments/${urisysDxOffline.instrument.id}`);
    cy.containedWithinTestId("header-left", "Instruments");
    cy.contains("UA Analyzer").click();
    cy.containedWithinTestId("ngua-screen-main", "UA Analyzer");
    cy.containedWithinTestId("ngua-screen-main", "Offline");
    cy.containedWithinTestId("ngua-screen-main", "UA Analyzer is Offline");
    cy.containedWithinTestId(
      "ngua-screen-main",
      "The IDEXX VetLab Station is unable to communicate with the UA Analyzer. If this instrument is no longer in use, tap the Remove Instrument button to remove the icon from the home screen"
    );
    cy.getByTestId("remove-button").click();
    cy.url().should("eq", `${Cypress.config().baseUrl}/`);
  });

  it("should allow navigation to urisysDx settings screen and show applied settings", () => {
    cy.intercept("**/api/device/status", [urisysDxReady]);
    cy.intercept(
      `**/api/device/${urisysDxReady.instrument.id}/status`,
      urisysDxReady
    );
    cy.visit(`/instruments/${urisysDxReady.instrument.id}`);
    cy.intercept(
      "**/settings?setting=MANUAL_UA_AUTO_ADD&setting=URISYS_DX_SAMPLE_PREP_INSTRUCTIONS_ENABLED&setting=UA_REPORTING_UNIT_TYPE",
      urisysDxSettings
    );
    cy.containedWithinTestId("header-left", "Instruments");
    cy.contains("UA Analyzer").click();
    cy.contains("Settings").click();
    cy.getByTestId("header-left").should("contain", "UA Analyzer Settings");
    cy.containedWithinTestId("ngua-settings-screen", "Settings");
    cy.containedWithinTestId(
      "ngua-settings-screen",
      "Automatically add UA physical record icon to UA Analyzer runs"
    );
    cy.containedWithinTestId(
      "ngua-settings-screen",
      "Sample preparation instruction"
    );
    cy.containedWithinTestId("ngua-settings-screen", "Reporting Units");
    cy.containedWithinTestId("ngua-settings-screen", "Conventional: mg/dL");
    cy.containedWithinTestId("ngua-settings-screen", "Arbitrary: 1+, 2+");
    cy.containedWithinTestId("ngua-settings-screen", "SI: µmol/L");
    cy.containedWithinTestId(
      "ngua-settings-screen",
      "Conventional & Arbitrary: mg/dL(1+)"
    );
    cy.containedWithinTestId(
      "ngua-settings-screen",
      "SI & Arbitrary: µmol/L(1+)"
    );
    cy.contains("Back").click();
    cy.url().should(
      "eq",
      `${Cypress.config().baseUrl}/instruments/${urisysDxReady.instrument.id}`
    );
  });

  it("should allow navigation to urisysDx calibration screen and show historic calibration results", () => {
    cy.intercept("**/api/device/status", [urisysDxReady]);
    cy.intercept(
      `**/api/device/${urisysDxReady.instrument.id}/status`,
      urisysDxReady
    );
    cy.intercept(
      `**/api/uriSysDxQualityControl/${urisysDxReady.instrument.id}/runs`,
      calibrationRuns
    );
    cy.visit(`/instruments/${urisysDxReady.instrument.id}`);
    cy.contains("Calibration").click();
    cy.containedWithinTestId("header-left", "UA Analyzer Calibration");
    cy.containedWithinTestId("ngua-calibration-screen-main", "Calibration");
    cy.containedWithinTestId(
      "ngua-calibration-screen-main",
      `Analyzer: ${urisysDxReady.instrument.instrumentSerialNumber}`
    );
    cy.containedWithinTestId("ngua-calibration-screen-main", "Time");
    cy.containedWithinTestId("ngua-calibration-screen-main", "Results");
    cy.containedWithinTestId("ngua-calibration-screen-main", "Fail");
    cy.containedWithinTestId("ngua-calibration-screen-main", "Pass");
    cy.contains("3/31/24");
    cy.containedWithinTestId(
      "ngua-calibration-screen-main",
      `Analyzer: ${urisysDxReady.instrument.instrumentSerialNumber}`
    );
    cy.contains("Run Calibration");
    cy.contains("Back").click();
    cy.url().should("include", `/instruments/${urisysDxReady.instrument.id}`);
  });
  it("should allow navigation to urisysDx calibration screen and perform a calibration", () => {
    cy.intercept("**/api/device/status", [urisysDxReady]);
    cy.intercept(
      `**/api/device/${urisysDxReady.instrument.id}/status`,
      urisysDxReady
    );
    cy.intercept(
      `**/api/uriSysDxQualityControl/${urisysDxReady.instrument.id}/runs`,
      calibrationRuns
    );
    cy.visit(`/instruments/${urisysDxReady.instrument.id}`);
    cy.contains("Calibration").click();
    cy.containedWithinTestId("header-left", "UA Analyzer Calibration");
    cy.contains("Run Calibration").click();
    cy.getByTestId("global-confirm-modal").should("be.visible");
    cy.getByTestId("global-confirm-modal")
      .find("img")
      .should("have.attr", "src")
      .and("match", viteAsset("UriSysDx.png"));
    cy.containedWithinTestId("global-confirm-modal", "UA Analyzer");
    cy.containedWithinTestId(
      "global-confirm-modal",
      "Calibration Instructions"
    );
    cy.containedWithinTestId(
      "global-confirm-modal",
      "Load a new calibration strip into the UA tray."
    );
    cy.containedWithinTestId(
      "global-confirm-modal",
      "Press the Start button on the instrument."
    );
    cy.containedWithinTestId(
      "global-confirm-modal",
      "If the calibration fails, repeat calibration with new calibration strip. If the issue persists, please call IDEXX Support."
    );
    cy.contains("OK").click();
    cy.url().should("eq", `${Cypress.config().baseUrl}/`);
  });
});
