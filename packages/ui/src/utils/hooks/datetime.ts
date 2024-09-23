import dayjs from "dayjs";

//dayjs does not include non-english locales by default,  force inclusion via import.
import "dayjs/locale/cs";
import "dayjs/locale/de";
import "dayjs/locale/es";
import "dayjs/locale/fr";
import "dayjs/locale/it";
import "dayjs/locale/ja";
import "dayjs/locale/ko";
import "dayjs/locale/nl";
import "dayjs/locale/pl";
import "dayjs/locale/pt";
import "dayjs/locale/th";
import "dayjs/locale/tr";
import "dayjs/locale/zh-cn";
import "dayjs/locale/zh-tw";

import { useTranslation } from "react-i18next";
import { useMemo } from "react";
import { stdLocale } from "../i18n-utils";

type FormatKey =
  | "dateTime.date"
  | "dateTime.shortDate"
  | "dateTime.dateTime12h"
  | "dateTime.longDateTime12h"
  | "dateTime.mediumDateTime12h"
  | "dateTime.dayOfMonth"
  | "dateTime.durationMinsSecs"
  | "dateTime.time12h"
  | "dateTime.dayAndTime12h";

type DayjsInput = Parameters<typeof dayjs>[0];

type Formattable = DayjsInput;

function isFormattable(it: unknown): it is Formattable {
  return (
    typeof it === "string" ||
    typeof it === "number" ||
    it instanceof Date ||
    it instanceof dayjs.Dayjs ||
    it == null
  );
}

const useFormat = (format: FormatKey) => {
  const { i18n, t } = useTranslation("formats");

  const formatFn = useMemo(() => {
    const fmt = t(format);
    return (d: DayjsInput) =>
      d == null
        ? undefined
        : dayjs(d).locale(stdLocale(i18n.language)).format(fmt);
  }, [t, format, i18n.language]);

  return formatFn;
};

const useFormatDate = () => useFormat("dateTime.date");

const useFormatShortDate = () => useFormat("dateTime.shortDate");

const useFormatDayOfMonth = () => useFormat("dateTime.dayOfMonth");

const useFormatTime12h = () => useFormat("dateTime.time12h");

const useFormatDateISO = () => {
  return (d: DayjsInput) => dayjs(d).format("YYYY-MM-DD");
};

const useFormatDateTime12h = () => useFormat("dateTime.dateTime12h");

const useFormatMediumDateTime12h = () =>
  useFormat("dateTime.mediumDateTime12h");

const useFormatLongDateTime12h = () => useFormat("dateTime.longDateTime12h");

const useFormatDurationMinsSecs = () => useFormat("dateTime.durationMinsSecs");

const useFormatDayAndTime12h = () => useFormat("dateTime.dayAndTime12h");

export type { FormatKey, Formattable };

export {
  isFormattable,
  useFormat,
  useFormatDate,
  useFormatShortDate,
  useFormatDateISO,
  useFormatDateTime12h,
  useFormatLongDateTime12h,
  useFormatMediumDateTime12h,
  useFormatDayOfMonth,
  useFormatDurationMinsSecs,
  useFormatTime12h,
  useFormatDayAndTime12h,
};
