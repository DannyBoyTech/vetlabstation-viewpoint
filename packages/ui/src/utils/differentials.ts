import { InstrumentType, SampleTypeEnum } from "@viewpoint/api";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { supportsNonWholeBlood } from "./instrument-utils";
import cssUrl from "../index.css?url";
import { injectCssLink } from "./html-utils";

interface DifferentialRetVal {
  differential?: string | undefined;
  native?: boolean;
}

export function useDifferential(
  assayIdentityName: string,
  instrumentType?: InstrumentType,
  sampleType?: SampleTypeEnum
): DifferentialRetVal {
  const ns = "differentials";
  const { t, i18n } = useTranslation(ns);

  return useMemo(() => {
    if (assayIdentityName == null) {
      return {};
    }

    const keys =
      supportsNonWholeBlood(instrumentType) &&
      sampleType !== SampleTypeEnum.WHOLEBLOOD
        ? [`${assayIdentityName}-NONBLOOD`, assayIdentityName]
        : [assayIdentityName];

    const result = keys.reduce((acc, key) => {
      return acc.differential != null
        ? acc
        : {
            differential: i18n.exists(key, { ns }) ? t(key, { ns }) : undefined,
            native: i18n.exists(key, { ns, fallbackLng: i18n.language }),
          };
    }, {} as DifferentialRetVal);

    if (result.differential != null) {
      result.differential = injectCssLink(result.differential, cssUrl);
    }

    return result;
  }, [t, i18n, assayIdentityName, sampleType, instrumentType]);
}
