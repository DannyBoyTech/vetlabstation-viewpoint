import dayjs from "dayjs";
import {
  SettingTypeEnum,
  TimeConfigurationDto,
  TimeZoneDto,
  TimeZoneMigrationTypeEnum,
} from "@viewpoint/api";
import { interceptGlobalRequests } from "../../util/default-intercepts";

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
const LOCATIONS = [
  { countryCode: "US", countryName: "United States" },
  {
    countryCode: "GB",
    countryName: "United Kingdom",
  },
];

const LOCAL_DATE_TIME = dayjs();

describe("time and date settings", () => {
  beforeEach(() => {
    interceptGlobalRequests();
    cy.intercept({ pathname: "**/api/timeZone/list" }, (req) => {
      if (req.query["countryCode"] != null) {
        req.reply(TIME_ZONES[req.query["countryCode"]]);
      } else {
        req.reply(Object.values(TIME_ZONES).flat());
      }
    }).as("tzList");

    cy.intercept("**/api/timeZone/locations", LOCATIONS).as("locations");

    cy.intercept({ method: "POST", pathname: "**/api/timeZone" }, {}).as(
      "saveTimeConfig"
    );

    cy.intercept(
      { method: "GET", pathname: "**/api/timeZone" },
      {
        dstEnabled: true,
        localDateTime: LOCAL_DATE_TIME.format("YYYY-M-D-H-m-s-SSS")
          .split("-")
          .map(Number),
        migrationType: TimeZoneMigrationTypeEnum.NONE,
        timeZoneId: "America/New_York",
      }
    ).as("timeConfig");
    cy.intercept(
      {
        pathname: "**/api/settings",
        query: { setting: SettingTypeEnum.CLINIC_COUNTRY },
      },
      { [SettingTypeEnum.CLINIC_COUNTRY]: "US" }
    ).as("settings");
  });

  describe("connected", () => {
    beforeEach(() => {
      cy.intercept("**/api/timeZone/sync", "true").as("sync");

      cy.visit("settings/time_date");

      cy.wait("@sync");
      cy.wait("@timeConfig");
      cy.wait("@locations");
      cy.wait("@tzList");
      cy.wait("@settings");
    });

    it("allows user to adjust their time configuration, saving once they navigate away from the settings page", () => {
      // Disable DST
      cy.getByTestId("toggle-dst").should("be.checked");
      cy.contains("Automatically adjust").click(); // Actual input is too small to click since it's hidden

      // Verify locations
      cy.getByTestId("time-and-date-location-select")
        .as("locationSelect")
        .should("have.value", "US")
        .find("option")
        .then((options) =>
          expect([...options].map((o) => o.value)).to.deep.eq([
            "NO_LOCATION",
            ...LOCATIONS.map((loc) => loc.countryCode),
          ])
        );

      // Verify TZs match the selected location
      cy.getByTestId("time-and-date-tz-select")
        .as("tzSelect")
        .should("have.value", "NO_TIMEZONE_ID")
        .find("option")
        .then((options) =>
          expect([...options].map((o) => o.value)).to.deep.eq([
            "NO_TIMEZONE_ID",
            ...TIME_ZONES["US"].map((tz) => tz.timeZoneId),
          ])
        );

      cy.intercept({
        pathname: "**/api/timeZone/list",
        query: { countryCode: "GB" },
      }).as("gbTzs");

      // Update the location, verify TZs update as well
      cy.get("@locationSelect").select("GB");
      cy.wait("@gbTzs");

      cy.waitUntil(() =>
        cy
          .get("@tzSelect")
          .find("option")
          .then((options) => {
            try {
              expect([...options].map((o) => o.value)).to.deep.eq([
                "NO_TIMEZONE_ID",
                ...TIME_ZONES["GB"].map((tz) => tz.timeZoneId),
              ]);
            } catch (err) {
              return false;
            }
          })
      );

      // Update the TZ
      cy.get("@tzSelect").select("Europe/London");

      // Try to go home to save the settings
      cy.getByTestId("header-left").click();
      cy.getByTestId("settings-restart-modal")
        .should("be.visible")
        .getByTestId("done-button")
        .click();

      const expectedRequestBody: TimeConfigurationDto = {
        dstEnabled: false,
        timeZoneId: "Europe/London",
        migrationType: TimeZoneMigrationTypeEnum.NONE,
      };

      cy.wait("@saveTimeConfig")
        .its("request.body")
        .should("deep.equal", {
          ...expectedRequestBody,
          "@class": "com.idexx.labstation.core.dto.TimeConfigurationDto",
        });
    });
  });

  describe("disconnected", () => {
    beforeEach(() => {
      cy.intercept("**/api/timeZone/sync", "false").as("sync");

      cy.visit("settings/time_date");

      cy.wait("@sync");
      cy.wait("@timeConfig");
      cy.wait("@locations");
      cy.wait("@tzList");
      cy.wait("@settings");
    });

    it("allows user to adjust the local time of the PC when not syncing", () => {
      cy.getByTestId("twelve-hour-select-hours")
        .as("hoursSelect")
        .should("have.value", LOCAL_DATE_TIME.format("h"))
        .select("8");
      cy.getByTestId("twelve-hour-select-minutes")
        .as("minutesSelect")
        .should("have.value", LOCAL_DATE_TIME.format("m"))
        .select("33");
      cy.getByTestId("twelve-hour-select-ampm")
        .as("amPmSelect")
        .should("have.value", LOCAL_DATE_TIME.hour() >= 12 ? "PM" : "AM")
        .select("PM");

      cy.getByTestId("header-left").click();
      cy.getByTestId("settings-restart-modal")
        .should("be.visible")
        .getByTestId("done-button")
        .click();

      const expectedRequestBody: TimeConfigurationDto = {
        dstEnabled: true,
        timeZoneId: "America/New_York",
        migrationType: TimeZoneMigrationTypeEnum.NONE,
        localDateTime: LOCAL_DATE_TIME.hour(20)
          .minute(33)
          .millisecond(0)
          .format("YYYY-M-D-H-m-s-SSS")
          .split("-")
          .map(Number),
      };

      cy.wait("@saveTimeConfig")
        .its("request.body")
        .should("deep.equal", {
          ...expectedRequestBody,
          "@class": "com.idexx.labstation.core.dto.TimeConfigurationDto",
        });
    });
  });
});
