import { InstrumentStatusDto, InstrumentType } from "@viewpoint/api";
import { useContext, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useGetInstrumentQuery } from "../../api/InstrumentApi";
import { CatOneMaintenanceScreen } from "./catone/CatOneMaintenanceScreen";
import { useTranslation } from "react-i18next";
import { ViewpointHeaderContext } from "../../context/HeaderContext";
import { ProCyteOneDiagnosticsScreen } from "./procyteone/maintenance/ProCyteOneDiagnosticsScreen";
import { ProCyteDxDiagnosticsScreen } from "./procytedx/maintenance/ProCyteDxDiagnosticsScreen";
import { TFunction } from "i18next";
import { SediVueDxMaintenanceScreen } from "./sedivue/SediVueDxMaintenanceScreen";
import { InVueDxMaintenanceScreen } from "./invuedx/InVueDxMaintenanceScreen";
import { TenseiDiagnosticsScreen } from "./tensei/maintenance/TenseiDiagnosticsScreen";
import { InVueDxDiagnosticsScreen } from "./invuedx/diagnostics/InVueDxDiagnosticsScreen";
import { useHeaderTitle } from "../../utils/hooks/hooks";

type InstrumentComponent = (props: {
  instrument: InstrumentStatusDto;
}) => React.JSX.Element;

const DiagnosticScreens: { [key in InstrumentType]?: InstrumentComponent } = {
  [InstrumentType.ProCyteOne]: ProCyteOneDiagnosticsScreen,
  [InstrumentType.ProCyteDx]: ProCyteDxDiagnosticsScreen,
  [InstrumentType.Tensei]: TenseiDiagnosticsScreen,
  [InstrumentType.Theia]: InVueDxDiagnosticsScreen,
} as const;

export const InstrumentDiagnosticsScreens = () => {
  const { instrumentId: instrumentIdStr } = useParams();
  const { t } = useTranslation();

  const instrumentId = Number(instrumentIdStr);

  const { data: instrument } = useGetInstrumentQuery(instrumentId);

  useHeaderTitle({
    label:
      instrument == null
        ? ""
        : t("instrumentScreens.diagnostics.title", {
            instrumentName: instrument?.instrument.instrumentType
              ? t(`instruments.names.${instrument?.instrument.instrumentType}`)
              : "",
          }),
  });

  const DiagnosticsScreen =
    instrument && DiagnosticScreens[instrument?.instrument.instrumentType];

  return DiagnosticsScreen ? (
    <DiagnosticsScreen instrument={instrument} />
  ) : null;
};
