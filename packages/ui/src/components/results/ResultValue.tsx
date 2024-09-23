import { Trans, useTranslation } from "react-i18next";
import {
  InstrumentResultDto,
  InstrumentType,
  QualifierTypeEnum,
} from "@viewpoint/api";

export interface ResultValueProps {
  result: InstrumentResultDto;
}

export function ResultValue({ result }: ResultValueProps) {
  const { t } = useTranslation();

  switch (result.instrumentType) {
    case InstrumentType.SNAP:
    case InstrumentType.SNAPshotDx:
    case InstrumentType.SNAPPro:
      if (result.qualifierType === QualifierTypeEnum.NOTCALCULATED) {
        return <>{t("Results.SNAP.NoResult")}</>;
      } else {
        return (
          <Trans
            i18nKey={`Results.SNAP.${result.resultText}` as any}
            /* workaround for < character in translation, encode in translation as &lt; */
            shouldUnescape={true}
            components={{ br: <br /> }}
          >
            {result.resultValueForDisplay}
          </Trans>
        );
      }
    default:
      return <>{result.resultValueForDisplay}</>;
  }
}
