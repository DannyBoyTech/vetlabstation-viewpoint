import { beforeEach, describe, expect } from "vitest";
import { TestId, TimeAndDateSettings } from "./TimeAndDateSettings";
import {
  SettingTypeEnum,
  TimeConfigurationDto,
  TimeZoneDto,
  TimeZoneMigrationTypeEnum,
} from "@viewpoint/api";
import { rest } from "msw";
import { server } from "../../../test-utils/mock-server";
import dayjs from "dayjs";
import { render } from "../../../test-utils/test-utils";
import { waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ViewpointSettingsProvider from "./SettingsScreenContext";

const TimeZoneMappings: Record<string, TimeZoneDto[]> = {
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

describe("time and date settings", () => {
  beforeEach(() => {
    mockCurrentTimeConfig();
    mockLocations();
    mockClinicLocationSetting();
    mockTimeZoneList();
    mockSync();
  });

  it("shows time zones by default based on the user's clinic country setting", async () => {
    mockClinicLocationSetting("US");
    const { findByTestId } = render(<TimeDateSettingsTestBed />);
    // Location drop down defaults to clinic setting
    const locationSelect = await findByTestId(TestId.locationSelect);
    await waitFor(() => expect(locationSelect).toHaveValue("US"));

    // TZ values are loaded based on the location selection, which right now is the default ("US")
    const tzSelect = await findByTestId(TestId.timeZoneSelect);
    const initialTzOptions = await within(tzSelect).findAllByRole("option");
    expect(initialTzOptions).toHaveLength(TimeZoneMappings["US"].length);
    initialTzOptions.forEach((option, index) =>
      expect(option).toHaveValue(TimeZoneMappings["US"][index].timeZoneId)
    );
  });
  it("updates the list of time zones if the user chooses a new location", async () => {
    mockClinicLocationSetting("US");
    const { findByTestId } = render(<TimeDateSettingsTestBed />);
    // Location drop down defaults to clinic setting
    const locationSelect = await findByTestId(TestId.locationSelect);
    await waitFor(() => expect(locationSelect).toHaveValue("US"));

    // Select a new option from the drop down and verify the TZ list changes to reflect
    const tzSelect = await findByTestId(TestId.timeZoneSelect);
    await userEvent.selectOptions(locationSelect, "GB");
    const newOptions = await waitFor(async () => {
      const newOptions = await within(tzSelect).findAllByRole("option");
      expect(newOptions).toHaveLength(TimeZoneMappings["GB"].length);
      return newOptions;
    });
    newOptions.forEach((option, index) =>
      expect(option).toHaveValue(TimeZoneMappings["GB"][index].timeZoneId)
    );
  });
  it("only allows changing the system time if the user is not syncing", async () => {
    mockSync(true);

    const { rerender, findByTestId, queryByTestId } = render(
      <TimeDateSettingsTestBed />
    );

    expect(
      await queryByTestId(TestId.changeTimeContainer)
    ).not.toBeInTheDocument();

    mockSync(false);
    rerender(<TimeDateSettingsTestBed />);

    expect(await findByTestId(TestId.changeTimeContainer)).toBeVisible();
  });
});

function TimeDateSettingsTestBed() {
  return (
    <ViewpointSettingsProvider>
      <TimeAndDateSettings />
    </ViewpointSettingsProvider>
  );
}

const DefaultTimeConfig: TimeConfigurationDto = {
  timeZoneId: "America/New_York",
  dstEnabled: true,
  migrationType: TimeZoneMigrationTypeEnum.NONE,
  localDateTime: dayjs().format("YYYY-M-D-H-m-s-SSS").split("-").map(Number),
};

function mockCurrentTimeConfig(config?: Partial<TimeConfigurationDto>) {
  server.use(
    rest.get("**/api/timeZone", (req, res, context) =>
      res(
        context.json({
          ...config,
          ...DefaultTimeConfig,
        })
      )
    )
  );
}

function mockClinicLocationSetting(countryCode?: string) {
  server.use(
    rest.get("**/settings", (req, res, context) =>
      res(
        context.json({
          [SettingTypeEnum.CLINIC_COUNTRY]: countryCode ?? "US",
        })
      )
    )
  );
}

function mockLocations() {
  server.use(
    rest.get("**/api/timeZone/locations", (req, res, context) =>
      res(
        context.json([
          {
            countryCode: "GB",
            countryName: "United Kingdom",
          },
          {
            countryCode: "US",
            countryName: "United States",
          },
        ])
      )
    )
  );
}

function mockTimeZoneList() {
  server.use(
    rest.get("**/api/timeZone/list", (req, res, context) =>
      res(
        context.json(
          TimeZoneMappings[req.url.searchParams.get("countryCode") as string]
        )
      )
    )
  );
}

function mockSync(syncing?: boolean) {
  server.use(
    rest.get("**/api/timeZone/sync", (req, res, context) =>
      res(context.json(syncing ?? true))
    )
  );
}
