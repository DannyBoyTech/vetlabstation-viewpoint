import dayjs from "dayjs";
import { stdLocale } from "./i18n-utils";

export const getAgeString = (date: number | string, now = dayjs()) => {
  const parsed = dayjs(new Date(date));
  if (!parsed.isValid() || parsed.isAfter(now)) {
    return undefined;
  }
  const alignedYear = parsed.set(
    "year",
    now.year() - (parsed.month() > now.month() ? 1 : 0)
  );
  const alignedMonth = parsed
    .set("year", now.year())
    .set("month", now.month() - (parsed.date() > now.date() ? 1 : 0));

  const years = now.diff(parsed, "year");
  let months = alignedYear.isAfter(now)
    ? alignedYear.diff(now, "month")
    : now.diff(alignedYear, "month");
  const days = alignedMonth.isAfter(now)
    ? alignedMonth.diff(now, "day")
    : now.diff(alignedMonth, "day");

  const parts = [];
  if (years > 0) {
    parts.push(`${years}yr`);
  }
  if (months > 0) {
    // If we're only displaying years and months, round up on the months
    if (years > 0 && days >= 15) {
      months++;
    }
    parts.push(`${months}mo`);
  }
  if ((days > 0 && years < 1) || (days === 0 && years === 0 && months === 0)) {
    parts.push(`${days}d`);
  }
  return parts.join(" ");
};

export function getLongTimeZoneName(
  timeZoneId?: string,
  ivlsLanguage?: string,
  date: Date = new Date()
): string | undefined {
  if (timeZoneId == null) {
    return undefined;
  }
  return new Intl.DateTimeFormat(stdLocale(ivlsLanguage), {
    day: "numeric",
    timeZoneName: "long",
    timeZone: timeZoneId,
  }).formatToParts(date)[2].value;
}

export function getShortTimeZoneName(
  timeZoneId?: string,
  ivlsLanguage?: string,
  date: Date = new Date()
): string | undefined {
  if (timeZoneId == null) {
    return undefined;
  }
  return new Intl.DateTimeFormat(stdLocale(ivlsLanguage), {
    day: "numeric",
    timeZoneName: "short",
    timeZone: timeZoneId,
  }).formatToParts(date)[2].value;
}

export function getCityFromTimeZone(timeZoneId?: string) {
  if (timeZoneId == null) {
    return undefined;
  }
  return timeZoneId.split("/")?.pop()?.replaceAll("_", " ");
}

// Checks if daylight saving is observed for the given time zone for this year.
// Not completely fool-proof -- there are some edge cases where offset shifts
// are not due to DST, and in the future it's possible that a DST shift happens
// at different times of the year, but as a way to provide a default value which
// the user can later change, this approach should cover the majority of cases.
export function isDstSupported(timeZoneId: string) {
  return (
    dayjs().month(0).tz(timeZoneId).utcOffset() !==
    dayjs().month(6).tz(timeZoneId).utcOffset()
  );
}

export function toIvlsDateTimeArray(dateTime: dayjs.Dayjs) {
  return [
    dateTime.year(),
    dateTime.month() + 1,
    dateTime.date(),
    dateTime.hour(),
    dateTime.minute(),
    dateTime.second(),
    dateTime.millisecond() * 1000000,
  ];
}

export function fromIvlsDateTimeArray(dateTime: number[]) {
  if (dateTime.length !== 7) {
    throw new Error(
      `Invalid IVLS date/time array: ${JSON.stringify(dateTime)}`
    );
  }
  return (
    dayjs()
      .year(dateTime[0])
      // IVLS uses 1-12 for months, DayJS uses 0-11
      .month(dateTime[1] - 1)
      .date(dateTime[2])
      .hour(dateTime[3])
      .minute(dateTime[4])
      .second(dateTime[5])
      // Last value IVLS sends is nanoseconds, not millis
      .millisecond((dateTime[6] ?? 0) / 1000000)
  );
}
