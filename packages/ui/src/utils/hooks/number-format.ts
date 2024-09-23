import { useTranslation } from "react-i18next";
import { useCallback } from "react";

export function useFormatPercent() {
  const { t } = useTranslation("formats");
  return useCallback(
    (percent: number | string) => t("number.percent", { value: percent }),
    [t]
  );
}
