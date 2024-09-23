import { describe, expect } from "vitest";
import dayjs from "dayjs";
import {
  fromIvlsDateTimeArray,
  getAgeString,
  getCityFromTimeZone,
  getLongTimeZoneName,
  getShortTimeZoneName,
  isDstSupported,
  toIvlsDateTimeArray,
} from "./date-utils";

describe("getAgeString", () => {
  const now = dayjs(new Date("2022-11-03"));

  const cases: [string | number, string | undefined][] = [
    ["2022-11-02", "1d"],
    ["2022-10-03", "1mo"],
    ["2021-11-03", "1yr"],
    ["2021-11-02", "1yr"], // Ignore days if age is > 1 year
    ["2022-10-02", "1mo 1d"],
    ["2021-08-12", "1yr 3mo"], // Round up month when days aren't displayed and are > 15
    ["2023-01-01", undefined], // Invalid future date
    ["bad-date", undefined], // Invalid date format
    [new Date("2021-08-12").getTime(), "1yr 3mo"], // Epoch number format also works
  ];
  it.each(cases)("parses %s to %s", (birthDate, expectedString) => {
    expect(getAgeString(birthDate, now)).toEqual(expectedString);
  });
});

describe("getLongTimeZoneName", () => {
  const cases: [string, number, string][] = [
    ["America/New_York", 0, "Eastern Standard Time"],
    ["America/New_York", 6, "Eastern Daylight Time"],
    ["America/Los_Angeles", 0, "Pacific Standard Time"],
    ["America/Los_Angeles", 6, "Pacific Daylight Time"],
    ["America/Phoenix", 0, "Mountain Standard Time"],
    ["America/Phoenix", 6, "Mountain Standard Time"],
  ];

  it.each(cases)(
    "converts %s time zone ID in month %s to %s long display name",
    (tzId, month, expectedDisplay) => {
      expect(
        getLongTimeZoneName(tzId, "us", dayjs().month(month).toDate())
      ).toEqual(expectedDisplay);
    }
  );
});

describe("getShortTimeZoneName", () => {
  const cases: [string, number, string][] = [
    ["America/New_York", 0, "EST"],
    ["America/New_York", 6, "EDT"],
    ["America/Los_Angeles", 0, "PST"],
    ["America/Los_Angeles", 6, "PDT"],
    ["America/Phoenix", 0, "MST"],
    ["America/Phoenix", 6, "MST"],
  ];

  it.each(cases)(
    "converts %s time zone ID in month %s to %s short display name",
    (tzId, month, expectedDisplay) => {
      expect(
        getShortTimeZoneName(tzId, "us", dayjs().month(month).toDate())
      ).toEqual(expectedDisplay);
    }
  );
});

describe("getCityFromTimeZone", () => {
  const cases: [string, string][] = [
    ["America/New_York", "New York"],
    ["America/Los_Angeles", "Los Angeles"],
    ["America/Phoenix", "Phoenix"],
    ["Asia/Samarkand", "Samarkand"],
  ];

  it.each(cases)(
    "converts %s time zone ID to city name %s",
    (tzId, expectedDisplay) => {
      expect(getCityFromTimeZone(tzId)).toEqual(expectedDisplay);
    }
  );
});
describe("getCityFromTimeZone", () => {
  const cases: [string, boolean][] = [
    ["America/New_York", true],
    ["America/Los_Angeles", true],
    ["America/Phoenix", false],
    ["Pacific/Pago_Pago", false],
    ["Asia/Samarkand", false],
  ];

  it.each(cases)("for time zone ID %s returns %s", (tzId, expected) => {
    expect(isDstSupported(tzId)).toEqual(expected);
  });
});

describe("toIvlsDateTimeArray", () => {
  const cases: [string, number[]][] = [
    ["2020-03-12T03:12:17", [2020, 3, 12, 3, 12, 17, 0]],
    ["1998-12-29T17:59:17.041", [1998, 12, 29, 17, 59, 17, 41000000]],
  ];
  it.each(cases)(
    "converts time %s to IVLS datetime array format %s",
    (timeString, expectedArr) => {
      expect(toIvlsDateTimeArray(dayjs(timeString))).toEqual(expectedArr);
    }
  );
});

describe("fromIvlsDateTimeArray", () => {
  const cases: [number[], string][] = [
    [[2020, 2, 12, 3, 12, 17, 0], "2020-02-12T03:12:17.000"],
    [[1998, 11, 29, 17, 59, 17, 41000000], "1998-11-29T17:59:17.041"], // IVLS Does not provide milliseconds
  ];
  it.each(cases)(
    "converts IVLS datetime array %s to date %s",
    (arr, expectedTimeString) => {
      expect(
        fromIvlsDateTimeArray(arr).format("YYYY-MM-DDTHH:mm:ss.SSS")
      ).toEqual(expectedTimeString);
    }
  );
});
