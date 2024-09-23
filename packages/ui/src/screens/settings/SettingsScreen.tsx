import styled from "styled-components";
import React, { useEffect, useState } from "react";
import SpinnerOverlay from "../../components/overlay/SpinnerOverlay";
import { Trans, useTranslation } from "react-i18next";
import { useHeaderTitle } from "../../utils/hooks/hooks";
import { useNavigate } from "react-router-dom";
import { LanguageScreen } from "./Language";
import { LeftSideBar } from "./LeftSideBar";
import { TimeAndDateSettings } from "./TimeAndDateSettings";
import ViewpointSettingsProvider, {
  useFlushPendingSettings,
  useIsRebootRequired,
} from "./SettingsScreenContext";
import { unstable_useBlocker as useBlocker } from "react-router";
import { ConfirmModal } from "../../components/confirm-modal/ConfirmModal";
import { CommonTransComponents } from "../../utils/i18n-utils";
import { useRequestSystemRestartMutation } from "../../api/SystemInfoApi";
import { PracticeInfo } from "./PracticeInfo/PracticeInfo";
import { ReportSettings } from "./ReportSettings";
import { Display } from "./Display";
import { VetConnectPlusSettings } from "./vcp/VetConnectPlusSettings";
import { PageContent } from "../../components/layout/common-layout-components";
import { UnitScreen } from "./Units";
import { SmartServiceSettings } from "./SmartService/SmartServiceSettings";
import { PracticeManagementSettingsScreen } from "./practiceManagement/PracticeManagement";
import { AlertsAndNotifications } from "./AlertsAndNotifications";
import { PrintingSettings } from "./PrintingSettings";
import {
  OrderedCategories,
  SettingsCategory,
} from "./common-settings-components";

const SettingsScreenRoot = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  overflow-y: hidden;
`;

const StyledContent = styled(PageContent)`
  display: flex;
  flex-direction: column;
  gap: 50px;
  position: relative;
`;

export const TestId = {
  settingsRestartModal: "settings-restart-modal",
} as const;

interface SettingsScreenProps {
  settingsSection: SettingsCategory;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  settingsSection,
}) => {
  const [selectedItem, setSelectedItem] = useState<SettingsCategory>(
    SettingsCategory.LANGUAGE
  );

  const { t } = useTranslation();
  const nav = useNavigate();

  useHeaderTitle({
    label: t("header.navigation.settings"),
  });

  useEffect(() => {
    setSelectedItem(settingsSection);
  }, [settingsSection]);

  return (
    <ViewpointSettingsProvider>
      <SettingsScreenRoot>
        <LeftSideBar
          items={OrderedCategories}
          onSelected={(id) =>
            nav(
              `/settings/${typeof id !== "number" ? id?.toLowerCase() : id}`,
              {
                replace: true,
              }
            )
          }
          selectedOption={selectedItem}
        />

        <SettingsContent settingsSection={settingsSection} />
      </SettingsScreenRoot>
    </ViewpointSettingsProvider>
  );
};

interface SettingsContentProps {
  settingsSection: SettingsCategory;
}

function SettingsContent(props: SettingsContentProps) {
  const [flushing, setFlushing] = useState(false);
  const rebootRequired = useIsRebootRequired();
  const flushPendingSettings = useFlushPendingSettings();

  const [restart] = useRequestSystemRestartMutation();

  const { t } = useTranslation();

  const blocker = useBlocker(
    ({ nextLocation }) =>
      rebootRequired &&
      !nextLocation.pathname.toLowerCase().includes("settings")
  );
  return (
    <>
      {flushing && <SpinnerOverlay />}
      {getSettingsContent(props.settingsSection)}
      {blocker.state === "blocked" && (
        <ConfirmModal
          data-testid={TestId.settingsRestartModal}
          dismissable={false}
          headerContent={t("settings.confirmRestart.title")}
          bodyContent={
            <Trans
              i18nKey={"settings.confirmRestart.body"}
              components={CommonTransComponents}
            />
          }
          confirmButtonContent={t("settings.confirmRestart.restartNow")}
          cancelButtonContent={t("general.buttons.cancel")}
          onConfirm={async () => {
            try {
              setFlushing(true);
              await flushPendingSettings();
              await restart().unwrap();
              blocker.proceed();
            } catch (err) {
              console.error(err);
            } finally {
              setFlushing(false);
            }
          }}
          open={true}
          onClose={() => blocker.proceed()}
        />
      )}
    </>
  );
}

function getSettingsContent(currentSection: SettingsCategory) {
  switch (currentSection) {
    case SettingsCategory.LANGUAGE:
      return <LanguageScreen />;
    case SettingsCategory.TIME_DATE:
      return <TimeAndDateSettings />;
    case SettingsCategory.PRACTICE_INFO:
      return <PracticeInfo />;
    case SettingsCategory.REPORTS:
      return <ReportSettings />;
    case SettingsCategory.UNITS:
      return <UnitScreen />;
    case SettingsCategory.SMART_SERVICE:
      return <SmartServiceSettings />;
    case SettingsCategory.VET_CONNECT_PLUS:
      return <VetConnectPlusSettings />;
    case SettingsCategory.DISPLAY:
      return <Display />;
    case SettingsCategory.PRACTICE_MANAGEMENT:
      return <PracticeManagementSettingsScreen />;
    case SettingsCategory.ALERTS_NOTIFICATIONS:
      return <AlertsAndNotifications />;
    case SettingsCategory.PRINTING:
      return <PrintingSettings />;

    default:
      return <></>;
  }
}
