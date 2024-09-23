import { interceptRequestsForHomeScreen } from "../../util/default-intercepts";

import { randomInstrumentStatus } from "@viewpoint/test-utils";

import {
  InstrumentStatus,
  InstrumentStatusDto,
  InstrumentType,
} from "@viewpoint/api";

const everHadPimsTrue = "true";

const everHadPimsFalse = "false";

const pimsEnabled: InstrumentStatusDto[] = [
  randomInstrumentStatus({
    instrumentStatus: InstrumentStatus.Ready,
    connected: true,
    instrument: {
      id: 3,
      maxQueueableRuns: 1,
      instrumentType: InstrumentType.InterlinkPims,
      supportedRunConfigurations: [],
      instrumentSerialNumber: "TEST-PIMS",
      manualEntry: false,
      runnable: true,
      displayOrder: 1,
      softwareVersion: "420",
      supportsInstrumentScreen: false,
    },
  }),
];

const pimsDisabled: InstrumentStatusDto[] = [
  randomInstrumentStatus({
    instrumentStatus: InstrumentStatus.Offline,
    connected: true,
    instrument: {
      id: 1,
      maxQueueableRuns: 1,
      instrumentType: InstrumentType.InterlinkPims,
      supportedRunConfigurations: [],
      instrumentSerialNumber: "TEST-PIMS",
      manualEntry: false,
      runnable: true,
      displayOrder: 1,
      softwareVersion: "420",
      supportsInstrumentScreen: false,
    },
  }),
];

const pimsNotReady: InstrumentStatusDto[] = [
  randomInstrumentStatus({
    instrumentStatus: InstrumentStatus.Not_Ready,
    connected: true,
    instrument: {
      id: 2,
      maxQueueableRuns: 1,
      instrumentType: InstrumentType.InterlinkPims,
      supportedRunConfigurations: [],
      instrumentSerialNumber: "TEST-PIMS",
      manualEntry: false,
      runnable: true,
      displayOrder: 1,
      softwareVersion: "420",
      supportsInstrumentScreen: false,
    },
  }),
];

const pimsSettings = {
  PIMS_HISTORYDATE: "2023-08-15T05:00:00Z",
  PIMS_TRANSMIT_RESULTS: "TRANSMIT_RESULTS_AND_REPORT",
  REQUIRE_REQUISITION_ID: "true",
  DISPLAY_REQUISITION_ID: "true",
};

const pimsSettingsNotReady = {
  PIMS_HISTORYDATE: "2023-08-15T05:00:00Z",
  PIMS_TRANSMIT_RESULTS: "TRANSMIT_OFF",
  REQUIRE_REQUISITION_ID: "true",
  DISPLAY_REQUISITION_ID: "true",
};

const ready = "true";

const unsentRunCount = "0";

describe("PIMS settings screen", () => {
  beforeEach(() => {
    interceptRequestsForHomeScreen();
  });

  it("should allow navigation to the PIMS settings screen and show a connected pims instrument", () => {
    cy.visit("/");
    cy.intercept("**/api/pims/unsentRunCount", unsentRunCount);
    cy.intercept({ pathname: "**/api/settings", method: "GET" }, pimsSettings);
    cy.intercept("**/api/pims/everHadPimsConnected", everHadPimsTrue);
    cy.intercept("**/api/device/status", pimsEnabled);
    cy.intercept("**/api/system/running", ready);
    cy.getByTestId("nav-dropdown-button").click();
    cy.contains("Settings").click();
    cy.contains("Practice Management").click();
    cy.containedWithinTestId("pims-screen", "Practice Management Software");
    cy.containedWithinTestId("pims-screen", "Ready");
    cy.containedWithinTestId("pims-screen", "Configure");
    cy.containedWithinTestId("pims-screen", "Required");
    cy.containedWithinTestId("pims-screen", "Display");
    cy.containedWithinTestId("pims-screen", "Results");
    cy.containedWithinTestId("pims-screen", "Transmit Results (Data)");
    cy.containedWithinTestId(
      "pims-screen",
      "Transmit Results and Reports (Data and PDF)"
    );
    cy.containedWithinTestId(
      "pims-screen",
      "Do not transmit records created before"
    );
    cy.containedWithinTestId(
      "pims-screen",
      "0 records have been created since this date and have not yet been transmitted."
    );
    //go home and verify we have a pims icon
    cy.getByTestId("header-left").click();
    cy.containedWithinTestId("instrument-bar-root", "TEST-PIMS");
  });

  it("should allow navigation to the PIMS settings screen and show a disconnected pims instrument", () => {
    cy.visit("/");
    cy.intercept("**/api/pims/everHadPimsConnected", everHadPimsTrue);
    cy.intercept("**/api/device/status", pimsDisabled);
    cy.getByTestId("nav-dropdown-button").click();
    cy.contains("Settings").click();
    cy.contains("Practice Management").click();
    cy.containedWithinTestId("pims-screen", "Practice Management Software");
    cy.containedWithinTestId("pims-screen", "Offline");
    cy.containedWithinTestId("pims-screen", "Remove PIMS");
    cy.contains(
      "The IDEXX VetLab Station is unable to communicate with the PIMS. If this PIMS is no longer in use, tap the Remove PIMS button to remove the icon from the home screen."
    );
    cy.contains("For further assistance, contact IDEXX Support.");
    cy.getByTestId("remove-pims-button").as("removePimsBtn").click();
    cy.contains("PIMS Removed Successfully.").should("not.exist");
  });

  it("should allow navigation to the PIMS settings screen and show a never connected pims instrument", () => {
    cy.visit("/");
    cy.intercept("**/api/pims/everHadPimsConnected", everHadPimsFalse);
    cy.getByTestId("nav-dropdown-button").click();
    cy.contains("Settings").click();
    cy.contains("Practice Management").click();
    cy.containedWithinTestId("pims-screen", "Practice Management Software");
    cy.containedWithinTestId("pims-screen", "Configure");
    cy.getByTestId("header-left").click();
    cy.containedWithinTestId("instrument-bar-root", "TEST-PIMS").should(
      "not.exist"
    );
  });

  it("should allow navigation to the PIMS settings screen and show a disconnected pims instrument with a history of connection", () => {
    cy.visit("/");
    cy.intercept("**/api/device/status", pimsNotReady);
    cy.intercept("**/api/pims/everHadPimsConnected", everHadPimsTrue);
    cy.intercept(
      { pathname: "**/api/settings", method: "GET" },
      pimsSettingsNotReady
    );
    cy.getByTestId("nav-dropdown-button").click();
    cy.contains("Settings").click();
    cy.contains("Practice Management").click();
    cy.containedWithinTestId("pims-screen", "Practice Management Software");
    cy.containedWithinTestId("pims-screen", "Not Ready");
    cy.containedWithinTestId("pims-screen", "Configure");
    cy.getByTestId("header-left").click();
    cy.containedWithinTestId("instrument-bar-root", "TEST-PIMS").should(
      "be.visible"
    );
    cy.contains("Not Ready").should("be.visible");
  });
});
