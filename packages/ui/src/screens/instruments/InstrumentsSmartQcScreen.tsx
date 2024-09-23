import { InstrumentStatusDto, InstrumentType } from "@viewpoint/api";
import { CatOneSmartQcScreen } from "./catone/qc/CatOneSmartQcScreen";
import { CatalystDxSmartQcScreen } from "./catdx/qc/CatalystDxSmartQcScreen";
import { useParams } from "react-router-dom";
import { useMemo, JSX } from "react";
import { useGetInstrumentQuery } from "../../api/InstrumentApi";
import { useTranslation } from "react-i18next";
import { useHeaderTitle } from "../../utils/hooks/hooks";
import { instrumentNameForType } from "../../utils/instrument-utils";

type InstrumentComponent = (props: {
  instrumentStatus: InstrumentStatusDto;
}) => JSX.Element;

const SmartQcScreens: { [key in InstrumentType]?: InstrumentComponent } = {
  [InstrumentType.CatalystOne]: CatOneSmartQcScreen,
  [InstrumentType.CatalystDx]: CatalystDxSmartQcScreen,
};

const InstrumentsSmartQcScreen = () => {
  const { instrumentId: instrumentIdStr } = useParams();

  const instrumentId = useMemo(
    () => Number(instrumentIdStr),
    [instrumentIdStr]
  );

  const { data: instrumentStatus } = useGetInstrumentQuery(instrumentId);
  const { t } = useTranslation();

  useHeaderTitle({
    label: t("instrumentScreens.smartQc.title", {
      instrumentName:
        instrumentStatus == null
          ? undefined
          : instrumentNameForType(
              t,
              instrumentStatus.instrument.instrumentType
            ),
    }),
  });
  const SmartQcScreen =
    instrumentStatus &&
    SmartQcScreens[instrumentStatus.instrument.instrumentType];

  return SmartQcScreen ? (
    <SmartQcScreen instrumentStatus={instrumentStatus} />
  ) : null;
};

export { InstrumentsSmartQcScreen };
