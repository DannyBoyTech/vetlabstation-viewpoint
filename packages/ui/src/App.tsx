import { Header } from "./components/header/Header";
import styled from "styled-components";
import { Suspense, useContext, useEffect, useState } from "react";
import { ViewpointThemeContext } from "./context/ThemeContext";
import { DarkTheme, Theme } from "./utils/StyleConstants";
import "react-simple-keyboard/build/css/index.css";
import { ViewpointInputContext } from "./context/InputContext";
import { AssayTypeModalContainer } from "./components/assay-type-modal/AssayTypeModalContainer";
import { useInstrumentMaintenanceResultActions } from "./components/instrument-maintenance/InstrumentMaintenanceResultHooks";
import { Outlet } from "react-router-dom";
import { useSmartQCResultActions } from "./components/qc/SmartQCResultHooks";
import { useConnectionRequestActions } from "./components/eula/ConnectionRequestHooks";
import "./utils/dayjs-setup";
import { usePatientJobActions } from "./utils/hooks/push/PatientJobHooks";
import { useRinseModalAddListener } from "./components/global-modals/components/GlobalRinseModal";
import {
  useUpgradeAvailableNotifier,
  useUpgradeCompleteStatusNotification,
  useUpgradeStatusNotifier,
} from "./screens/instruments/system/upgrades/UpgradeHooks";
import {
  useRemoteRestoreRequestHandler,
  useRestoreStatusNotifier,
} from "./screens/instruments/system/restore/RestoreHooks";
import { FirstBootWorkflow } from "./screens/boot/FirstBootWorkflow";
import { useMessageCenterNotifications } from "./utils/hooks/push/MessageCenterHooks";
import { useGetSmartServiceStatusQuery } from "./api/SmartServiceApi";
import { Spinner, SpotText } from "@viewpoint/spot-react/src";
import { useRequestSystemRestartMutation } from "./api/SystemInfoApi";
import { useTranslation } from "react-i18next";
import { SettingTypeEnum } from "@viewpoint/api";
import {
  useGetSettingsQuery,
  useUpdateSettingMutation,
} from "./api/SettingsApi";
import {
  usePostRestoreEulaModal,
  useResetRescheduledOfflineNotification,
  useSmartServiceActivationHook,
  useSmartServiceOfflineNotifier,
} from "./utils/hooks/push/SmartServiceHooks";
import { BootRoot, BootScreen } from "./screens/boot/BootWorkflow";
import { useIsShuttingDown } from "./context/EventSourceContext";
import { useLabRequestCompleteHook } from "./utils/hooks/push/LabResultHook";
import {
  ViewPointAppStateApiContext,
  ViewPointAppStateDataContext,
} from "./context/AppStateContext";
import { AlertModal } from "./components/alerts/AlertModal";
import { useGetBootItemsQuery } from "./api/BootItemsApi";
import {
  useSnapTimerBeeper,
  useTimerCompleteToast,
} from "./utils/hooks/push/RunTimerHooks";
import { useLanguage } from "./utils/hooks/LocalizationHooks";
import { useRestartNotificationPopup } from "./utils/hooks/push/RestartNotificationHooks";
import {
  useInitializeIvlsSettingsForViewpoint,
  useLaserCyteSafetyMeasures,
} from "./utils/hooks/push/StartupHooks";
import { useCalibrationResultActions } from "./screens/instruments/urisysdx/CalibrationResultHook";
import { GlobalKeyboard } from "./components/keyboard/GlobalKeyboard";
import { usePreventContextMenu } from "./utils/hooks/prevent-context-menu";
import { useInstrumentProgressStateCapture } from "./utils/hooks/push/InstrumentProgressHooks";
import SpinnerOverlay from "./components/overlay/SpinnerOverlay";
import { useResultStatusNotificationPopup } from "./utils/hooks/push/ResultStatusNotificationHooks";
import { useHeapUserProps } from "./analytics/heap/heap-user-props-hook";
import { useResultAutoPrintHandler } from "./utils/print/resultAutoPrint";
import {
  useCatalystSmartQcReminder,
  useCatalystSmartQCResultActions,
} from "./components/qc/CatalystSmartQCHooks";
import { trackAppLoad } from "./analytics/nltx-events";
import { useAppLoadTracking } from "./analytics/app-load-tracking";

const ShuttingDownOverlay = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;

  .spot-typography__heading--level-3 {
    color: ${DarkTheme.colors?.text?.primary};
  }
`;

function App() {
  const [firstBootComplete, setFirstBootComplete] = useState(false);
  const { data: bootItems } = useGetBootItemsQuery();
  const { data: smartServiceStatus } = useGetSmartServiceStatusQuery();
  const { canProceed } = useLaserCyteSafetyMeasures();
  const { t } = useTranslation();
  const [updateSetting] = useUpdateSettingMutation();
  const [requestRestart] = useRequestSystemRestartMutation();

  const shuttingDown = useIsShuttingDown();

  if (bootItems == null || smartServiceStatus == null) {
    return <></>;
  } else if (!canProceed) {
    return <BootScreen />;
  } else if (
    !firstBootComplete &&
    (bootItems.isFirstBoot || bootItems.timeZoneOnBoarding)
  ) {
    return (
      <FirstBootWorkflow
        onComplete={async (restartRequired) => {
          if (bootItems.isFirstBoot) {
            await updateSetting({
              settingType: SettingTypeEnum.FIRST_BOOT,
              settingValue: "false",
            }).unwrap();
          }
          if (restartRequired) {
            requestRestart();
          }
          setFirstBootComplete(true);
        }}
        bootItems={bootItems}
        smartServiceStatus={smartServiceStatus}
      />
    );
  } else if (shuttingDown) {
    return (
      <BootRoot>
        <ShuttingDownOverlay>
          <Spinner size="large" />
          <SpotText level="h3">{t("general.messages.shuttingDown")}</SpotText>
        </ShuttingDownOverlay>
      </BootRoot>
    );
  } else {
    return <PostBootApp />;
  }
}

const AppRoot = styled.div`
  height: 100vh;
  width: 100vw;
  max-height: 100vh;
  max-width: 100vw;
  display: flex;
  flex-direction: column;
  background-color: ${(p: { theme: Theme }) =>
    p.theme.colors?.background?.secondary};
  overflow: hidden;
`;

const ContentRoot = styled.div`
  position: relative;
  display: flex;
  width: 100%;
  flex: 1;
  overflow: hidden;
`;

function PostBootApp() {
  const { theme } = useContext(ViewpointThemeContext);
  const inputContext = useContext(ViewpointInputContext);
  const { alertsModalVisible, alertsModalInstrumentId } = useContext(
    ViewPointAppStateDataContext
  );
  const { closeAlertsModal } = useContext(ViewPointAppStateApiContext);

  useAppLoadTracking();
  useHeapUserProps();
  usePreventContextMenu();
  useInitializeIvlsSettingsForViewpoint();
  useUpgradeStatusNotifier();
  useRestoreStatusNotifier();
  useUpgradeAvailableNotifier();
  useInstrumentMaintenanceResultActions();
  useSmartQCResultActions();
  useCatalystSmartQCResultActions();
  useCatalystSmartQcReminder();
  useCalibrationResultActions();
  useConnectionRequestActions();
  usePatientJobActions();
  useRinseModalAddListener();
  useLanguage();
  useMessageCenterNotifications();
  useSmartServiceActivationHook();
  useSmartServiceOfflineNotifier();
  useResetRescheduledOfflineNotification();
  usePostRestoreEulaModal();
  useLabRequestCompleteHook();
  useRemoteRestoreRequestHandler();
  useResultAutoPrintHandler();
  useUpgradeCompleteStatusNotification();
  useTimerCompleteToast();
  useSnapTimerBeeper();
  useRestartNotificationPopup();
  useInstrumentProgressStateCapture();
  useResultStatusNotificationPopup();

  return (
    <AppRoot className={theme.primaryContainerClass}>
      <Header />
      <ContentRoot>
        <Suspense fallback={<SpinnerOverlay />}>
          <Outlet />
        </Suspense>
      </ContentRoot>
      <AssayTypeModalContainer />
      {!inputContext.inputDisabled && <GlobalKeyboard />}
      {alertsModalVisible && (
        <AlertModal
          open={alertsModalVisible}
          initialInstrumentId={alertsModalInstrumentId}
          onClose={closeAlertsModal}
        />
      )}
    </AppRoot>
  );
}

export default App;
