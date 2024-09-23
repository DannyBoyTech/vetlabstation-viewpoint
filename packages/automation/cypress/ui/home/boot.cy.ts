import {
  interceptGlobalRequests,
  interceptRequestsForHomeScreen,
} from "../../util/default-intercepts";
import { viteAsset } from "../../util/general-utils";
import {
  SettingTypeEnum,
  TimeZoneDto,
  WindowsEulaTypeEnum,
} from "@viewpoint/api";
import faker from "faker";
import { LocationDto } from "@viewpoint/api/dist/cjs";

const LOCATIONS: LocationDto[] = [
  { countryCode: "US", countryName: "United States" },
  {
    countryCode: "GB",
    countryName: "United Kingdom",
  },
];

const TIME_ZONES: Record<string, TimeZoneDto[]> = {
  US: [
    {
      timeZoneId: "America/New_York",
      displayName: "Eastern Daylight Time",
      shortName: "EST",
      cityName: "New York",
      offset: -14400000,
    },
    {
      timeZoneId: "America/Los_Angeles",
      displayName: "Pacific Daylight Time",
      shortName: "PST",
      cityName: "Los Angeles",
      offset: -25200000,
    },
  ],
  GB: [
    {
      timeZoneId: "Europe/London",
      displayName: "British Summer Time",
      shortName: "GMT",
      cityName: "London",
      offset: 3600000,
    },
  ],
};

describe("boot workflows", () => {
  beforeEach(() => {
    interceptGlobalRequests();
    interceptRequestsForHomeScreen();

    cy.intercept("POST", "**/api/settings", {});
  });
  it("shows loading screen while backend is not ready", () => {
    cy.intercept("GET", "**/api/system/running", JSON.stringify(false));
    cy.visit("/");
    cy.get("#root")
      .find("img")
      .as("background-image")
      .should("be.visible")
      .should("have.attr", "src")
      .and("match", viteAsset("IDEXX_logo_black.png"));

    cy.intercept("GET", "**/api/system/running", JSON.stringify(true));
    cy.get("@background-image", { timeout: 30000 }).should("not.exist");
  });

  it("shows first boot workflow on first boot", () => {
    const eulaContent = faker.lorem.sentence(100);
    cy.intercept("GET", "**/api/boot/getBootItems", {
      isFirstBoot: true,
      restoreDto: { restorePerformed: false },
      upgradeStatusDto: { upgradeAttempted: true },
      timeZoneOnBoarding: true,
    });
    cy.intercept(
      { pathname: "**/api/settings", method: "GET" },
      {
        [SettingTypeEnum.CLINIC_COUNTRY]: "US",
        [SettingTypeEnum.CLINIC_LANGUAGE]: "en",
      }
    );
    cy.intercept("**/api/timeZone/locations", LOCATIONS);

    cy.intercept("**/labstation-webapp/api/system/system", {
      windowsEulaType: WindowsEulaTypeEnum.WINDOWS10,
    });
    cy.intercept(
      "**/labstation-webapp/resources/en/licenses/Windows_10.txt",
      eulaContent
    );

    cy.intercept(
      { pathname: "**/api/timeZone/list", method: "GET" },
      TIME_ZONES["US"]
    );
    cy.intercept("**/api/timeZone/sync", JSON.stringify(true));

    cy.visit("/");

    // Select language and country -- defaults to the settings values.
    cy.getByTestId("confirm-modal").should("be.visible");
    cy.getByTestId("select-language-modal-en-radio").should("be.checked");

    cy.contains("United States").should(
      "have.css",
      "background-color",
      "rgb(226, 245, 255)"
    );
    cy.getByTestId("done-button").click();

    // EULA Acceptance
    cy.contains(eulaContent).should("be.visible");
    cy.get("button").contains("I Agree").click();

    // TZ Settings
    cy.get("button").contains("Next").parent().as("next-button");
    cy.get("@next-button").should("be.disabled");
    cy.getByTestId("time-and-date-tz-select").select("America/New_York");
    cy.get("@next-button").should("be.enabled").click();

    // Restore data
    cy.get("button").contains("Skip").click();
  });

  it("skips time zone onboarding when it is not required", () => {
    cy.intercept("GET", "**/api/boot/getBootItems", {
      isFirstBoot: true,
      restoreDto: { restorePerformed: false },
      upgradeStatusDto: { upgradeAttempted: true },
      timeZoneOnBoarding: false,
    });
    cy.intercept(
      { pathname: "**/api/settings", method: "GET" },
      {
        [SettingTypeEnum.CLINIC_COUNTRY]: "US",
        [SettingTypeEnum.CLINIC_LANGUAGE]: "en",
      }
    );
    cy.intercept("**/api/timeZone/locations", LOCATIONS);

    cy.intercept("**/labstation-webapp/api/system/system", {
      windowsEulaType: WindowsEulaTypeEnum.WINDOWS10,
    });
    cy.intercept(
      "**/labstation-webapp/resources/en/licenses/Windows_10.txt",
      faker.lorem.paragraphs(30)
    );

    cy.intercept(
      { pathname: "**/api/timeZone/list", method: "GET" },
      TIME_ZONES["US"]
    );
    cy.intercept("**/api/timeZone/sync", JSON.stringify(true));

    cy.visit("/");

    // Skip language/country
    cy.getByTestId("done-button").click();

    // Accept EULA
    cy.get("button").contains("I Agree").click();

    // Skip data restore
    cy.get("button").contains("Skip").click();

    // No TZ settings/reboot -- should go straight to the home page
    cy.getByTestId("vp-home-screen-root").should("be.visible");
  });

  it("prompts for time zone entry if time zone has not been configured", () => {
    cy.intercept("GET", "**/api/boot/getBootItems", {
      isFirstBoot: false,
      restoreDto: { restorePerformed: false },
      upgradeStatusDto: { upgradeAttempted: true },
      timeZoneOnBoarding: true,
    });
    cy.intercept(
      { pathname: "**/api/settings", method: "GET" },
      {
        [SettingTypeEnum.CLINIC_COUNTRY]: "US",
        [SettingTypeEnum.CLINIC_LANGUAGE]: "en",
      }
    );
    cy.intercept("**/api/timeZone/locations", LOCATIONS);

    cy.intercept(
      { pathname: "**/api/timeZone/list", method: "GET" },
      TIME_ZONES["US"]
    );
    cy.intercept("**/api/timeZone/sync", JSON.stringify(true));

    cy.visit("/");

    cy.getByTestId("time-and-date-tz-select")
      .should("be.visible")
      .select("America/New_York");

    // No ability to set current time since it's syncing
    cy.contains("Current Time").should("not.exist");
    cy.getByTestId("twelve-hour-select-hours").should("not.exist");
    cy.getByTestId("twelve-hour-select-minutes").should("not.exist");
    cy.getByTestId("twelve-hour-select-ampm").should("not.exist");

    cy.get("button").contains("Next").parent().as("next-button").click();
  });

  it("allows user to set system time if system is not syncing time automatically", () => {
    cy.intercept("GET", "**/api/boot/getBootItems", {
      isFirstBoot: false,
      restoreDto: { restorePerformed: false },
      upgradeStatusDto: { upgradeAttempted: true },
      timeZoneOnBoarding: true,
    });
    cy.intercept(
      { pathname: "**/api/settings", method: "GET" },
      {
        [SettingTypeEnum.CLINIC_COUNTRY]: "US",
        [SettingTypeEnum.CLINIC_LANGUAGE]: "en",
      }
    );
    cy.intercept("**/api/timeZone/locations", LOCATIONS);

    cy.intercept(
      { pathname: "**/api/timeZone/list", method: "GET" },
      TIME_ZONES["US"]
    );
    cy.intercept("**/api/timeZone/sync", JSON.stringify(false));

    cy.visit("/");

    cy.getByTestId("time-and-date-tz-select")
      .should("be.visible")
      .select("America/New_York");

    cy.contains("Current Date/Time").should("be.visible");
    cy.getByTestId("twelve-hour-select-hours").should("be.visible");
    cy.getByTestId("twelve-hour-select-minutes").should("be.visible");
    cy.getByTestId("twelve-hour-select-ampm").should("be.visible");

    cy.get("button").contains("Next").parent().as("next-button").click();
  });
});
