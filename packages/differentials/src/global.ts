import { JSDOM } from "jsdom";

export type NonNullable<T> = Exclude<T, null | undefined>;

export const VP_LOCALES_BY_DXD_LOCALE = {
  de: undefined,
  de_AT: undefined,
  de_CH: undefined,
  de_DE: "de_de",
  en_AU: undefined,
  en_CA: undefined,
  en_DK: undefined,
  en_ES: undefined,
  en_FI: undefined,
  en_FR: undefined,
  en_GB: undefined,
  en_NO: undefined,
  en_SE: undefined,
  en_US: "en",
  es_ES: undefined,
  fr: undefined,
  fr_CA: undefined,
  fr_CH: undefined,
  fr_FR: "fr_fr",
  it_IT: "it_it",
  ja_JP: "ja_jp",
  ko_KR: "ko_kr",
  nl_NL: "nl_nl",
} as const;

export type DxDLocaleKey = NonNullable<keyof typeof VP_LOCALES_BY_DXD_LOCALE>;

export type VpLocaleKey = NonNullable<
  (typeof VP_LOCALES_BY_DXD_LOCALE)[keyof typeof VP_LOCALES_BY_DXD_LOCALE]
>;

export function isDxDLocaleKey(str: string): str is DxDLocaleKey {
  return Object.keys(VP_LOCALES_BY_DXD_LOCALE)
    .filter((it) => it != null)
    .includes(str);
}

export function isVpLocaleKey(str: string): str is VpLocaleKey {
  return Object.values<string | undefined>(VP_LOCALES_BY_DXD_LOCALE)
    .filter((it) => it != null)
    .includes(str);
}

export function vpLocaleKey(
  dxdLocaleKey: DxDLocaleKey
): VpLocaleKey | undefined {
  return VP_LOCALES_BY_DXD_LOCALE[dxdLocaleKey];
}

export interface Differential {
  analyteId: string;
  code: string;
  locale: string;
  content: JSDOM;
}

export type DifferentialByCode = Record<
  Differential["code"],
  Differential["content"]
>;

export type WritableDifferentialCollection = Partial<
  Record<VpLocaleKey, DifferentialByCode>
>;
