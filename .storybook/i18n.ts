import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "@viewpoint/ui/public/locales/en/translation.json";
import alerts from "@viewpoint/ui/public/locales/en/alerts.json";
import formats from "@viewpoint/ui/public/locales/en/formats.json";
import differentials from "@viewpoint/ui/public/locales/en/differentials.json";

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    ns: ["translation", "alerts", "formats", "differentials"],
    defaultNS: "translation",
    resources: {
      en: { translation: en, alerts, formats, differentials },
    },
    fallbackLng: "en",
    interpolation: {
      escapeValue: false, // react already escapes for us
    },
  });

export default i18n;
