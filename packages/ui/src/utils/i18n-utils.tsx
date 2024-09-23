import { InlineText } from "../components/typography/InlineText";

export const CommonTransComponents = {
  linebreak: (
    <>
      <br />
      <br />
    </>
  ),
  shortlinebreak: <br />,
  strong: <InlineText level="paragraph" bold />,
  ul: <ul />,
  ol: <ol />,
  li: <li />,
};

const BCP47_LANGTAG_BY_IVLS_LANG: Record<string, string> = {
  cs: "cs",
  de: "de",
  en: "en",
  es: "es",
  fr: "fr",
  it: "it",
  ja: "ja",
  ko: "ko",
  nl: "nl",
  pl: "pl",
  pt: "pt",
  th: "th",
  tr: "tr",
  zh_CN: "zh-cn",
  zh_TW: "zh-tw",
};

export const DEFAULT_BCP47_LOCALE = BCP47_LANGTAG_BY_IVLS_LANG.en;

/**
 * Converts IVLS language code to standard (BCP 47) language tag.
 * Browser locale APIs expect valid tags.
 *
 * Falls back to the appliction's default fallback language if the IVLS language is not known language.
 */
export function stdLocale(ivlsLanguage?: string) {
  if (ivlsLanguage == null) return DEFAULT_BCP47_LOCALE;
  return BCP47_LANGTAG_BY_IVLS_LANG[ivlsLanguage] ?? DEFAULT_BCP47_LOCALE;
}

export function getDecimalSeparator(ivlsLanguage: string) {
  try {
    return (
      Intl.NumberFormat(stdLocale(ivlsLanguage))
        ?.formatToParts(1.1)
        ?.find((part) => part.type === "decimal")?.value ?? "."
    );
  } catch (err) {
    console.error(
      `Unable to determine decimal separator for locale ${ivlsLanguage}`,
      err
    );
    return ".";
  }
}
