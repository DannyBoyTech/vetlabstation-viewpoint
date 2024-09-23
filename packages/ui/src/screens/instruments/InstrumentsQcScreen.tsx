import { InstrumentStatusDto, InstrumentType } from "@viewpoint/api";
import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useGetInstrumentQuery } from "../../api/InstrumentApi";
import { CatalystQcScreen } from "./common/CatalystQcScreen";
import { ProCyteOneQcScreen } from "./procyteone/qc/ProCyteOneQcScreen";
import { TenseiQcScreen } from "./tensei/qc/TenseiQcScreen";
import { ProCyteDxQcScreen } from "./procytedx/qc/ProCyteDxQcScreen";
import { SediVueDxQcScreen } from "./sedivue/qc/SediVueDxQcScreen";
import { VetTestQcScreen } from "./vettest/VetTestQcScreen";
import { useHeaderTitle } from "../../utils/hooks/hooks";
import { instrumentNameForType } from "../../utils/instrument-utils";
import { useTranslation } from "react-i18next";
import { UriSysDxCalibrationScreen } from "./urisysdx/UriSysDxCalibrationScreen";

type InstrumentComponent = (props: {
  instrument: InstrumentStatusDto;
}) => JSX.Element;

const QcLotsScreens: { [key in InstrumentType]?: InstrumentComponent } = {
  [InstrumentType.CatalystDx]: CatalystQcScreen,
  [InstrumentType.CatalystOne]: CatalystQcScreen,
  [InstrumentType.VetTest]: VetTestQcScreen,
  [InstrumentType.ProCyteOne]: ProCyteOneQcScreen,
  [InstrumentType.ProCyteDx]: ProCyteDxQcScreen,
  [InstrumentType.SediVueDx]: SediVueDxQcScreen,
  [InstrumentType.Tensei]: TenseiQcScreen,
  [InstrumentType.UriSysDx]: UriSysDxCalibrationScreen,
};

const InstrumentsQcScreen = () => {
  const { instrumentId: instrumentIdStr } = useParams();

  const instrumentId = useMemo(
    () => Number(instrumentIdStr),
    [instrumentIdStr]
  );

  const { data: instrument } = useGetInstrumentQuery(instrumentId);
  const { t } = useTranslation();

  useHeaderTitle({
    label:
      instrument == null
        ? undefined
        : instrument.instrument.instrumentType === InstrumentType.UriSysDx
        ? t("instrumentScreens.uriSysDx.uaCalibration")
        : t("qc.header", {
            instrumentName: instrumentNameForType(
              t,
              instrument.instrument.instrumentType
            ),
          }),
  });
  const QcScreen =
    instrument && QcLotsScreens[instrument?.instrument.instrumentType];

  return QcScreen ? <QcScreen instrument={instrument} /> : null;
};

export { InstrumentsQcScreen };
