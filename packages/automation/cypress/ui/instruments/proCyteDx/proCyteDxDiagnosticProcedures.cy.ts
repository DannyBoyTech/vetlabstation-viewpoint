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
  it("should allow navigation to ProCyte Dx diagnostics screen and show procedures", () => {
    cy.visit("/instruments/1");
    cy.contains("Diagnostics").click();
    cy.containedWithinTestId("main-content", "Rinse");
    cy.containedWithinTestId("main-content", "Auto Rinse");
    cy.containedWithinTestId("main-content", "Monthly Rinse");
    cy.containedWithinTestId("main-content", "Waste Chamber Rinse");
    cy.containedWithinTestId("main-content", "Flow Cell Rinse");
    cy.containedWithinTestId("main-content", "Drain");
    cy.containedWithinTestId("main-content", "Drain Reaction Chamber");
    cy.containedWithinTestId("main-content", "Drain RBC Isolation Chamber");
    cy.containedWithinTestId("main-content", "Drain Waste Chamber");
    cy.containedWithinTestId("main-content", "Remove/Clear");
    cy.containedWithinTestId("main-content", "Remove Clog");
    cy.containedWithinTestId("main-content", "Clear Pinch Valve");
    cy.containedWithinTestId("main-content", "Reset");
    cy.containedWithinTestId("main-content", "Reset Air Pump");
    cy.containedWithinTestId("main-content", "Reset Aspiration Motor");
    cy.containedWithinTestId("main-content", "Reset Sheath Motor");
    cy.containedWithinTestId("main-content", "Reset Tube Motor");
    cy.containedWithinTestId("main-content", "Reset WB Motor");
    cy.containedWithinTestId("main-content", "Replenish");
    cy.containedWithinTestId("main-content", "Stain");
    cy.containedWithinTestId("main-content", "Lytic Reagent");
    cy.containedWithinTestId("main-content", "Reticulocyte Diluent");
    cy.containedWithinTestId("main-content", "HGB Reagent");
    cy.containedWithinTestId("main-content", "System Diluent");
    cy.containedWithinTestId("main-content", "Initialize");
    cy.containedWithinTestId("main-content", "Start Up");
    cy.containedWithinTestId("main-content", "Ship");
    cy.containedWithinTestId("main-content", "Shut Down for Shipping");
    cy.contains("Back");
  });
  it("should allow navigation to ProCyte Dx diagnostics screen and perform remove/clear procedures", () => {
    cy.visit("/instruments/1/diagnostics");
    cy.contains("Remove Clog").click();
    cy.containedWithinTestId("remove-clog-modal", "Remove Clog");
    cy.containedWithinTestId(
      "remove-clog-modal",
      "This procedure will take approximately 1 minute."
    );
    cy.containedWithinTestId("remove-clog-modal", "Cancel");
    cy.containedWithinTestId("remove-clog-modal", "OK");
    cy.contains("Cancel").click();
    cy.getByTestId("remove-clog-modal").should("not.exist");
    cy.contains("Remove Clog").click();
    cy.contains("OK").click();
    cy.url().should("eq", `${Cypress.config().baseUrl}/instruments/1/`);
    cy.visit("/instruments/1/diagnostics");
    cy.contains("Clear Pinch Valve").click();
    cy.containedWithinTestId("clear-pinch-modal", "Clear Pinch Valve");
    cy.containedWithinTestId(
      "clear-pinch-modal",
      "This procedure will take less than 1 minute."
    );
    cy.containedWithinTestId("clear-pinch-modal", "Cancel");
    cy.containedWithinTestId("clear-pinch-modal", "OK");
    cy.contains("Cancel").click();
    cy.getByTestId("clear-pinch-modal").should("not.exist");
    cy.contains("Clear Pinch Valve").click();
    cy.contains("OK").click();
    cy.url().should("eq", `${Cypress.config().baseUrl}/instruments/1/`);
  });

  it("should allow navigation to ProCyte Dx diagnostics screen and perform reset procedures", () => {
    cy.visit("/instruments/1/diagnostics");
    cy.contains("Reset Air Pump").click();
    cy.containedWithinTestId("reset-air-modal", "Reset Air Pump");
    cy.containedWithinTestId(
      "reset-air-modal",
      "This procedure will take less than 1 minute."
    );
    cy.containedWithinTestId("reset-air-modal", "Cancel");
    cy.containedWithinTestId("reset-air-modal", "OK");
    cy.contains("Cancel").click();
    cy.getByTestId("reset-air-modal").should("not.exist");
    cy.contains("Reset Air Pump").click();
    cy.contains("OK").click();
    cy.url().should("eq", `${Cypress.config().baseUrl}/instruments/1/`);
    cy.visit("/instruments/1/diagnostics");
    cy.contains("Reset Aspiration Motor").click();
    cy.containedWithinTestId(
      "reset-aspiration-modal",
      "Reset Aspiration Motor"
    );
    cy.containedWithinTestId(
      "reset-aspiration-modal",
      "This procedure will take less than 1 minute."
    );
    cy.containedWithinTestId("reset-aspiration-modal", "Cancel");
    cy.containedWithinTestId("reset-aspiration-modal", "OK");
    cy.contains("Cancel").click();
    cy.getByTestId("reset-aspiration-modal").should("not.exist");
    cy.contains("Reset Aspiration Motor").click();
    cy.contains("OK").click();
    cy.url().should("eq", `${Cypress.config().baseUrl}/instruments/1/`);
    cy.visit("/instruments/1/diagnostics");
    cy.contains("Reset Sheath Motor").click();
    cy.containedWithinTestId("reset-sheath-modal", "Reset Sheath Motor");
    cy.containedWithinTestId(
      "reset-sheath-modal",
      "This procedure will take less than 1 minute."
    );
    cy.containedWithinTestId("reset-sheath-modal", "Cancel");
    cy.containedWithinTestId("reset-sheath-modal", "OK");
    cy.contains("Cancel").click();
    cy.getByTestId("reset-sheath-modal").should("not.exist");
    cy.contains("Reset Sheath Motor").click();
    cy.contains("OK").click();
    cy.url().should("eq", `${Cypress.config().baseUrl}/instruments/1/`);
    cy.visit("/instruments/1/diagnostics");
    cy.contains("Reset Tube Motor").click();
    cy.containedWithinTestId("reset-tube-modal", "Reset Tube Motor");
    cy.containedWithinTestId(
      "reset-tube-modal",
      "This procedure will take less than 1 minute."
    );
    cy.containedWithinTestId("reset-tube-modal", "Cancel");
    cy.containedWithinTestId("reset-tube-modal", "OK");
    cy.contains("Cancel").click();
    cy.getByTestId("reset-tube-modal").should("not.exist");
    cy.contains("Reset Tube Motor").click();
    cy.contains("OK").click();
    cy.url().should("eq", `${Cypress.config().baseUrl}/instruments/1/`);
    cy.visit("/instruments/1/diagnostics");
    cy.contains("Reset WB Motor").click();
    cy.containedWithinTestId("reset-wb-modal", "Reset WB Motor");
    cy.containedWithinTestId(
      "reset-wb-modal",
      "This procedure will take less than 1 minute."
    );
    cy.containedWithinTestId("reset-wb-modal", "Cancel");
    cy.containedWithinTestId("reset-wb-modal", "OK");
    cy.contains("Cancel").click();
    cy.getByTestId("reset-wb-modal").should("not.exist");
    cy.contains("Reset WB Motor").click();
    cy.contains("OK").click();
    cy.url().should("eq", `${Cypress.config().baseUrl}/instruments/1/`);
  });

  it("should allow navigation to ProCyte Dx diagnostics screen and perform replenish procedures", () => {
    cy.visit("/instruments/1/diagnostics");
    cy.contains("Stain").click();
    cy.containedWithinTestId("replenish-stain-modal", "Replenish Stain");
    cy.containedWithinTestId(
      "replenish-stain-modal",
      "This procedure will take approximately 4 minutes."
    );
    cy.containedWithinTestId("replenish-stain-modal", "Cancel");
    cy.containedWithinTestId("replenish-stain-modal", "OK");
    cy.contains("Cancel").click();
    cy.getByTestId("replenish-stain-modal").should("not.exist");
    cy.contains("Stain").click();
    cy.contains("OK").click();
    cy.url().should("eq", `${Cypress.config().baseUrl}/instruments/1/`);
    cy.visit("/instruments/1/diagnostics");
    cy.contains("Lytic Reagent").click();
    cy.containedWithinTestId(
      "replenish-lytic-modal",
      "Replenish Lytic Reagent"
    );
    cy.containedWithinTestId(
      "replenish-lytic-modal",
      "This procedure will take approximately 2 minutes."
    );
    cy.containedWithinTestId("replenish-lytic-modal", "Cancel");
    cy.containedWithinTestId("replenish-lytic-modal", "OK");
    cy.contains("Cancel").click();
    cy.getByTestId("replenish-lytic-modal").should("not.exist");
    cy.contains("Lytic Reagent").click();
    cy.contains("OK").click();
    cy.url().should("eq", `${Cypress.config().baseUrl}/instruments/1/`);
    cy.visit("/instruments/1/diagnostics");
    cy.contains("Reticulocyte Diluent").click();
    cy.containedWithinTestId(
      "replenish-reticulocyte-modal",
      "Replenish Reticulocyte Diluent"
    );
    cy.containedWithinTestId(
      "replenish-reticulocyte-modal",
      "This procedure will take approximately 2 minutes."
    );
    cy.containedWithinTestId("replenish-reticulocyte-modal", "Cancel");
    cy.containedWithinTestId("replenish-reticulocyte-modal", "OK");
    cy.contains("Cancel").click();
    cy.getByTestId("replenish-reticulocyte-modal").should("not.exist");
    cy.contains("Reticulocyte Diluent").click();
    cy.contains("OK").click();
    cy.url().should("eq", `${Cypress.config().baseUrl}/instruments/1/`);
    cy.visit("/instruments/1/diagnostics");
    cy.contains("HGB Reagent").click();
    cy.containedWithinTestId("replenish-hgb-modal", "Replenish HGB Reagent");
    cy.containedWithinTestId(
      "replenish-hgb-modal",
      "This procedure will take approximately 2 minutes."
    );
    cy.containedWithinTestId("replenish-hgb-modal", "Cancel");
    cy.containedWithinTestId("replenish-hgb-modal", "OK");
    cy.contains("Cancel").click();
    cy.getByTestId("replenish-hgb-modal").should("not.exist");
    cy.contains("HGB Reagent").click();
    cy.contains("OK").click();
    cy.url().should("eq", `${Cypress.config().baseUrl}/instruments/1/`);
    cy.visit("/instruments/1/diagnostics");
    cy.contains("System Diluent").click();
    cy.containedWithinTestId(
      "replenish-system-modal",
      "Replenish System Diluent"
    );
    cy.containedWithinTestId(
      "replenish-system-modal",
      "This procedure will take approximately 4 minutes."
    );
    cy.containedWithinTestId("replenish-system-modal", "Cancel");
    cy.containedWithinTestId("replenish-system-modal", "OK");
    cy.contains("Cancel").click();
    cy.getByTestId("replenish-system-modal").should("not.exist");
    cy.contains("System Diluent").click();
    cy.contains("OK").click();
    cy.url().should("eq", `${Cypress.config().baseUrl}/instruments/1/`);
  });
});
