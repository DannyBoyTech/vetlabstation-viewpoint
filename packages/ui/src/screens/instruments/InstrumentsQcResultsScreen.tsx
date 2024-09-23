import { InstrumentType } from "@viewpoint/api";
import { useParams } from "react-router-dom";
import { useGetInstrumentQuery } from "../../api/InstrumentApi";
import { useHeaderTitle } from "../../utils/hooks/hooks";
import { instrumentNameForType } from "../../utils/instrument-utils";
import { useTranslation } from "react-i18next";
import { useGetQcLotsQuery } from "../../api/QualityControlApi";
import { skipToken } from "@reduxjs/toolkit/query";
import SpinnerOverlay from "../../components/overlay/SpinnerOverlay";
import { SediVueDxQualityControlResultsScreen } from "./sedivue/SediVueDxQualityControlResultsScreen";
import { ProCyteDxQualityControlResultsScreen } from "./procytedx/ProCyteDxQualityControlResultsScreen";

const InstrumentsQcResultsScreen = () => {
  const { instrumentId: instrumentIdStr, qualityControlId: qcIdStr } =
    useParams();

  const instrumentId = Number(instrumentIdStr);
  const qcId = Number(qcIdStr);

  const { data: instrumentStatus } = useGetInstrumentQuery(instrumentId);
  const { currentData: qcLotInfo } = useGetQcLotsQuery(
    instrumentStatus == null
      ? skipToken
      : {
          instrumentId,
          instrumentType: instrumentStatus.instrument.instrumentType,
        },
    {
      selectFromResult: (result) => ({
        ...result,
        currentData: [...(result.data ?? [])].find(
          (qcDto) => qcDto.id === qcId
        ),
      }),
    }
  );
  const { t } = useTranslation();

  useHeaderTitle({
    label: t("qc.header", {
      instrumentName:
        instrumentStatus == null
          ? undefined
          : instrumentNameForType(
              t,
              instrumentStatus.instrument.instrumentType
            ),
    }),
  });

  if (instrumentStatus != null && qcLotInfo != null) {
    switch (instrumentStatus?.instrument.instrumentType) {
      case InstrumentType.SediVueDx:
        return (
          <SediVueDxQualityControlResultsScreen
            instrumentStatus={instrumentStatus}
            qcLotInfo={qcLotInfo}
          />
        );
      case InstrumentType.ProCyteDx:
        return (
          <ProCyteDxQualityControlResultsScreen
            instrumentStatus={instrumentStatus}
            qcLotInfo={qcLotInfo}
          />
        );
    }
  }

  return <SpinnerOverlay />;
};

export { InstrumentsQcResultsScreen };
