import {
  InstrumentStatus,
  InstrumentStatusDto,
  InstrumentType,
} from "@viewpoint/api";
import {
  randomInstrumentDto,
  randomInstrumentStatus,
} from "@viewpoint/test-utils";
import {
  pcoDiagnosticsWarning,
  pcoEventLogText,
  pcoInstallReagentStep1,
  pcoInstallReagentStep2,
  pcoInstallSheathStep1,
  pcoInstallSheathStep2,
  pcoOfflineText,
  pcoRemoveFilterStep1,
  pcoRemoveFilterStep2,
  pcoRemoveFilterStep3,
  pcoRemoveReagentStep1,
  pcoRemoveReagentStep2,
  pcoRemoveSheathStep1,
  pcoRemoveSheathStep2,
  pcoReplaceFilterStep1,
  pcoReplaceFilterStep2,
  pcoReplaceFilterStep3,
  pcoReplaceFilterStep4,
} from "../../../util/instrument-texts";
import { viteAsset, viteAssetCssUrl } from "../../../util/general-utils";

const proCyteOneReady: InstrumentStatusDto = randomInstrumentStatus({
  instrumentStatus: InstrumentStatus.Ready,
  connected: true,
  instrument: randomInstrumentDto({
    instrumentType: InstrumentType.ProCyteOne,
  }),
});
const proCyteOneOffline: InstrumentStatusDto = randomInstrumentStatus({
  instrumentStatus: InstrumentStatus.Offline,
  connected: false,
  instrument: randomInstrumentDto({
    instrumentType: InstrumentType.ProCyteOne,
  }),
});
const eventLog = [
  {
    id: 100,
    sourceDate: 1679666085.091,
    targetDate: 1679666085.091,
    name: "SHUTDOWN_SHIPPING_CLEANUP",
    patient: null,
    runId: null,
    defaultText:
      "To complete this process, please remove the reagent pack, sheath pack, and filter from inside of the analyzer. Remove anything in the sample drawer (SmartQC, sample tubes) and disconnect the power and Ethernet cables behind the analyzer.",
    code: "SHUTDOWN_SHIPPING_CLEANUP",
    sourceIdentifier: "acadia1",
    args: null,
    localizedText:
      "To complete this process, please remove the reagent pack, sheath pack, and filter from inside of the analyzer. Remove anything in the sample drawer (SmartQC, sample tubes) and disconnect the power and Ethernet cables behind the analyzer.",
  },
];

describe("ProCyteOne Instruments screen", () => {
  it("provides instrument and fluid pack information", () => {
    cy.intercept("**/api/device/status", [proCyteOneReady]);
    cy.intercept("**/api/device/*/status", proCyteOneReady);

    cy.visit(`/instruments/${proCyteOneReady.instrument.id}`);

    cy.getByTestId("pco-gauge-container-Sheath").as("sheathContainer");
    cy.getByTestId("pco-gauge-Sheath").as("sheathGauge");

    cy.getByTestId("pco-gauge-container-Reagent").as("reagentContainer");
    cy.getByTestId("pco-gauge-Reagent").as("reagentGauge");

    cy.getByTestId("instrument-image")
      .find("img")
      .should("have.attr", "src")
      .and("match", viteAsset("AcadiaDx.png"));
    cy.getByTestId("pco-maintenance-screen")
      .containedWithinTestId("pco-maintenance-screen", "ProCyte One")
      .containedWithinTestId("pco-maintenance-screen", "Ready");
    cy.getByTestId("pco-fluid-levels").containedWithinTestId(
      "pco-fluid-levels",
      "Estimated Fluid Levels"
    );
    cy.get("@sheathGauge")
      .should("have.css", "background-image")
      .and("match", viteAssetCssUrl("sheath-background.png"));
    cy.get("@sheathContainer").containedWithinTestId(
      "pco-gauge-container-Sheath",
      "Replace Sheath"
    );
    cy.get("@sheathContainer").find(
      '[data-testid="pco-sheath-percent-remaining"]'
    );
    cy.get("@sheathContainer").find('[data-testid="pco-sheath-expire-date"]');
    cy.get("@reagentGauge")
      .should("have.css", "background-image")
      .and("match", viteAssetCssUrl("reagent-background.png"));
    cy.get("@reagentContainer").containedWithinTestId(
      "pco-gauge-container-Reagent",
      "Replace Reagent"
    );
    cy.get("@reagentContainer").find(
      '[data-testid="pco-reagent-runs-remaining"]'
    );
    cy.get("@reagentContainer").find('[data-testid="pco-reagent-expire-date"]');
    cy.getByTestId("pco-maintenance-screen-right")
      .containedWithinTestId("pco-maintenance-screen-right", "Quality Control")
      .containedWithinTestId("pco-maintenance-screen-right", "Diagnostics")
      .containedWithinTestId("pco-maintenance-screen-right", "Event Log")
      .containedWithinTestId("pco-maintenance-screen-right", "Settings")
      .containedWithinTestId("pco-maintenance-screen-right", "Software Version")
      .containedWithinTestId(
        "pco-maintenance-screen-right",
        "SQC Target File Version"
      )
      .containedWithinTestId("pco-maintenance-screen-right", "Serial Number")
      .containedWithinTestId("pco-maintenance-screen-right", "IP Address");
  });

  it("provides access to the event log screen", () => {
    cy.intercept("**/api/device/status", [proCyteOneReady]);
    cy.intercept("**/api/device/*/status", proCyteOneReady);
    cy.intercept({ method: "GET", pathname: "**/eventlog" }, eventLog);
    cy.visit(`/instruments/${proCyteOneReady.instrument.id}`);
    cy.contains("Event Log").click();
    cy.getByTestId("header-left").containedWithinTestId(
      "header-left",
      "ProCyte One Event Log"
    );
    cy.contains("Event Log");
    cy.contains(
      `Analyzer: ${proCyteOneReady.instrument.instrumentSerialNumber}`
    );
    cy.contains("View Details");
    cy.contains("Back");
    cy.contains("View Details").should("not.be.enabled");
    cy.getByTestId("event-log-table")
      .containedWithinTestId("event-log-table", "Time")
      .containedWithinTestId("event-log-table", "Event")
      .containedWithinTestId("event-log-table", "Patient")
      .containedWithinTestId("event-log-table", pcoEventLogText);
    cy.contains("3/24/23").click();
    cy.contains("View Details").click();
    cy.getByTestId("modal")
      .containedWithinTestId("modal", pcoEventLogText)
      .containedWithinTestId("modal", "SHUTDOWN_SHIPPING_CLEANUP")
      .containedWithinTestId("modal", "OK");
    cy.contains("OK").click();
    cy.contains("Back").click();
    cy.url().should(
      "eq",
      `${Cypress.config().baseUrl}/instruments/${proCyteOneReady.instrument.id}`
    );
  });

  it("should allow navigation to ProCyte One fluidic filter replacement", () => {
    cy.intercept("**/api/device/status", [proCyteOneReady]);
    cy.intercept("**/api/device/*/status", proCyteOneReady);
    cy.visit(`/instruments/${proCyteOneReady.instrument.id}`);
    cy.contains("Diagnostics").click();
    cy.contains("OK").click();
    cy.contains("Replace Filter").click();
    cy.getByTestId("confirm-modal").should("be.visible");
    cy.getByTestId("remove-filter-steps")
      .containedWithinTestId("remove-filter-steps", pcoRemoveFilterStep1)
      .containedWithinTestId("remove-filter-steps", pcoRemoveFilterStep2)
      .containedWithinTestId("remove-filter-steps", pcoRemoveFilterStep3);
    cy.getByTestId("pco-remove-filter-image")
      .find("img")
      .should("have.attr", "src")
      .and("match", viteAsset("remove-filter.png"));
    cy.getByTestId("install-filter-steps")
      .containedWithinTestId("install-filter-steps", pcoReplaceFilterStep1)
      .containedWithinTestId("install-filter-steps", pcoReplaceFilterStep2)
      .containedWithinTestId("install-filter-steps", pcoReplaceFilterStep3)
      .containedWithinTestId("install-filter-steps", pcoReplaceFilterStep4);
    cy.getByTestId("confirm-modal")
      .containedWithinTestId("confirm-modal", "Remove Old Filter")
      .containedWithinTestId("confirm-modal", "Install New Filter")
      .containedWithinTestId("confirm-modal", "Cancel")
      .containedWithinTestId("confirm-modal", "Done");
    cy.getByTestId("pco-replace-filter-image-1")
      .find("img")
      .should("have.attr", "src")
      .and("match", viteAsset("install-filter-1.png"));
    cy.getByTestId("pco-replace-filter-image-2")
      .find("img")
      .should("have.attr", "src")
      .and("match", viteAsset("install-filter-2.png"));
  });

  it("should allow user to remove offline instrument and return to home screen", () => {
    cy.intercept("**/api/device/status", [proCyteOneOffline]);
    cy.intercept("**/api/device/*/status", proCyteOneOffline);
    cy.visit(`/instruments/${proCyteOneOffline.instrument.id}`);
    cy.getByTestId("instrument-image")
      .find("img")
      .should("have.attr", "src")
      .and("match", viteAsset("AcadiaDx.png"));
    cy.getByTestId("pco-maintenance-screen")
      .containedWithinTestId("pco-maintenance-screen", "ProCyte One")
      .containedWithinTestId("pco-maintenance-screen", "Offline")
      .containedWithinTestId("pco-maintenance-screen", "ProCyte One is Offline")
      .containedWithinTestId("pco-maintenance-screen", pcoOfflineText);
    cy.getByTestId("pco-maintenance-screen-right")
      .containedWithinTestId("pco-maintenance-screen-right", "IP Address")
      .containedWithinTestId("pco-maintenance-screen-right", "--"); //IP address blank when offline
    cy.getByTestId("remove-button").click();
    cy.url().should("eq", `${Cypress.config().baseUrl}/`);
  });

  it("should allow navigation to procyte one diagnostics page", () => {
    cy.intercept("**/api/device/status", [proCyteOneReady]);
    cy.intercept("**/api/device/*/status", proCyteOneReady);
    cy.visit(`/instruments/${proCyteOneReady.instrument.id}`);
    cy.contains("ProCyte One").click({ force: true });
    cy.getByTestId("pco-diagnostics-button").click();
    cy.getByTestId("confirm-modal")
      .containedWithinTestId("confirm-modal", pcoDiagnosticsWarning)
      .containedWithinTestId("confirm-modal", "ProCyte One Diagnostics")
      .containedWithinTestId("confirm-modal", "Cancel")
      .containedWithinTestId("confirm-modal", "OK");
    cy.contains("OK").click();
    cy.getByTestId("header-left").containedWithinTestId(
      "header-left",
      "ProCyte One Diagnostics"
    );
    cy.getByTestId("pco-diagnostics-page-main")
      .containedWithinTestId("pco-diagnostics-page-main", "Diagnostics")
      .containedWithinTestId("pco-diagnostics-page-main", "Power")
      .containedWithinTestId("pco-diagnostics-page-main", "Power Down")
      .containedWithinTestId(
        "pco-diagnostics-page-main",
        "Shut Down for Shipping"
      )
      .containedWithinTestId("pco-diagnostics-page-main", "Pack Procedures")
      .containedWithinTestId("pco-diagnostics-page-main", "Prime Reagent")
      .containedWithinTestId("pco-diagnostics-page-main", "Prime Sheath")
      .containedWithinTestId("pco-diagnostics-page-main", "Lot Entry")
      .containedWithinTestId("pco-diagnostics-page-main", "Fluidic Procedures")
      .containedWithinTestId("pco-diagnostics-page-main", "Full System Prime")
      .containedWithinTestId("pco-diagnostics-page-main", "System Flush")
      .containedWithinTestId("pco-diagnostics-page-main", "Replace Filter")
      .containedWithinTestId("pco-diagnostics-page-main", "Bleach Clean")
      .containedWithinTestId(
        "pco-diagnostics-page-main",
        "IDEXX-Directed (Diagnostic) Procedures"
      )
      .containedWithinTestId("pco-diagnostics-page-main", "Flow Cell Soak")
      .containedWithinTestId("pco-diagnostics-page-main", "Drain Mix Chambers");
    cy.getByTestId("pco-diagnostics-page-right").containedWithinTestId(
      "pco-diagnostics-page-right",
      "Back"
    );
    //go back
    cy.contains("Back").click();
    cy.url().should(
      "eq",
      `${Cypress.config().baseUrl}/instruments/${proCyteOneReady.instrument.id}`
    );
  });

  it("should allow navigation to procyte one diagnostics lot entry", () => {
    cy.intercept("**/api/device/status", [proCyteOneReady]);
    cy.intercept("**/api/device/*/status", proCyteOneReady);
    cy.visit(`/instruments/${proCyteOneReady.instrument.id}/diagnostics`);
    cy.contains("OK").click();
    cy.contains("Lot Entry").click();
    cy.contains("Select Consumable Type").should("be.visible");
    cy.contains("Enter lot or barcode number").should("be.visible");
    cy.getByTestId("lot-entry-input").should("be.visible");
    cy.getByTestId("numpad");
    cy.contains("Next").should("be.visible");
    cy.contains("Next").should("be.disabled");
    cy.contains("Cancel").should("be.visible");
    //go back
    cy.contains("Cancel").click();
    cy.url().should(
      "eq",
      `${Cypress.config().baseUrl}/instruments/${
        proCyteOneReady.instrument.id
      }/diagnostics`
    );
  });

  it("should show the remove/install sheath modal", () => {
    cy.intercept("**/api/device/status", [proCyteOneReady]);
    cy.intercept("**/api/device/*/status", proCyteOneReady);
    cy.visit(`/instruments/${proCyteOneReady.instrument.id}`);
    cy.getByTestId("replace-sheath-button").click();
    cy.containedWithinTestId(
      "pco-replace-Sheath-modal",
      "ProCyte One Sheath Replacement"
    );
    cy.containedWithinTestId(
      "pco-replace-Sheath-modal",
      "Remove Old Sheath Pack"
    );
    cy.containedWithinTestId(
      "pco-replace-Sheath-modal",
      "Install New Sheath Pack"
    );
    cy.containedWithinTestId("pco-replace-Sheath-modal", "Cancel");
    cy.containedWithinTestId("pco-replace-Sheath-modal", "Done");
    cy.containedWithinTestId("pco-replace-Sheath-modal", pcoRemoveSheathStep1);
    cy.containedWithinTestId("pco-replace-Sheath-modal", pcoRemoveSheathStep2);
    cy.containedWithinTestId("pco-replace-Sheath-modal", pcoInstallSheathStep1);
    cy.containedWithinTestId("pco-replace-Sheath-modal", pcoInstallSheathStep2);
    cy.getByTestId("pco-replace-Sheath-modal")
      .find("img")
      .should("have.attr", "src")
      .and("match", viteAsset("replace-sheath.png"));
    cy.contains("Done").click();
    cy.getByTestId("pco-replace-Sheath-modal").should("not.exist");
  });

  it("should show the remove/install reagent modal", () => {
    cy.intercept("**/api/device/status", [proCyteOneReady]);
    cy.intercept("**/api/device/*/status", proCyteOneReady);
    cy.visit(`/instruments/${proCyteOneReady.instrument.id}`);
    cy.getByTestId("replace-reagent-button").click();
    cy.containedWithinTestId(
      "pco-replace-Reagent-modal",
      "ProCyte One Reagent Replacement"
    );
    cy.containedWithinTestId(
      "pco-replace-Reagent-modal",
      "Remove Old Reagent Pack"
    );
    cy.containedWithinTestId(
      "pco-replace-Reagent-modal",
      "Install New Reagent Pack"
    );
    cy.containedWithinTestId("pco-replace-Reagent-modal", "Cancel");
    cy.containedWithinTestId("pco-replace-Reagent-modal", "Done");
    cy.containedWithinTestId(
      "pco-replace-Reagent-modal",
      pcoRemoveReagentStep1
    );
    cy.containedWithinTestId(
      "pco-replace-Reagent-modal",
      pcoRemoveReagentStep2
    );
    cy.containedWithinTestId(
      "pco-replace-Reagent-modal",
      pcoInstallReagentStep1
    );
    cy.containedWithinTestId(
      "pco-replace-Reagent-modal",
      pcoInstallReagentStep2
    );
    cy.getByTestId("pco-replace-Reagent-modal")
      .find("img")
      .should("have.attr", "src")
      .and("match", viteAsset("replace-reagent.png"));
    cy.getByTestId("done-button").click();
    cy.getByTestId("pco-replace-Reagent-modal").should("not.exist");
  });
});
