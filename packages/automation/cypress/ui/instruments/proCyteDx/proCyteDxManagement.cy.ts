import {
  InstrumentStatus,
  InstrumentStatusDto,
  InstrumentType,
  DetailedInstrumentStatusDto,
  HealthCode,
  ProCyteDxProcedure,
} from "@viewpoint/api";
import {
  randomInstrumentDto,
  randomInstrumentStatus,
} from "@viewpoint/test-utils";
import { viteAsset } from "../../../util/general-utils";
import { contains } from "cypress/types/jquery";

const fluidVolumes = "SUFFICIENT_VOLUME";

const reagents = [
  {
    name: "REA",
    lotNumber: "ZY2317",
    changedDate: 1683206061147,
    daysInUse: 1,
    isInUse: true,
  },
];

const pDxReady: InstrumentStatusDto = randomInstrumentStatus({
  instrumentStatus: InstrumentStatus.Ready,
  connected: true,
  instrument: {
    id: 1,
    maxQueueableRuns: 2,
    instrumentType: InstrumentType.ProCyteDx,
    supportedRunConfigurations: [],
    instrumentSerialNumber: "001",
    displayOrder: 1,
    softwareVersion: "1.4.5",
    supportsInstrumentScreen: true,
    ipAddress: "192.168.222.153",
    instrumentStringProperties: {
      "serial.mainunit": "ProCyteDx1",
      "serial.ipu": "IPU1",
    },
  },
});

const pDxOffline: InstrumentStatusDto = randomInstrumentStatus({
  instrumentStatus: InstrumentStatus.Offline,
  connected: false,
  instrument: {
    id: 2,
    maxQueueableRuns: 2,
    instrumentType: InstrumentType.ProCyteDx,
    supportedRunConfigurations: [],
    instrumentSerialNumber: "002",
    displayOrder: 1,
    softwareVersion: "1.4.5",
    supportsInstrumentScreen: true,
    instrumentStringProperties: {
      "serial.mainunit": "ProCyteDx2",
      "serial.ipu": "IPU2",
    },
  },
});
const eulaResponse = [
  {
    instrument: {
      instrumentType: "CRIMSON",
      ipAddress: "192.168.222.153",
      maxQueueableRuns: 2,
      supportedRunConfigurations: "SAMPLE_TYPE",
      supportsInstrumentScreen: true,
      supportsMultiRun: false,
      supportsQueuedRuns: true,
      suppressed: true,
    },
  },
];

const status: DetailedInstrumentStatusDto = {
  instrument: randomInstrumentDto({
    id: 1,
    instrumentType: InstrumentType.ProCyteDx,
    suppressed: false,
    supportsInstrumentScreen: true,
  }),
  status: HealthCode.READY,
};

describe("Instruments screen", () => {
  beforeEach(() => {
    cy.intercept("**/api/device/status", [pDxReady]);
    cy.intercept("**/api/device/*/status", pDxReady);
    cy.intercept("GET", "**/api/instruments/**/status", status);
    cy.intercept({
      method: "POST",
      pathname: "**/api/proCyte/1/procedure/execute",
      query: {
        instrumentProcedureRequest: ProCyteDxProcedure.MONTHLY_RINSE_REQUEST,
      },
    }).as("monthly-rinse");
    cy.intercept(
      "**/report/crimsonQualityReport?instrumentId=1&qualityControlId=1"
    ).as("trend-endpoint");
  });

  it("should allow navigation to ProCyte Dx instruments screen and show online instrument and eula", () => {
    cy.intercept("GET", "**/api/device/awaitingApproval", eulaResponse);
    cy.visit("/instruments/1");
    cy.getByTestId("eula-modal").should("exist");
    cy.contains("I Agree").click();
    cy.getByTestId("eula-modal").should("not.exist");
    cy.containedWithinTestId("pDx-instruments-screen-main", "ProCyte Dx");
    cy.containedWithinTestId("pDx-instruments-screen-main", "Ready");
    cy.getByTestId("pDx-instruments-screen-main")
      .find("img")
      .should("have.attr", "src")
      .and("match", viteAsset("Crimson.png"));
    cy.containedWithinTestId("pDx-instruments-screen-right", "Quality Control");
    cy.containedWithinTestId("pDx-instruments-screen-right", "Diagnostics");
    cy.containedWithinTestId("pDx-instruments-screen-right", "Settings");
    cy.containedWithinTestId("pDx-instruments-screen-right", "Set to Standby");
    cy.containedWithinTestId("pDx-instruments-screen-right", "Power Down");
    cy.getByTestId("instrument-info-prop-Software Version").should(
      "contain.text",
      ["1.4.5"]
    );
    cy.getByTestId("instrument-info-prop-Serial Number").should(
      "contain.text",
      ["ProCyteDx1"]
    );
    cy.getByTestId("instrument-info-prop-IPU Serial Number").should(
      "contain.text",
      ["IPU1"]
    );
    cy.getByTestId("instrument-info-prop-IP Address").should("contain.text", [
      "192.168.222.153",
    ]);
  });

  it("should allow navigation to ProCyte Dx instruments screen and show offline instrument", () => {
    cy.intercept("**/api/device/status", [pDxOffline]);
    cy.intercept("**/api/device/*/status", pDxOffline);
    cy.visit("/instruments/2");
    cy.containedWithinTestId("pDx-instruments-screen-main", "ProCyte Dx");
    cy.containedWithinTestId("pDx-instruments-screen-main", "Offline");
    cy.containedWithinTestId(
      "pDx-instruments-screen-main",
      "ProCyte Dx is Offline"
    );
    cy.getByTestId("pDx-instruments-screen-right")
      .containedWithinTestId("pDx-instruments-screen-right", "IP Address")
      .containedWithinTestId("pDx-instruments-screen-right", "--"); //IP address blank when offline
    cy.getByTestId("pDx-instruments-screen-main")
      .find("img")
      .should("have.attr", "src")
      .and("match", viteAsset("Crimson.png"));
    cy.getByTestId("remove-button").click();
    cy.url().should("eq", `${Cypress.config().baseUrl}/`);
  });

  it("should allow navigation to ProCyte Dx instruments screen and allow viewing Consumable Gauges and logs", () => {
    cy.visit("/instruments/1");
    cy.intercept("GET", "**/proCyte/1/reagents", reagents);
    cy.containedWithinTestId("pdx-procedures-root", "Procedures");
    cy.containedWithinTestId("pdx-procedures-root", "Up to Date");
    cy.containedWithinTestId(
      "pDx-instruments-screen-main",
      "Estimated Fluid Levels"
    );
    cy.getByTestId("pdx-view-reagent-logs-button").should("be.visible");
    cy.getByTestId("pdx-fluid-gauge-REAGENT").should("be.visible");
    cy.getByTestId("pdx-fluid-gauge-STAIN").should("be.visible");
    cy.getByTestId("pdx-fluid-info-REAGENT").should("be.visible");
    cy.getByTestId("pdx-fluid-info-STAIN").should("be.visible");
    cy.getByTestId("pdx-view-reagent-logs-button").click();
    cy.getByTestId("pdx-reagent-log-modal").should("be.visible");
    cy.containedWithinTestId("pdx-reagent-log-modal", "ProCyte Dx Reagent Log");
    cy.containedWithinTestId("pdx-reagent-log-modal", "Reagent");
    cy.containedWithinTestId("pdx-reagent-log-modal", "Lot");
    cy.containedWithinTestId("pdx-reagent-log-modal", "Changed Date");
    cy.containedWithinTestId("pdx-reagent-log-modal", "Days in Use");
    cy.containedWithinTestId("pdx-reagent-log-modal", "Kit");
    cy.containedWithinTestId("pdx-reagent-log-modal", "ProCyte Dx Reagent Log");
    cy.containedWithinTestId("pdx-reagent-log-modal", "ZY2317");
    cy.containedWithinTestId("pdx-reagent-log-modal", "5/04/23");
    cy.containedWithinTestId("pdx-reagent-log-modal", "Done");
    cy.get('[role="cell"]').eq(3).should("contain", "1");
    cy.contains("Done").click();
    cy.url().should("eq", `${Cypress.config().baseUrl}/instruments/1`);
  });

  it("should allow navigation to ProCyte Dx instruments screen and perform a reagent kit change", () => {
    cy.visit("/instruments/1");
    cy.contains("Change Kit").click();
    cy.containedWithinTestId("header-left", "ProCyte Dx Change Reagent Kit");
    cy.containedWithinTestId(
      "pdx-kit-stain-lot-entry",
      "Scan or enter a reagent kit bar code:"
    );
    cy.getByTestId("pdx-lot-entry-continue-button").should("be.visible");
    cy.getByTestId("pdx-lot-entry-cancel-button").should("be.visible");
    cy.intercept(
      "PUT",
      "**/api/proCyte/1/reagents/REAGENT/barcodes/validate",
      `"${fluidVolumes}"`
    );
    cy.getByTestId("pdx-lot-entry-input").type("TAT24K23ZG3G9Z0Z7GHWK3");
    cy.intercept("**/api/proCyte/1/reagents/REAGENT/replace", ["true"]);
    cy.getByTestId("pdx-lot-entry-continue-button").click();
    cy.getByTestId("pdx-lot-entry-result-modal-SUFFICIENT_VOLUME").should(
      "be.visible"
    );
    cy.containedWithinTestId(
      "pdx-lot-entry-result-modal-SUFFICIENT_VOLUME",
      "ProCyte Dx Change Reagent Kit"
    );
    cy.containedWithinTestId(
      "pdx-lot-entry-result-modal-SUFFICIENT_VOLUME",
      "Reagent appears to have sufficient volume."
    );
    cy.containedWithinTestId(
      "pdx-lot-entry-result-modal-SUFFICIENT_VOLUME",
      "To replace this reagent, tap Continue"
    );
    cy.containedWithinTestId(
      "pdx-lot-entry-result-modal-SUFFICIENT_VOLUME",
      "To use the existing reagent, tap Cancel."
    );
    cy.getByTestId("later-button").should("be.visible");
    cy.getByTestId("done-button").should("be.visible");
    cy.getByTestId("done-button").click();
    cy.getByTestId("wizard-modal").should("be.visible");
    cy.containedWithinTestId("wizard-modal", "ProCyte Dx Change Reagent Kit");
    // step 1
    cy.containedWithinTestId("wizard-modal", "Open New Kit");
    cy.containedWithinTestId("wizard-back-button", "Cancel");
    cy.containedWithinTestId("wizard-next-button", "Next");
    cy.getByTestId("wizard-next-button").click();
    // step 2
    cy.containedWithinTestId("wizard-modal", "Prep the Kit");
    cy.containedWithinTestId("wizard-back-button", "Back");
    cy.containedWithinTestId("wizard-next-button", "Next");
    cy.getByTestId("wizard-next-button").click();
    // step 3
    cy.containedWithinTestId("wizard-modal", "Install New Kit");
    cy.containedWithinTestId("wizard-back-button", "Back");
    cy.containedWithinTestId("wizard-next-button", "Next");
    cy.getByTestId("wizard-next-button").click();
    // step 4
    cy.containedWithinTestId("wizard-modal", "Dispose of Old Kit");
    cy.containedWithinTestId("wizard-back-button", "Back");
    cy.containedWithinTestId("wizard-next-button", "Done");
    cy.getByTestId("wizard-next-button").click();
    // return to PDX Instrument Screen
    cy.url().should("eq", `${Cypress.config().baseUrl}/instruments/1`);
  });

  it("should allow navigation to ProCyte Dx instruments screen and perform a stain kit change", () => {
    cy.visit("/instruments/1");
    cy.contains("Change Stain").click();
    cy.containedWithinTestId("header-left", "ProCyte Dx Change Stain Pack");
    cy.containedWithinTestId(
      "pdx-kit-stain-lot-entry",
      "Scan or enter a stain pack bar code:"
    );
    cy.getByTestId("pdx-lot-entry-continue-button").should("be.visible");
    cy.getByTestId("pdx-lot-entry-cancel-button").should("be.visible");
    cy.intercept(
      "PUT",
      "**/api/proCyte/1/reagents/STAIN/barcodes/validate",
      `"${fluidVolumes}"`
    );
    cy.getByTestId("pdx-lot-entry-input").type("Z6Y0DUX3ZG2ECZ0Z7FQVJU");
    cy.intercept("**/api/proCyte/1/reagents/STAIN/replace", ["true"]);
    cy.getByTestId("pdx-lot-entry-continue-button").click();
    cy.getByTestId("pdx-lot-entry-result-modal-VALID").should("be.visible");
    cy.containedWithinTestId(
      "pdx-lot-entry-result-modal-VALID",
      "ProCyte Dx Change Stain Pack"
    );
    cy.containedWithinTestId(
      "pdx-lot-entry-result-modal-VALID",
      "Connect stain pack, then tap OK to complete the update."
    );
    cy.getByTestId("later-button").should("be.visible");
    cy.getByTestId("done-button").should("be.visible");
    cy.getByTestId("done-button").click();
    // return to PDX Instrument Screen
    cy.url().should("eq", `${Cypress.config().baseUrl}/instruments/1`);
  });

  it("should guide a user through the shutdown for shipping process using the wizard", () => {
    cy.visit("/instruments/1");
    cy.intercept({
      method: "POST",
      pathname: "**/api/proCyte/1/procedure/execute",
      query: {
        instrumentProcedureRequest: ProCyteDxProcedure.SHUTDOWN_FOR_SHIPPING,
      },
    }).as("drain");
    cy.intercept({
      method: "POST",
      pathname: "**/api/proCyte/1/procedure/execute",
      query: {
        instrumentProcedureRequest: ProCyteDxProcedure.REAGENT_STATUS_QUERY,
      },
    }).as("reagent-status");
    cy.contains("Diagnostics").click();
    cy.contains("Shut Down for Shipping").click();
    cy.getByTestId("wizard-modal")
      .find("img")
      .should("have.attr", "src")
      .and("match", viteAsset("Crimson.png"));
    cy.containedWithinTestId(
      "wizard-modal",
      "ProCyte Dx Shutdown for Shipping Guide"
    );
    cy.containedWithinTestId("wizard-modal", "Important Notes");
    cy.contains(
      "This protocol should be performed only when returning your analyzer to IDEXX"
    ).should("be.visible");
    cy.contains(
      "This procedure will take approximately 40 minutes; all fluids will be drained from the analyzer."
    ).should("be.visible");
    cy.contains("Cancel").should("be.enabled");
    cy.contains("Next").click();
    cy.containedWithinTestId(
      "wizard-modal",
      "ProCyte Dx Shutdown for Shipping Guide"
    );
    cy.getByTestId("wizard-modal")
      .find("img")
      .should("have.attr", "src")
      .and("match", viteAsset("tube_adapter.png"));
    cy.containedWithinTestId("wizard-modal", "Remove Tube Adapter");
    cy.contains(
      "Open sample drawer and remove the tube adapter so that it can be used with the replacement analyzer."
    ).should("be.visible");
    cy.contains("To Remove the Tube Adapter:");
    cy.contains(
      "If the sample drawer is not open, press the Open/Close button on the ProCyte Dx analyzer to open the sample drawer"
    ).should("be.visible");
    cy.contains(
      "Turn the sample tube adapter to the left (45°) until the red mark on the adapter and the red mark in the sample position area of the drawer line up"
    ).should("be.visible");
    cy.contains("Lift the tube adapter to remove it").should("be.visible");
    cy.contains("Back").should("be.enabled");
    cy.contains("Next").click();
    cy.get(".spot-typography__text--body").should("be.visible");
    cy.getByTestId("wizard-modal")
      .find("img")
      .should("have.attr", "src")
      .and("match", viteAsset("reagent_kit_tubing.png"));
    cy.contains("Back").should("be.enabled");
    cy.containedWithinTestId(
      "wizard-modal",
      "ProCyte Dx Shutdown for Shipping Guide"
    );
    cy.containedWithinTestId("wizard-modal", "Reagent Kit Tubing");
    cy.contains("Next").click();
    cy.getByTestId("wizard-modal")
      .find("img")
      .should("have.attr", "src")
      .and("match", viteAsset("stain_probes.png"));
    cy.containedWithinTestId(
      "wizard-modal",
      "ProCyte Dx Shutdown for Shipping Guide"
    );
    cy.containedWithinTestId("wizard-modal", "Stain Probes");
    cy.contains("Back").should("be.enabled");
    cy.contains(
      "Open the stain compartment cover and unscrew the stain pack from the probes. Wrap the probes in a paper towel to prevent any splatter of the stain."
    ).should("be.visible");
    cy.contains("Next").click();
    cy.containedWithinTestId(
      "wizard-modal",
      "ProCyte Dx Shutdown for Shipping Guide"
    );
    cy.containedWithinTestId("wizard-modal", "Drain Reagents");
    cy.contains(
      "This step will take approximately 30 minutes to complete."
    ).should("be.visible");
    cy.contains(
      "Once the reagents have drained from the instrument, an alert will provide you with the final shutdown steps."
    ).should("be.visible");
    cy.getByTestId("wizard-next-button").as("Drain Reagents").click();
    cy.wait("@drain");
    cy.wait("@reagent-status");
    cy.url().should("eq", `${Cypress.config().baseUrl}/instruments/1/`);
  });
});
