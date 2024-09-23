import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import I18NextHttpBackend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";

/**
 * Converts the app's language code to the ones being used by our phrase
 * translations. We could get rid of this if we aligned the language codes
 * (preferably to an specified standard).
 *
 * @param lng
 * @returns language code that will find the language via http backend
 */
const toPhraseLang = (lng: string) =>
  ({
    cs: "cs_cz",
    de: "de_de",
    en: "en",
    es: "es_es",
    fr: "fr_fr",
    it: "it_it",
    ja: "ja_jp",
    ko: "ko_kr",
    nl: "nl_nl",
    pl: "pl_pl",
    pt: "pt_br",
    th: "th_th",
    tr: "tr_tr",
    zh_CN: "zh_cn",
    zh_TW: "zh_tw",
  }[lng] ?? lng);

const httpBackend = new I18NextHttpBackend();
httpBackend.init(null, {
  loadPath: (lngs, nss) => {
    const lng = toPhraseLang(lngs[0]);
    return `/locales/${lng}/${nss}.json`;
  },
});

export const I18nNs = {
  Translation: "translation",
  Alerts: "alerts",
  Formats: "formats",
  Links: "links",
  Captions: "captions",
} as const;

export default i18n
  .use(LanguageDetector)
  .use(httpBackend)
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    // resources,
    ns: Object.values(I18nNs),
    defaultNS: I18nNs.Translation,
    load: "languageOnly",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });
