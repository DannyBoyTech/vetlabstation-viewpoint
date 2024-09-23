import { SettingTypeEnum } from "@viewpoint/api";

const initialSettings = {
  [SettingTypeEnum.WEIGHT_UNIT_TYPE]: "POUNDS",
  [SettingTypeEnum.UNIT_SYSTEM]: "English",
};

describe("units", () => {
  beforeEach(() => {
    cy.intercept(
      {
        method: "GET",
        path: "**/api/settings?setting=UNIT_SYSTEM&setting=WEIGHT_UNIT_TYPE",
      },
      initialSettings
    ).as("get-settings");
  });

  it("should allow updating of units", () => {
    cy.visit("/settings");
    cy.contains("Units").click();
    cy.wait("@get-settings");
    //land on units screen and show default selections
    cy.containedWithinTestId("settings-main", "U.S.");
    cy.containedWithinTestId("settings-main", "Units");
    cy.containedWithinTestId(
      "settings-main",
      "S.I. (International System of Units)"
    );
    cy.containedWithinTestId("settings-main", "French");
    cy.containedWithinTestId("settings-main", "Pounds (lbs)");
    cy.containedWithinTestId("settings-main", "Kilograms (kgs)");
    cy.containedWithinTestId("settings-main", "Weight");
    //make changes

    cy.intercept({ method: "POST", pathname: "**/api/settings" }).as(
      "update-settings"
    );
    cy.contains("French").click();
    cy.wait("@update-settings")
      .its("request.body")
      .should("deep.equal", [
        {
          "@class": "com.idexx.labstation.core.dto.SettingDto",
          settingType: SettingTypeEnum.UNIT_SYSTEM,
          settingValue: "French",
        },
      ]);

    cy.contains("Kilograms (kgs").click();
    cy.wait("@update-settings")
      .its("request.body")
      .should("deep.equal", [
        {
          "@class": "com.idexx.labstation.core.dto.SettingDto",
          settingType: SettingTypeEnum.WEIGHT_UNIT_TYPE,
          settingValue: "KILOGRAMS",
        },
      ]);
  });
});
