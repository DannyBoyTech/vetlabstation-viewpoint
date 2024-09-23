const system = {
  ipAddress: "192.168.001.001",
  serialNumber: "VS8CC82918M7",
};

const softwareVersion = "5.16.124";
const AOPALLIANCE =
  "LICENCE: all the source code provided by AOP Alliance is Public Domain.";

describe("System Tab", () => {
  it("should be shown by default upon navigation to instruments screen", () => {
    cy.intercept("**/api/device/status", []);
    cy.intercept("**/api/system/system", system);
    cy.intercept("**/api/upgrade/system_software_version", softwareVersion);
    cy.visit("/instruments/");
    cy.containedWithinTestId("header-left", "Instruments");
    cy.containedWithinTestId("system-maintenance-screen", "System");
    cy.containedWithinTestId(
      "system-maintenance-screen",
      "IDEXX VetLab Station"
    );
    cy.containedWithinTestId("system-maintenance-screen", "Hardware");
    cy.containedWithinTestId("system-maintenance-screen", "Software");
    cy.containedWithinTestId("system-maintenance-screen", "Data");
    cy.getByTestId("advanced-link").should("be.visible");
    cy.getByTestId("backup-data-link").should("be.visible");
    cy.getByTestId("restore-data-link").should("be.visible");
    cy.getByTestId("upgrade-software-link").should("be.visible");
    cy.getByTestId("system-info-link").should("be.visible");
    cy.containedWithinTestId("maintenance-screen-right", "Restart");
    cy.containedWithinTestId("maintenance-screen-right", "Power Down");
    cy.containedWithinTestId("maintenance-screen-right", "Software Version");
    cy.containedWithinTestId("maintenance-screen-right", "Serial Number");
    cy.containedWithinTestId("maintenance-screen-right", "IP Address");
    cy.containedWithinTestId("maintenance-screen-right", "192.168.001.001");
    cy.containedWithinTestId("maintenance-screen-right", "VS8CC82918M7");
    cy.containedWithinTestId("maintenance-screen-right", "5.16.124");
  });

  it("should allow user to perform a restart", () => {
    cy.intercept("**/api/device/status", []);
    cy.intercept("**/api/system/restart", { statusCode: 204 }).as("restart");
    cy.intercept("**/api/system/system", system);
    cy.visit("/instruments/");
    cy.getByTestId("ivls-restart-button").click();
    cy.getByTestId("ivls-restart-modal").should("be.visible");
    cy.containedWithinTestId("ivls-restart-modal", "Restart");
    cy.containedWithinTestId(
      "ivls-restart-modal",
      "Are you sure you want to restart the IDEXX VetLab Station now?"
    );
    cy.containedWithinTestId("ivls-restart-modal", "Cancel");
    cy.getByTestId("done-button").click();
    cy.wait("@restart").then((interception) => {
      assert.equal(interception.response.statusCode, 204);
    });
  });

  it("should allow user to perform a power down", () => {
    cy.intercept("**/api/device/status", []);
    cy.intercept("**/api/system/shutdown", { statusCode: 204 }).as(
      "power-down"
    );
    cy.intercept("**/api/system/system", system);
    cy.visit("/instruments/");
    cy.getByTestId("ivls-power-down-button").click();
    cy.getByTestId("ivls-power-down-modal").should("be.visible");
    cy.containedWithinTestId("ivls-power-down-modal", "Power Down");
    cy.containedWithinTestId(
      "ivls-power-down-modal",
      "Are you sure you want to power down the IDEXX VetLab Station now?"
    );
    cy.containedWithinTestId("ivls-power-down-modal", "Cancel");
    cy.getByTestId("done-button").click();
    cy.wait("@power-down").then((interception) => {
      assert.equal(interception.response.statusCode, 204);
    });
  });
  it("should allow user to view detailed system information", () => {
    cy.intercept("**/api/device/status", []);
    cy.intercept("**/api/system/system", system);
    cy.intercept("**/api/upgrade/system_software_version", softwareVersion);
    cy.visit("/instruments/");
    cy.getByTestId("system-info-link").click();
    cy.getByTestId("system-info-screen")
      .containedWithinTestId("system-info-screen", "System Information")
      .containedWithinTestId(
        "system-info-screen",
        "This product includes the following open-source software libraries:"
      );
    //Back button should bring should bring user to System Tab
    cy.getByTestId("system-settings-back-button").click();
    cy.containedWithinTestId(
      "system-maintenance-screen",
      "IDEXX VetLab Station"
    );
  });
  it("should allow user to view individual software license and close modal - AOP Alliance", () => {
    cy.intercept("**/api/device/status", []);
    cy.intercept("**/api/system/system", system);
    cy.intercept("**/api/upgrade/system_software_version", softwareVersion);
    cy.visit("/instruments/");
    cy.getByTestId("system-info-link").click();
    cy.intercept("**/api/serverResource/eula/AOPALLIANCE", AOPALLIANCE);
    cy.contains("AOP Alliance").click();
    cy.getByTestId("confirm-modal").should("be.visible");
    cy.getByTestId("done-button").click();
    //modal closes
    cy.getByTestId("confirm-modal").should("not.exist");
  });
});
