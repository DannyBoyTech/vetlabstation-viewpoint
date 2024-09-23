import { InstrumentStatusDto, InstrumentType } from "@viewpoint/api";
import { useGetInstrumentQuery } from "../../api/InstrumentApi";
import { useParams } from "react-router-dom";
import { SnapReportsScreen } from "./snap/SnapReportsScreen";
import { useHeaderTitle } from "../../utils/hooks/hooks";
import { useTranslation } from "react-i18next";

const reportScreens: {
  [key in InstrumentType]?: React.FC<{ instrument?: InstrumentStatusDto }>;
} = {
  [InstrumentType.SNAP]: SnapReportsScreen,
};

export function ReportsScreens() {
  const { instrumentId: instrumentIdParam } = useParams();
  const { t } = useTranslation();
  const { data: instrument } = useGetInstrumentQuery(
    Number(instrumentIdParam!)
  );

  const instrumentType = instrument?.instrument.instrumentType;

  useHeaderTitle({
    label:
      instrumentType == null
        ? ""
        : t("instrumentScreens.reports.title", {
            instrumentName: t(`instruments.names.${instrumentType}`),
          }),
  });

  const Component =
    instrumentType != null ? reportScreens[instrumentType] : undefined;

  return Component == null ? null : <Component instrument={instrument} />;
}
