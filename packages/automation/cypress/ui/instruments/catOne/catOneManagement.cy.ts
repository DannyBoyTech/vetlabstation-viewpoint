import {
  EventLogDto,
  HealthCode,
  InstrumentStatus,
  InstrumentStatusDto,
  InstrumentType,
} from "@viewpoint/api";
import {
  catOneOfflineText,
  catOneReconnectInstructions,
  idexxUseOnlyWarning,
} from "../../../util/instrument-texts";
import { viteAsset } from "../../../util/general-utils";
import {
  randomCatalystQualityControlDto,
  randomDetailedInstrumentStatus,
  randomInstrumentDto,
  randomInstrumentStatus,
} from "@viewpoint/test-utils";
import { interceptRequestsForHomeScreen } from "../../../util/default-intercepts";

const catOneQcLots = [
  randomCatalystQualityControlDto({
    instrumentType: InstrumentType.CatalystOne,
    lotNumber: "LL077",
    enabled: true,
    canRun: true,
    controlType: "Adv-Control",
  }),
];

const eventLog: EventLogDto[] = [
  {
    id: 5,
    sourceDate: 1679003079,
    targetDate: 1679003079.969,
    name: "WORK_REQUEST",
    patient: "Astro",
    runId: 469,
    defaultText: "Work request",
    code: "9286-2997",
    sourceIdentifier: "catone1",
    args: null,
    localizedText: "Work request",
  },
];

const catOneInstrumentStatus: InstrumentStatusDto = randomInstrumentStatus({
  instrumentStatus: InstrumentStatus.Ready,
  connected: true,
  instrument: randomInstrumentDto({
    instrumentType: InstrumentType.CatalystOne,
    instrumentSerialNumber: "CAT001",
    supportsInstrumentScreen: true,
    displayNumber: 1,
  }),
});

const catOneOffline: InstrumentStatusDto = randomInstrumentStatus({
  instrumentStatus: InstrumentStatus.Offline,
  connected: false,
  instrument: randomInstrumentDto({
    instrumentType: InstrumentType.CatalystOne,
    instrumentSerialNumber: "CAT002",
    displayNumber: 2,
  }),
});

const catOneConfig = {
  soundLevel: "Low",
  automaticEnterStandbyMode: "never",
  automaticEnterStandbyTime: "13:00:00",
  automaticExitStandbyMode: "never",
  automaticExitStandbyTime: "06:00:00",
};

const events = [
  { patient: "fido", sourceDate: 1677596003000, localizedText: "work request" },
];

describe("Instruments screen", () => {
  beforeEach(() => {
    interceptRequestsForHomeScreen();
    cy.intercept("**/api/device/status", [
      catOneInstrumentStatus,
      catOneOffline,
    ]);
    cy.intercept(
      `**/api/device/${catOneInstrumentStatus.instrument.id}/status`,
      catOneInstrumentStatus
    );
    cy.intercept(
      `**/api/instruments/${catOneInstrumentStatus.instrument.id}/status`,
      randomDetailedInstrumentStatus({
        status: HealthCode.READY,
        instrument: catOneInstrumentStatus.instrument,
      })
    );
    cy.intercept(
      `**/api/device/${catOneOffline.instrument.id}/status`,
      catOneOffline
    );

    cy.intercept("GET", "**/eventlog?identifier=CAT001", eventLog).as(
      "eventLog"
    );

    cy.intercept(
      { method: "GET", pathname: "**/qualityControl/catalyst/lots" },
      catOneQcLots
    );

    cy.intercept(
      `/labstation-webapp/api/catOne/${catOneInstrumentStatus.instrument.id}/maintenance/shutdownForShipping/request`,
      { statusCode: 204 }
    ).as("shutdown");
  });

  it("should show the shutdown confirmation modal and call shutdown when confirmed", () => {
    cy.visit(`/instruments/${catOneInstrumentStatus.instrument.id}`);
    cy.getByTestId("catone-instruments-screen").should("exist");
    cy.getByTestId("catone-instruments-shutdown-button").click();
    cy.getByTestId("catone-instruments-shutdown-confirmation").should(
      "be.visible"
    );
    cy.getByTestId("done-button").click();
    cy.wait("@shutdown").then((interception) => {
      assert.equal(interception.response.statusCode, 204);
    });
  });

  it("should allow user to remove offline instrument and be returned to the home screen", () => {
    cy.intercept("**/api/device/status", [catOneOffline]);
    cy.intercept("**/api/device/*/status", catOneOffline);
    cy.visit(`/instruments/${catOneOffline.instrument.id}`);
    cy.getByTestId("instrument-image")
      .find("img")
      .should("have.attr", "src")
      .and("match", viteAsset("CatOne.png"));
    cy.getByTestId("catone-instruments-screen-main")
      .containedWithinTestId("catone-instruments-screen-main", "Catalyst One")
      .containedWithinTestId("catone-instruments-screen-main", "Offline")
      .containedWithinTestId(
        "catone-instruments-screen-main",
        "Catalyst One is Offline"
      )
      .containedWithinTestId(
        "catone-instruments-screen-main",
        catOneOfflineText
      )
      .containedWithinTestId(
        "catone-instruments-screen-main",
        catOneReconnectInstructions
      );
    cy.getByTestId("instrument-page-right")
      .containedWithinTestId("instrument-page-right", "IP Address")
      .containedWithinTestId("instrument-page-right", "--"); //IP Address blank when offline
    cy.getByTestId("remove-button").click();
    cy.url().should("eq", `${Cypress.config().baseUrl}/`);
  });

  it("should allow navigation to instrument page from nav drop down menu", () => {
    cy.intercept("GET", "**/pims/pending", []);

    cy.visit("/");
    cy.getByTestId("nav-dropdown-button").click();
    cy.getByTestId("nav-popover").contains("Instruments").click();
    cy.getByTestId("header-left").should("contain.text", "Instruments");
    cy.contains("System").should("be.visible");
    cy.contains("Catalyst One 1").click({ force: true });
    cy.getByTestId("catone-instruments-screen").should(
      "contain.text",
      "Catalyst One"
    );
    cy.getByTestIdContains("instrument-page-right")
      .containedWithinTestId("instrument-page-right", "Maintenance")
      .containedWithinTestId("instrument-page-right", "Event Log")
      .containedWithinTestId("instrument-page-right", "Settings")
      .containedWithinTestId("instrument-page-right", "IDEXX Use Only")
      .containedWithinTestId("instrument-page-right", "Software Version")
      .containedWithinTestId("instrument-page-right", "CAL Data Version")
      .containedWithinTestId("instrument-page-right", "Serial Number")
      .containedWithinTestId("instrument-page-right", "IP Address");
    cy.getByTestId("header-left").click();
    cy.getByTestId("nav-dropdown-button").click();
    cy.contains("Instruments").click();
    cy.contains("System").should("be.visible");
  });

  it("should allow navigation to catOne standby settings page", () => {
    cy.intercept(
      `/labstation-webapp/api/catOne/${catOneInstrumentStatus.instrument.id}/catOneConfigurations`,
      catOneConfig
    );
    cy.intercept("GET", "**/pims/pending", []);

    cy.visit("/instruments");
    cy.contains("Catalyst One 1").click({ force: true });
    cy.getByTestId("settings-button").click();
    cy.getByTestId("standby-settings").should("be.visible");
    cy.getByTestId("standby-sound").should("be.visible");
    cy.getByTestId("standby-standby").should("be.visible");
    cy.getByTestId("standby-exit").should("be.visible");
    // go back
    cy.contains("Back").click();
    cy.url().should(
      "include",
      `/instruments/${catOneInstrumentStatus.instrument.id}`
    );
  });

  it("should allow selection of catOne sound settings", () => {
    cy.intercept(
      `/labstation-webapp/api/catOne/${catOneInstrumentStatus.instrument.id}/catOneConfigurations`,
      catOneConfig
    ).as("updateConfig");
    cy.intercept("GET", "**/pims/pending", []);
    cy.intercept(
      "POST",
      `**/api/standby/${catOneInstrumentStatus.instrument.id}/enter`
    ).as("standbyMode");

    cy.visit("/instruments");
    cy.contains("Catalyst One 1").click({ force: true });
    cy.getByTestId("settings-button").click();
    cy.contains("High").click();
    cy.wait("@updateConfig");
  });

  it("should allow selection of catOne standby 'Now' setting", () => {
    cy.intercept(
      `/labstation-webapp/api/catOne/${catOneInstrumentStatus.instrument.id}/catOneConfigurations`,
      catOneConfig
    ).as("updateConfig");
    cy.intercept("GET", "**/pims/pending", []);
    cy.intercept(
      "POST",
      `**/api/standby/${catOneInstrumentStatus.instrument.id}/enter`
    ).as("standbyMode");

    cy.visit("/instruments");
    cy.contains("Catalyst One 1").click({ force: true });
    cy.getByTestId("settings-button").click();
    cy.contains("Now").click();
    cy.wait("@standbyMode");
    cy.url().should(
      "include",
      `/instruments/${catOneInstrumentStatus.instrument.id}`
    );
  });

  it("should allow selection of catOne timed standby settings", () => {
    cy.intercept(
      `/labstation-webapp/api/catOne/${catOneInstrumentStatus.instrument.id}/catOneConfigurations`,
      catOneConfig
    ).as("updateConfig");
    cy.intercept("GET", "**/pims/pending", []);
    cy.intercept(
      "POST",
      `**/api/standby/${catOneInstrumentStatus.instrument.id}/enter`
    ).as("standbyMode");

    cy.visit("/instruments");
    cy.contains("Catalyst One 1").click({ force: true });
    cy.getByTestId("settings-button").click();
    cy.contains("Daily").click();
    cy.wait("@updateConfig").its("response.body").should("deep.equal", {
      soundLevel: "Low",
      automaticEnterStandbyMode: "never",
      automaticEnterStandbyTime: "13:00:00",
      automaticExitStandbyMode: "never",
      automaticExitStandbyTime: "06:00:00",
    });
  });

  it("should allow navigation to IDEXX use only page", () => {
    cy.intercept("GET", "**/pims/pending", []);
    cy.visit("/instruments");
    cy.contains("Catalyst One 1").click({ force: true });
    cy.contains("IDEXX Use Only").click();
    cy.getByTestId("title").should("contain.text", "IDEXX Use Only");
    cy.getByTestId("warning-text").should("be.visible");
    cy.contains("Scalars").should("be.visible");
    cy.getByTestId("scalars").should("be.visible");
    cy.contains("Offsets").should("be.visible");
    cy.getByTestId("offsets").should("be.visible");
    cy.contains("SDMA").should("be.visible");
    cy.getByTestId("SDMA").should("be.visible");
    cy.contains("Back").click();
    cy.getByTestId("header-left").should("contain.text", "Instruments");
  });

  it("should show password modal on attempt to update advanced settings", () => {
    cy.intercept("GET", "**/pims/pending", []);
    cy.visit("/instruments");
    cy.contains("Catalyst One 1").click({ force: true });
    cy.contains("IDEXX Use Only").click();
    cy.contains("Update").click();
    cy.getByTestId("password-modal").should("be.visible");
    cy.getByTestId("password-modal").containedWithinTestId(
      "password-modal",
      idexxUseOnlyWarning
    );
    cy.contains("Cancel").click();
    cy.getByTestId("header-left").should("contain.text", "IDEXX Use Only");
  });

  it("should navigate to the catOne event log and fetch events", () => {
    cy.intercept({ method: "GET", pathname: "**/api/eventlog" }, events).as(
      "events1"
    );
    cy.visit(`/instruments/${catOneInstrumentStatus.instrument.id}`);
    cy.getByTestId("event-log-button").click();
    cy.wait("@events1");
    cy.getByTestId("event-log-table").contains("work request");
    cy.getByTestId("back-button").click();
    cy.contains("Catalyst One");
  });

  it("should allow navigation to event log screen and show details", () => {
    cy.visit(`/instruments/${catOneInstrumentStatus.instrument.id}`);
    cy.contains("Event Log").click();
    cy.getByTestId("header-left").containedWithinTestId(
      "header-left",
      "Catalyst One Event Log"
    );
    cy.contains("Event Log").should("be.visible");
    cy.getByTestId("event-log-table")
      .containedWithinTestId("event-log-table", "Time")
      .containedWithinTestId("event-log-table", "Event")
      .containedWithinTestId("event-log-table", "Patient")
      .containedWithinTestId("event-log-table", "3/16/23")
      .containedWithinTestId("event-log-table", "Work request")
      .containedWithinTestId("event-log-table", "Astro");
    cy.getByTestId("instrument-page-right").containedWithinTestId(
      "instrument-page-right",
      "Back"
    );
  });

  it("should guide a user through the cleaning procedure", () => {
    cy.intercept(
      "POST",
      `**/api/catOne/${catOneInstrumentStatus.instrument.id}/maintenance/clean/complete`
    ).as("Complete");
    cy.visit(`/instruments/${catOneInstrumentStatus.instrument.id}`);
    cy.contains("Maintenance").click();
    cy.contains("Clean").click();
    //Recommendations
    cy.getByTestId("cleaning-wizard").should("be.visible");
    cy.getByTestId("wizard-header-primary-title").should("be.visible");
    cy.getByTestId("wizard-header-secondary-title").should("be.visible");
    cy.getByTestId("idexx-recommendations").should("be.visible");
    cy.containedWithinTestId("cleaning-wizard", "Cancel");
    cy.containedWithinTestId("cleaning-wizard", "Next");
    cy.contains("Next").click();
    //Prepare
    cy.getByTestId("wizard-header-primary-title").should("be.visible");
    cy.getByTestId("wizard-header-secondary-title").should("be.visible");
    cy.getByTestId("wizard-content").should("be.visible");
    cy.contains("Back").should("be.visible");
    cy.contains("Back").should("be.enabled");
    cy.contains("Next").click();
    //Clean
    cy.getByTestId("wizard-header-primary-title").should("be.visible");
    cy.getByTestId("wizard-header-secondary-title").should("be.visible");
    cy.getByTestId("wizard-content").should("be.visible");
    cy.contains("Back").should("be.visible");
    cy.contains("Back").should("be.enabled");
    cy.contains("Next").click();
    //Complete
    cy.getByTestId("wizard-header-primary-title").should("be.visible");
    cy.getByTestId("wizard-header-secondary-title").should("be.visible");
    cy.getByTestId("wizard-content").should("be.visible");
    cy.contains("Back").should("be.visible");
    cy.contains("Back").should("be.enabled");
    cy.getByTestId("wizard-next-button").as("Done").click();
    cy.wait("@Complete");
    cy.url().should(
      "eq",
      `${Cypress.config().baseUrl}/instruments/${
        catOneInstrumentStatus.instrument.id
      }/maintenance`
    );
  });

  it("should guide a user through the optics calibration procedure", () => {
    cy.intercept(
      "POST",
      `/catone/${catOneInstrumentStatus.instrument.id}/maintenance/opticsCalibration/request`
    );
    cy.intercept(
      "POST",
      `**/api/catOne/${catOneInstrumentStatus.instrument.id}/maintenance/opticsCalibration/complete`
    ).as("calibration-complete");

    cy.intercept(
      "POST",
      `**/api/catOne/${catOneInstrumentStatus.instrument.id}/maintenance/clean/complete`
    ).as("Complete");
    cy.visit(`/instruments/${catOneInstrumentStatus.instrument.id}`);
    cy.contains("Maintenance").click();
    cy.contains("Calibrate").click();

    cy.getByTestId("calibration-wizard").within((calibration) => {
      cy.wrap(calibration)
        .find("img")
        .should("have.attr", "src")
        .and("match", viteAsset("CatOne.png"));
      cy.contains("Catalyst One Optics Calibration");
      cy.contains("Clean Analyzer");
      cy.contains(
        "The analyzer must be cleaned before performing a calibration."
      );
      cy.contains("View Cleaning Instructions");
      cy.contains("Back").should("be.enabled");
      //Go back
      cy.getByTestId("wizard-back-button").as("Back").click();
      cy.getByTestId("cleaning-wizard").should("not.exist");
    });

    //Continue the workflow
    cy.contains("Calibrate").click();
    cy.contains("View Cleaning Instructions").click();

    cy.getByTestId("cleaning-wizard").within(() => {
      cy.getByTestId("wizard-next-button").as("Next").click();
      cy.getByTestId("wizard-next-button").as("Next").click();
      cy.getByTestId("wizard-next-button").as("Next").click();
      cy.getByTestId("wizard-next-button").contains("Done").click();
    });

    cy.getByTestId("calibration-wizard").within(() => {
      cy.getByTestId("wizard-next-button").as("Next").click();
      cy.wait("@Complete");
      cy.getByTestId("wizard-next-button").as("Done").click();
    });

    cy.wait("@calibration-complete");
    cy.url().should(
      "eq",
      `${Cypress.config().baseUrl}/instruments/${
        catOneInstrumentStatus.instrument.id
      }/maintenance`
    );
  });

  it("should guide a user through the calcium and albumin offset workflows", () => {
    cy.intercept(
      {
        method: "GET",
        pathname: "**/api/qualityControl/catalyst",
        query: {
          instrumentId: catOneInstrumentStatus.instrument.id.toString(),
        },
      },
      catOneQcLots
    );
    cy.intercept(
      "PUT",
      `**/api/catOne/${catOneInstrumentStatus.instrument.id}/maintenance/offsets/request`,
      []
    );
    cy.intercept(
      `**/api/catOne/${catOneInstrumentStatus.instrument.id}/maintenance/offsets/complete`,
      []
    ).as("Complete-offsets");
    cy.visit(`/instruments/${catOneInstrumentStatus.instrument.id}`);
    cy.contains("IDEXX Use Only").click();
    cy.getByTestId("update-button").eq(1).as("Offsets-update-button").click();
    cy.getByTestId("password-modal").should("be.visible");
    cy.containedWithinTestId("password-modal", "IDEXX Use Only");
    cy.containedWithinTestId(
      "password-modal",
      "Warning: These options are advanced diagnostic functions that should be used only under the guidance of IDEXX Support personnel."
    );
    cy.containedWithinTestId("password-modal", "Password");
    cy.containedWithinTestId("password-modal", "Cancel");
    cy.containedWithinTestId("password-modal", "Next");
    //Gate the user without passsword entry
    cy.contains("Next").should("be.disabled");
    cy.get(".spot-form__input").as("offsets-password").type("3693");
    cy.contains("Next").click();
    cy.getByTestId("modal").should("be.visible");
    cy.containedWithinTestId("modal", "Catalyst One Offsets");
    cy.containedWithinTestId("modal", "Preparation");
    cy.containedWithinTestId("modal", "Prepare VetTrol Control Fluid");
    cy.containedWithinTestId("modal", "Clean your Catalyst One");
    cy.containedWithinTestId("modal", "VetTrol Instructions");
    cy.containedWithinTestId("modal", "Cleaning Instructions");
    cy.contains("Back").should("be.enabled");
    cy.contains("Next").click();
    cy.getByTestId("modal").should("be.visible");
    cy.containedWithinTestId("modal", "Catalyst One Offsets");
    cy.containedWithinTestId("modal", "Select Your VetTrol Lot");
    cy.containedWithinTestId(
      "modal",
      "Select the VetTrol control fluid you will be using to set your offsets."
    );
    cy.contains("QC Lot");
    cy.contains("Expiration Date");
    cy.contains("LL077").click();
    cy.contains("Back").should("be.enabled");
    cy.contains("Next").click();
    cy.getByTestId("modal").should("be.visible");
    cy.containedWithinTestId("modal", "Load Materials");
    cy.contains("Back").should("be.enabled");
    cy.getByTestId("modal")
      .find("img")
      .should("have.attr", "src")
      .and("match", viteAsset("CatOne_Offsets_LoadMaterials.png"));
    cy.contains("Load material as shown:");
    cy.contains("Pipette tips");
    cy.contains("300 µL VetTrol control fluid");
    cy.contains("Four calcium and/or albumin single slides from the same lot");
    cy.contains("Close the same drawer and press the Start button.");
    cy.getByTestId("wizard-next-button").as("OK").click();
    cy.wait("@Complete-offsets");
    cy.url().should(
      "eq",
      `${Cypress.config().baseUrl}/instruments/${
        catOneInstrumentStatus.instrument.id
      }/settings/advanced`
    );
  });
});
