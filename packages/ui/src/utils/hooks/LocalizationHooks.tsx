import { useCallback, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useGetSettingsQuery } from "../../api/SettingsApi";
import { SettingTypeEnum } from "@viewpoint/api";

export const useNoI18n = () => {
  return useMemo(() => {
    const viteEnv = import.meta.env ?? {};
    return window.main?.getNoI18n() ?? (viteEnv.DEV && viteEnv.VP_NO_I18N); // electron envvars take priority, but fallback to vite settings
  }, []);
};
export const useLanguage = () => {
  const { i18n } = useTranslation();
  const noI18n = useNoI18n();

  // This will automatically update the value when it changes due to cache invalidation happening
  // by RTK query as well as in the redux connector context that invalidates cache based on AMQP messages
  const { data: settings } = useGetSettingsQuery([
    SettingTypeEnum.CLINIC_LANGUAGE,
  ]);

  useEffect(() => {
    if (settings?.CLINIC_LANGUAGE != null || noI18n) {
      const language = noI18n ? "cimode" : settings?.CLINIC_LANGUAGE;
      console.log(`Changing UI language to ${language}`);
      i18n.changeLanguage(language).catch((err) => console.error(err));
    }
  }, [i18n, noI18n, settings?.CLINIC_LANGUAGE]);
};

export interface PersonalNameProps {
  firstName?: string;
  lastName?: string;
  middleName?: string;
}

export const useFormatPersonalName = () => {
  const { t } = useTranslation();

  return useCallback(
    (props: PersonalNameProps) =>
      t("general.personalName", {
        firstName: props.firstName ?? "",
        middleName: props.middleName ?? "",
        lastName: props.lastName ?? "",
      }).trim(),
    [t]
  );
};
type ReversedPersonalNameContenxt = "lastOnly" | "firstOnly" | undefined;

// Get context value for the i18next key used.
function getReversedPersonalNameContext(
  values: PersonalNameProps
): ReversedPersonalNameContenxt {
  if (
    (values.firstName ?? "").length > 0 &&
    (values.lastName ?? "".length > 0)
  ) {
    return undefined;
  }
  if ((values.lastName ?? "").length > 0) {
    return "lastOnly";
  }
  return "firstOnly";
}

/**
 * Returns personal name formatted in reverse order
 * aka "{{lastName}}, {{firstName}} {{(optional) middleName}}"
 * i18next does not appear to support conditional portions of copy based
 * only interpolation values, so we are making use of "context"
 *
 * See https://www.i18next.com/translation-function/context
 */
export const useFormatPersonalNameReversed = () => {
  const { t } = useTranslation();
  return useCallback(
    (props: PersonalNameProps) => {
      const values = {
        firstName: props.firstName ?? "",
        middleName: props.middleName ?? "",
        lastName: props.lastName ?? "",
        context: getReversedPersonalNameContext(props),
      };
      return t("general.personalNameReversed", {
        ...values,
      }).trim();
    },
    [t]
  );
};
