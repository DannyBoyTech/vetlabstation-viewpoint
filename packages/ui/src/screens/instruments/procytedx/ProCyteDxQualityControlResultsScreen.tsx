import { InstrumentStatusDto, QcLotDto } from "@viewpoint/api";
import { QcResultsScreen } from "../common/qc/QcResultsScreen";

export interface ProCyteDxQualityControlResultsScreenProps {
  instrumentStatus: InstrumentStatusDto;
  qcLotInfo: QcLotDto;
}

export function ProCyteDxQualityControlResultsScreen(
  props: ProCyteDxQualityControlResultsScreenProps
) {
  const trendReportUrl = `/labstation-webapp/api/report/crimsonQualityReport?instrumentId=${props.instrumentStatus.instrument.id}&qualityControlId=${props.qcLotInfo.id}`;
  return (
    <QcResultsScreen
      instrumentStatus={props.instrumentStatus}
      qcLotInfo={props.qcLotInfo}
      trendReportUrl={trendReportUrl}
    />
  );
}
