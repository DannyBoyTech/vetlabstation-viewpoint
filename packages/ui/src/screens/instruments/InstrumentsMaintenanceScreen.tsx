import { InstrumentStatusDto, InstrumentType } from "@viewpoint/api";
import { useContext, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useGetInstrumentQuery } from "../../api/InstrumentApi";
import { CatOneMaintenanceScreen } from "./catone/CatOneMaintenanceScreen";
import { useTranslation } from "react-i18next";
import { ViewpointHeaderContext } from "../../context/HeaderContext";
import { TFunction } from "i18next";
import { SediVueDxMaintenanceScreen } from "./sedivue/SediVueDxMaintenanceScreen";
import { InVueDxMaintenanceScreen } from "./invuedx/InVueDxMaintenanceScreen";
import { useHeaderTitle } from "../../utils/hooks/hooks";

type InstrumentComponent = (props: {
  instrument: InstrumentStatusDto;
}) => React.JSX.Element;

const MaintenanceScreens: { [key in InstrumentType]?: InstrumentComponent } = {
  [InstrumentType.CatalystOne]: CatOneMaintenanceScreen,
  [InstrumentType.SediVueDx]: SediVueDxMaintenanceScreen,
  [InstrumentType.Theia]: InVueDxMaintenanceScreen,
} as const;

export const InstrumentMaintenanceScreen = () => {
  const { instrumentId: instrumentIdStr } = useParams();
  const { t } = useTranslation();

  const instrumentId = Number(instrumentIdStr);

  const { data: instrument } = useGetInstrumentQuery(instrumentId);

  useHeaderTitle({
    label:
      instrument == null
        ? ""
        : t("instrumentScreens.maintenance.title", {
            instrumentName: instrument?.instrument.instrumentType
              ? t(`instruments.names.${instrument?.instrument.instrumentType}`)
              : "",
          }),
  });

  const MaintenanceScreen =
    instrument && MaintenanceScreens[instrument?.instrument.instrumentType];

  return MaintenanceScreen ? (
    <MaintenanceScreen instrument={instrument} />
  ) : null;
};
