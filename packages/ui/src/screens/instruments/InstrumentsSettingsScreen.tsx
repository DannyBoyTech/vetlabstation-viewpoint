import { InstrumentType } from "@viewpoint/api";
import { CatOneSettingsScreen } from "./catone/CatOneSettingsScreen";
import { ProCyteOneSettingsScreen } from "./procyteone/ProCyteOneSettingsScreen";
import {
  useHeaderTitle,
  useInstrumentForPathParamId,
} from "../../utils/hooks/hooks";
import { ProCyteDxSettingsScreen } from "./procytedx/ProCyteDxSettingsScreen";
import { useTranslation } from "react-i18next";
import { UAAnalyzerSettingsScreen } from "./uaanalyzer/UAAnalyzerSettingsScreen";
import { UriSysDxSettingsScreen } from "./urisysdx/UriSysDxSettingsScreen";
import { SediVueDxSettingsScreen } from "./sedivue/SediVueDxSettingsScreen";
import { SnapSettingsScreen } from "./snap/SnapSettingsScreen";
import { TenseiSettingsScreen } from "./tensei/TenseiSettingsScreen";

export function SettingsScreenRouter() {
  const { data: instrument } = useInstrumentForPathParamId();
  const { t } = useTranslation();

  useHeaderTitle({
    label: t("instrumentScreens.common.settings.header", {
      instrumentName:
        instrument == null
          ? null
          : t(`instruments.names.${instrument.instrument.instrumentType}`),
    }),
  });

  switch (instrument?.instrument.instrumentType) {
    case InstrumentType.CatalystOne:
      return <CatOneSettingsScreen />;
    case InstrumentType.ProCyteOne:
      return <ProCyteOneSettingsScreen instrumentStatus={instrument} />;
    case InstrumentType.ProCyteDx:
      return <ProCyteDxSettingsScreen instrumentStatus={instrument} />;
    case InstrumentType.SediVueDx:
      return <SediVueDxSettingsScreen />;
    case InstrumentType.SNAP:
      return <SnapSettingsScreen />;
    case InstrumentType.UAAnalyzer:
      return <UAAnalyzerSettingsScreen />;
    case InstrumentType.UriSysDx:
      return <UriSysDxSettingsScreen />;
    case InstrumentType.Tensei:
      return <TenseiSettingsScreen instrumentStatus={instrument} />;
    default:
      return <></>;
  }
}
