import {
  randomCatalystQualityControlDto,
  randomDetailedInstrumentStatus,
  randomInstrumentDto,
  randomInstrumentStatus,
} from "@viewpoint/test-utils";
import {
  HealthCode,
  InstrumentStatus,
  InstrumentStatusDto,
  InstrumentType,
} from "@viewpoint/api";
import { interceptRequestsForHomeScreen } from "../../../util/default-intercepts";

const catOneQcLots = [
  randomCatalystQualityControlDto({
    instrumentType: InstrumentType.CatalystOne,
    lotNumber: "LL077",
    enabled: true,
    canRun: true,
    controlType: "VetTrol",
  }),
];

const catOneInstrumentStatus: InstrumentStatusDto = randomInstrumentStatus({
  instrumentStatus: InstrumentStatus.Ready,
  connected: true,
  instrument: randomInstrumentDto({
    instrumentType: InstrumentType.CatalystOne,
    instrumentSerialNumber: "CAT001",
    supportsInstrumentScreen: true,
  }),
});

const catOneSmartQcResults = [
  {
    "@class": "com.idexx.labstation.core.dto.SmartQCRunRecordDto",
    runId: 101,
    runDate: 1713552733561,
    result: "PASS",
  },
  {
    "@class": "com.idexx.labstation.core.dto.SmartQCRunRecordDto",
    runId: 102,
    runDate: 1713447344582,
    result: "OUT_OF_RANGE",
  },
];

describe("cat one QC", () => {
  beforeEach(() => {
    interceptRequestsForHomeScreen();
    cy.intercept("**/api/device/status", [catOneInstrumentStatus]);
    cy.intercept(
      `**/api/device/${catOneInstrumentStatus.instrument.id}/status`,
      catOneInstrumentStatus
    );

    cy.intercept(
      { method: "GET", pathname: "**/qualityControl/catalyst/lots" },
      catOneQcLots
    );

    cy.intercept(
      {
        method: "GET",
        pathname: "**/api/device/*/runs",
      },
      []
    );

    cy.intercept("POST", "**/qualityControl", catOneQcLots);
  });

  it("should allow user to run QC and be returned to home screen", () => {
    cy.visit(`/instruments/${catOneInstrumentStatus.instrument.id}`);
    cy.contains("Maintenance").click();
    cy.getByTestId("maintenance-header").should("be.visible");
    cy.getByTestId("qc-buttons")
      .containedWithinTestId("qc-buttons", "Quality Control")
      .containedWithinTestId("qc-buttons", "Clean")
      .containedWithinTestId("qc-buttons", "Calibrate");
    cy.contains("Back");
    cy.contains("Quality Control").click();
    cy.getByTestId("qc-lots-main-page")
      .containedWithinTestId("qc-lots-main-page", "QC Lot")
      .containedWithinTestId("qc-lots-main-page", "QC Type")
      .containedWithinTestId("qc-lots-main-page", "Expiration Date")
      .containedWithinTestId("qc-lots-main-page", "Most Recent Results")
      .containedWithinTestId("qc-lots-main-page", "Quality Control Lots");
    cy.contains("LL077").click();
    cy.containedWithinTestId("catalyst-qc-page-right", "Run QC");
    cy.containedWithinTestId("catalyst-qc-page-right", "View All QC Results");
    cy.containedWithinTestId("catalyst-qc-page-right", "View Lot Results");
    cy.containedWithinTestId(
      "catalyst-qc-page-right",
      "View QC Lot Information"
    );
    cy.containedWithinTestId("catalyst-qc-page-right", "Back");
    cy.contains("Run QC").click();
    cy.containedWithinTestId("wizard-modal", "Catalyst One Quality Control");
    cy.contains("VetTrol Instructions").click();
    cy.containedWithinTestId(
      "confirm-modal",
      "Preparing VetTrol Control Fluid"
    );
    cy.contains("Done").click();
    cy.contains("Cleaning Instructions").click();
    cy.containedWithinTestId("cleaning-wizard", "Catalyst One Cleaning Guide");
    cy.contains("Cancel").click();
    cy.containedWithinTestId("wizard-modal", "Catalyst One Quality Control");
    cy.contains("Next").click();
    cy.contains("OK").click();
    cy.url().should("eq", `${Cypress.config().baseUrl}/`);
  });

  it("should allow viewing of QC results and show default text if no results", () => {
    cy.visit(`/instruments/${catOneInstrumentStatus.instrument.id}/qc`);
    cy.contains("LL077").click();
    cy.contains("View All QC Results").click();
    cy.getByTestId("qc-results-modal")
      .containedWithinTestId("qc-results-modal", "Quality Control Records")
      .containedWithinTestId("qc-results-modal", "Analyzer:")
      .containedWithinTestId("qc-results-modal", "Control:")
      .containedWithinTestId("qc-results-modal", "Lot:")
      .containedWithinTestId("qc-results-modal", "No results are available")
      .containedWithinTestId("qc-results-modal", "Date and Time")
      .containedWithinTestId("qc-results-modal", "Close")
      .containedWithinTestId("qc-results-modal", "View Results");
  });

  it("should allow viewing of specific lot results", () => {
    cy.visit(`/instruments/${catOneInstrumentStatus.instrument.id}/qc`);
    cy.contains("LL077").click();
    cy.contains("View Lot Results").click();
    cy.getByTestId("qc-results-modal")
      .containedWithinTestId("qc-results-modal", "Quality Control Records")
      .containedWithinTestId("qc-results-modal", "Analyzer:")
      .containedWithinTestId("qc-results-modal", "Control:")
      .containedWithinTestId("qc-results-modal", "Lot:")
      .containedWithinTestId("qc-results-modal", "Date and Time")
      .containedWithinTestId("qc-results-modal", "Close")
      .containedWithinTestId("qc-results-modal", "View Results");
  });

  it("should allow viewing of QC lot information", () => {
    cy.visit(`/instruments/${catOneInstrumentStatus.instrument.id}/qc`);
    cy.contains("LL077").click();
    cy.contains("View QC Lot Information").click();
    cy.getByTestId("modal")
      .containedWithinTestId("modal", "Catalyst One QC Lot Information")
      .containedWithinTestId("modal", "Lot:")
      .containedWithinTestId("modal", "QC Type:")
      .containedWithinTestId("modal", "Expiration:")
      .containedWithinTestId("modal", "Calibration Version:")
      .containedWithinTestId("modal", "Test")
      .containedWithinTestId("modal", "Expected Range");

    for (const range of catOneQcLots[0].qcReferenceRangeDtos) {
      cy.getByTestId("refRangeTable")
        .get("tr")
        .should("contain", range.assayDto.assayIdentityName)
        .and("contain", `${range.low} - ${range.high}`);
    }
  });

  it("should allow user to access SmartQC workflow and view results in table", () => {
    cy.intercept(
      { method: "GET", pathname: "**/api/featureFlag/CATONE_SMARTQC" },
      JSON.stringify(false)
    );
    cy.intercept(
      {
        method: "GET",
        pathname: `**/api/catOne/${catOneInstrumentStatus.instrument.id}/smartQC/runs`,
      },
      catOneSmartQcResults
    ).as("catOneSmartQCResults1");
    cy.intercept(
      {
        method: "POST",
        pathname: `**/api/qualityControl/${catOneInstrumentStatus.instrument.id}`,
      },
      []
    ).as("smartQCLabRequest1");
    cy.intercept(
      "**/labstation-webapp/api/instruments/*/status",
      randomDetailedInstrumentStatus({
        status: HealthCode.READY,
        instrument: catOneInstrumentStatus.instrument,
      })
    );
    cy.visit(`/instruments/${catOneInstrumentStatus.instrument.id}`);
    cy.contains("Maintenance").click();
    //No SmartQC button when CATONE_SMARTQC FF off
    cy.getByTestId("smartqc-button").should("not.exist");
    cy.intercept(
      { method: "GET", pathname: "**/api/featureFlag/CATONE_SMARTQC" },
      JSON.stringify(true)
    );
    cy.visit(`/instruments/${catOneInstrumentStatus.instrument.id}`);
    cy.contains("Maintenance").click();
    //SmartQC button visible when CATONE_SMARTQC FF on
    cy.getByTestId("smartqc-button").should("be.visible").click();
    cy.wait("@catOneSmartQCResults1");
    cy.contains("Catalyst One SmartQC");
    cy.getByTestId("run-smartqc").should("be.enabled");
    cy.getByTestId("back-button").should("be.enabled");
    cy.getByTestId("print-smartqc").should("be.visible");
    cy.contains("Pass");
    cy.contains("Out of Range");
    interceptRequestsForHomeScreen();
    cy.getByTestId("run-smartqc").click();
    cy.getByTestId("catone-smartqc-cleaning-modal")
      .should("be.visible")
      .getByTestId("done-button")
      .click();
    //user should be brought to home screen
    cy.url().should("eq", `${Cypress.config().baseUrl}/`);
  });
});
