import styled from "styled-components";
import { instrumentApi } from "../../api/InstrumentApi";
import { useContext, useEffect, useMemo } from "react";
import SpinnerOverlay from "../../components/overlay/SpinnerOverlay";
import { useTranslation } from "react-i18next";
import {
  useHeaderTitle,
  useInstrumentSortingFn,
} from "../../utils/hooks/hooks";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { LeftSideBar } from "./LeftSideBar";
import {
  InstrumentStatus,
  InstrumentStatusDto,
  InstrumentType,
} from "@viewpoint/api";
import { CatOneInstrumentScreen } from "./catone/CatOneInstrumentsScreen";
import { CatDxInstrumentScreen } from "./catdx/CatDxInstrumentsScreen";
import { SpotIcon } from "@viewpoint/spot-icons";
import { SpotText } from "@viewpoint/spot-react";
import { LightTheme } from "../../utils/StyleConstants";
import { ProCyteOneInstrumentScreen } from "./procyteone/ProCyteOneInstrumentsScreen";
import { SediVueDxInstrumentScreen } from "./sedivue/SediVueDxInstrumentScreen";
import { LegacyInstrumentScreen } from "./common/LegacyInstrumentScreen";
import { SnapShotDxInstrumentScreen } from "./ssdx/SnapShotDxInstrumentScreen";
import { ProCyteDxInstrumentScreen } from "./procytedx/ProCyteDxInstrumentScreen";
import { VetTestInstrumentScreen } from "./vettest/VetTestInstrumentScreen";
import { SnapProInstrumentScreen } from "./snappro/SnapProInstrumentScreen";
import { UAAnalyzerInstrumentScreen } from "./uaanalyzer/UAAnalyzerInstrumentScreen";
import { UriSysDxInstrumentScreen } from "./urisysdx/UriSysDxInstrumentScreen";
import { SystemScreen } from "./system/SystemScreen";
import { InVueDxInstrumentScreen } from "./invuedx/InVueDxInstrumentScreen";
import { SnapInstrumentScreen } from "./snap/SnapInstrumentScreen";
import { TenseiInstrumentScreen } from "./tensei/TenseiInstrumentScreen";
import { ViewPointAppStateApiContext } from "../../context/AppStateContext";

export type InstrumentScreenSelection = number | "SYSTEM";

const InstrumentScreenRoot = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  overflow-y: hidden;
`;

export function InstrumentsScreen() {
  const { instrumentId: idParam } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const { t } = useTranslation();
  const nav = useNavigate();
  const { showAlertsModal } = useContext(ViewPointAppStateApiContext);
  const sortInstruments = useInstrumentSortingFn();

  useHeaderTitle({
    label: t("header.navigation.instruments"),
  });

  const {
    data: instruments,
    isLoading,
    isSuccess,
    isError,
  } = instrumentApi.useGetInstrumentStatusesQuery(undefined, {
    selectFromResult: (results) => ({
      ...results,
      data: [...(results.data ?? [])]
        .filter(({ instrument }) => instrument.supportsInstrumentScreen)
        .sort(sortInstruments),
    }),
  });

  const selectedItem = useMemo(
    () => (idParam != null ? parseInt(idParam) : "SYSTEM"),
    [idParam]
  );

  const instrumentStatusForItem = useMemo(
    () => instruments.find(({ instrument }) => instrument.id === selectedItem),
    [instruments, selectedItem]
  );

  const instrumentContent = useMemo(() => {
    if (selectedItem === "SYSTEM") {
      return <SystemScreen />;
    }

    return instrumentStatusForItem != null
      ? getInstrumentContent(instrumentStatusForItem)
      : undefined;
  }, [selectedItem, instrumentStatusForItem]);

  useEffect(() => {
    if (isError || (isSuccess && instrumentContent == null)) {
      nav("/");
    }
  }, [isError, isSuccess, instrumentContent, nav]);

  useEffect(() => {
    if (
      searchParams.get("showAlerts") === "true" &&
      instrumentStatusForItem?.instrumentStatus === InstrumentStatus.Alert
    ) {
      showAlertsModal(instrumentStatusForItem?.instrument.id);
    }
    setSearchParams({});
  }, [instrumentStatusForItem, searchParams, setSearchParams, showAlertsModal]);

  return (
    <InstrumentScreenRoot>
      {isLoading && <SpinnerOverlay />}
      <LeftSideBar
        instruments={instruments ?? []}
        onSelected={(id) =>
          nav(id === "SYSTEM" ? "/system" : `/instruments/${id}`, {
            replace: true,
          })
        }
        selectedOption={selectedItem}
      />
      {instrumentContent}
    </InstrumentScreenRoot>
  );
}

const UnderConstruction = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

function getInstrumentContent(instrument?: InstrumentStatusDto) {
  switch (instrument?.instrument.instrumentType) {
    case InstrumentType.CatalystOne:
      return (
        <CatOneInstrumentScreen
          instrument={instrument}
          key={instrument.instrument.id}
        />
      );
    case InstrumentType.CatalystDx:
      return (
        <CatDxInstrumentScreen
          instrumentStatus={instrument}
          key={instrument.instrument.id}
        />
      );
    case InstrumentType.ProCyteOne:
      return (
        <ProCyteOneInstrumentScreen
          instrument={instrument}
          key={instrument.instrument.id}
        />
      );
    case InstrumentType.SediVueDx:
      return (
        <SediVueDxInstrumentScreen
          instrumentStatus={instrument}
          key={instrument.instrument.id}
        />
      );
    case InstrumentType.SNAPshotDx:
      return (
        <SnapShotDxInstrumentScreen
          instrumentStatus={instrument}
          key={instrument.instrument.id}
        />
      );
    case InstrumentType.ProCyteDx:
      return (
        <ProCyteDxInstrumentScreen
          instrumentStatus={instrument}
          key={instrument.instrument.id}
        />
      );
    case InstrumentType.VetTest:
      return (
        <VetTestInstrumentScreen
          instrumentStatus={instrument}
          key={instrument.instrument.id}
        />
      );
    case InstrumentType.UAAnalyzer:
      return (
        <UAAnalyzerInstrumentScreen
          instrumentStatus={instrument}
          key={instrument.instrument.id}
        />
      );

    case InstrumentType.UriSysDx:
      return (
        <UriSysDxInstrumentScreen
          instrumentStatus={instrument}
          key={instrument.instrument.id}
        />
      );

    case InstrumentType.VetStat:
    case InstrumentType.CoagDx:
    case InstrumentType.VetLyte:
    case InstrumentType.AutoReader:
      return (
        <LegacyInstrumentScreen
          instrumentStatus={instrument}
          key={instrument.instrument.id}
        />
      );
    case InstrumentType.SNAPPro:
      return <SnapProInstrumentScreen key="snap_pro" />;
    case InstrumentType.SNAP:
      return <SnapInstrumentScreen />;
    case InstrumentType.Theia:
      return (
        <InVueDxInstrumentScreen
          instrumentStatusDto={instrument}
          key={instrument.instrument.id}
        />
      );
    case InstrumentType.Tensei:
      return (
        <TenseiInstrumentScreen
          instrumentStatusDto={instrument}
          key={instrument.instrument.id}
        />
      );
    default:
      return (
        <UnderConstruction>
          <SpotIcon
            name="alert-notification"
            size="30"
            color={LightTheme.colors?.feedback?.warning}
          />
          <SpotText level="secondary">Under Construction</SpotText>
        </UnderConstruction>
      );
  }
}
