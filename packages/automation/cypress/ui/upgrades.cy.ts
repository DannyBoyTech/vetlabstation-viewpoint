import { UpgradeAvailableDto, UpgradeStatusDto } from "@viewpoint/api";
import faker from "faker";
import { interceptRequestsForHomeScreen } from "../util/default-intercepts";

describe("SmartService upgrades", () => {
  it("will prompt the user if a SmartService upgrade is available", () => {
    const upgradeAvailable: UpgradeAvailableDto = {
      validUpgrade: true,
      shutdownRequired: true,
      version: faker.system.semver(),
    };
    cy.intercept("GET", "**/api/upgrade/upgrade_available", upgradeAvailable);
    cy.intercept("POST", "**/api/upgrade/perform/SmartService/**").as(
      "upgradeBySmartService"
    );

    cy.visit("/");

    cy.getByTestId("ss-upgrade-available-modal")
      .should(
        "contain.text",
        `IDEXX VetLab Station upgrade version ${upgradeAvailable.version} has been downloaded via SmartService.`
      )
      .and(
        "contain.text",
        "WARNING: The IDEXX VetLab Station system will shut down during the upgrade process."
      );

    cy.getByTestId("ss-upgrade-available-upgrade-now-button").click();
    cy.wait("@upgradeBySmartService")
      .its("request.url")
      .should("match", /upgrade\/perform\/SmartService\/upgrade$/);

    cy.getByTestId("ss-upgrade-available-modal").should("not.exist");

    // Do it again without requiring a shutdown, choose later
    const newUpgradeAvailable: UpgradeAvailableDto = {
      validUpgrade: true,
      shutdownRequired: false,
      version: faker.system.semver(),
    };
    cy.intercept(
      "GET",
      "**/api/upgrade/upgrade_available",
      newUpgradeAvailable
    );

    cy.visit("/");

    cy.getByTestId("ss-upgrade-available-modal")
      .should(
        "contain.text",
        `IDEXX VetLab Station upgrade version ${newUpgradeAvailable.version} has been downloaded via SmartService.`
      )
      .and(
        "not.contain.text",
        "WARNING: The IDEXX VetLab Station system will shut down during the upgrade process."
      );

    cy.getByTestId("ss-upgrade-available-remind-later-button").click();
    cy.wait("@upgradeBySmartService")
      .its("request.url")
      .should("match", /upgrade\/perform\/SmartService\/later$/);

    cy.getByTestId("ss-upgrade-available-modal").should("not.exist");
  });
});

describe("upgrade attempts", () => {
  beforeEach(() => {
    interceptRequestsForHomeScreen();
  });
  it("will display a modal to the user when an upgrade is attempted successfully", () => {
    const upgradeStatus: UpgradeStatusDto = {
      upgradeSuccess: true,
      upgradeAttempted: true,
    };
    cy.intercept(
      {
        method: "GET",
        pathname: "**/api/upgrade/status/fetch",
      },
      upgradeStatus
    );
    cy.visit("/");

    cy.getByTestId("global-info-modal")
      .should("be.visible")
      .should("contain.text", "Upgrade Successful");
  });

  it("will display a toast to the user when an upgrade is attempted successfully but the user has not yet seen the welcome video", () => {
    const upgradeStatus: UpgradeStatusDto = {
      upgradeSuccess: true,
      upgradeAttempted: true,
    };
    localStorage.setItem(
      "idexx.viewpoint.welcomeScreenShown",
      JSON.stringify(false)
    );
    cy.intercept(
      {
        method: "GET",
        pathname: "**/api/upgrade/status/fetch",
      },
      upgradeStatus
    );
    cy.visit("/");

    cy.findByTestId("global-info-modal").should("not.exist");
    cy.getByTestId("upgrade-success-toast-message")
      .should("be.visible")
      .should("contain.text", "The upgrade was performed successfully");
  });

  it("will display a modal to the user when an upgrade fails even when the user has not yet seen the welcome video", () => {
    const upgradeStatus: UpgradeStatusDto = {
      upgradeSuccess: false,
      upgradeAttempted: true,
    };
    localStorage.setItem(
      "idexx.viewpoint.welcomeScreenShown",
      JSON.stringify(false)
    );
    cy.intercept(
      {
        method: "GET",
        pathname: "**/api/upgrade/status/fetch",
      },
      upgradeStatus
    );
    cy.visit("/");

    cy.getByTestId("global-info-modal")
      .should("be.visible")
      .should("contain.text", "Upgrade Did Not Complete");
  });
});
