import { InstrumentStatusDto, QcLotDto } from "@viewpoint/api";
import { QcResultsScreen } from "../common/qc/QcResultsScreen";

export interface SediVueDxQualityControlResultsScreenProps {
  instrumentStatus: InstrumentStatusDto;
  qcLotInfo: QcLotDto;
}

export function SediVueDxQualityControlResultsScreen(
  props: SediVueDxQualityControlResultsScreenProps
) {
  const trendReportUrl = `/labstation-webapp/api/report/urisedQualityReport?instrumentSerialNumber=${
    props.instrumentStatus.instrument.instrumentSerialNumber
  }&fluidType=${props.qcLotInfo.fluidType === 1 ? "LEVEL1" : "LEVEL2"}`;
  return (
    <QcResultsScreen
      data-testid="svdx-wc-results-modal"
      instrumentStatus={props.instrumentStatus}
      qcLotInfo={props.qcLotInfo}
      trendReportUrl={trendReportUrl}
      getQcControlLabel={(qcLotInfo, t) =>
        `${t("qc.level")} ${
          qcLotInfo.fluidType ?? t("general.placeholder.noValue")
        }`
      }
    />
  );
}
