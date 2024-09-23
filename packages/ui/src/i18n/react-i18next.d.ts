import "react-i18next";
import en from "../../public/locales/en/translation.json";
import alerts from "../../public/locales/en/alerts.json";
import formats from "../../public/locales/en/formats.json";
import links from "../../public/locales/en/links.json";
import captions from "../../public/locales/en/captions.json";

// react-i18next versions higher than 11.11.0
declare module "react-i18next" {
  // and extend them!
  interface CustomTypeOptions {
    // custom namespace type if you changed it
    defaultNS: "translation";
    // custom resources type
    resources: {
      translation: typeof en;
      alerts: typeof alerts;
      formats: typeof formats;
      differentials: { [key: string]: string };
      links: typeof links;
      captions: typeof captions;
    };
  }
}
