import { useCallback, useState } from "react";
import { Button, SpotText } from "@viewpoint/spot-react";
import { Trans, useTranslation } from "react-i18next";
import { InstrumentInfo } from "../InstrumentInfo";
import {
  InstrumentPageContent,
  InstrumentPageRightPanel,
  InstrumentPageRightPanelButtonContainer,
  InstrumentPageRightPanelDivider,
  InstrumentPageRoot,
} from "../common-components";
import styled from "styled-components";
import { Link } from "../../../components/Link";
import {
  useGetSystemInfoQuery,
  useGetSystemSoftwareVersionQuery,
  useRequestSystemRestartMutation,
  useRequestSystemShutdownMutation,
} from "../../../api/SystemInfoApi";
import { SystemUpgrade } from "./upgrades/SystemUpgrade";
import { SystemBackup } from "./backup/SystemBackup";
import { UsbRestore } from "./restore/UsbRestore";
import { useConfirmModal } from "../../../components/global-modals/components/GlobalConfirmModal";
import { useNavigate } from "react-router-dom";
import {
  useLazyGetFileSystemBackupQuery,
  usePerformRestoreMutation,
  useValidateRestoreFileMutation,
} from "../../../api/RestoreApi";
import {
  ModeEnum,
  RestoreFileDto,
  RestoreSource,
  RestoreValidationResponse,
} from "@viewpoint/api";
import { CommonTransComponents } from "../../../utils/i18n-utils";
import { getSystemDisplayImage } from "../../../utils/instrument-utils";
import { useClearAllPrintJobs } from "../../settings/clearAllPrintJobs";

export const TestId = {
  PowerDownButton: "ivls-power-down-button",
  PowerOnButton: "ivls-power-on-button",
  restartModal: "ivls-restart-modal",
  powerDownModal: "ivls-power-down-modal",
  restartButton: "ivls-restart-button",
  clearAllPrintJobsModal: "clear-all-print-jobs-modal",
} as const;

const StyledContent = styled(InstrumentPageContent)`
  display: flex;
  flex-direction: column;
  gap: 50px;
`;

const Overview = styled.div`
  display: flex;
  flex-direction: row;
  gap: 50px;
`;

const Settings = styled.div`
  display: flex;
`;

const Column = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 20px;
`;

const Info = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  justify-content: center;
`;

const SystemImageContainer = styled.div`
  width: 80px;
`;

const SystemImage = styled.img`
  object-fit: contain;
  height: 100%;
  width: 100%;
`;

export function SystemScreen() {
  const [upgradeModalVisible, setUpgradeModalVisible] = useState(false);
  const [backupModalVisible, setBackupModalVisible] = useState(false);
  const [restoreModalVisible, setRestoreModalVisible] = useState(false);

  const { t } = useTranslation();

  const { data: systemInfo } = useGetSystemInfoQuery();
  const { data } = useGetSystemSoftwareVersionQuery();
  const [requestPowerDown] = useRequestSystemShutdownMutation();
  const [requestRestart] = useRequestSystemRestartMutation();
  const [getFileSystemBackup] = useLazyGetFileSystemBackupQuery();
  const [validateRestore] = useValidateRestoreFileMutation();
  const [performRestore] = usePerformRestoreMutation();

  const vpVersion = window.main?.getAppVersion();

  const { addConfirmModal } = useConfirmModal();
  const nav = useNavigate();

  const checkRestore = async () => {
    // Check if there's a restore file on the file system (usually sent via SmartService)
    const fsRestore = await getFileSystemBackup().unwrap();
    if (fsRestore != null) {
      showFsRestoreModal(fsRestore);
    } else {
      setRestoreModalVisible(true);
    }
  };

  const showFutureSoftwareModal = useCallback(() => {
    addConfirmModal({
      headerContent: t("restore.futureSoftware.title"),
      bodyContent: (
        <Trans
          i18nKey="restore.futureSoftware.body"
          components={CommonTransComponents}
        />
      ),
      confirmButtonContent: t("general.buttons.ok"),
      onClose: () => {},
      onConfirm: () => {},
    });
  }, [addConfirmModal, t]);

  const showFsRestoreModal = useCallback(
    (fsRestore: RestoreFileDto) => {
      addConfirmModal({
        dismissable: false,
        headerContent: t("restore.ssRestoreModal.header"),
        bodyContent: t("restore.ssRestoreModal.body"),
        confirmButtonContent: t("general.buttons.ok"),
        cancelButtonContent: t("general.buttons.cancel"),
        onConfirm: async () => {
          const validationResponse = await validateRestore(fsRestore).unwrap();
          if (
            validationResponse === RestoreValidationResponse.FUTURE_SOFTWARE
          ) {
            showFutureSoftwareModal();
          } else {
            if (validationResponse !== RestoreValidationResponse.VALID) {
              console.warn(
                `Received validation response ${validationResponse} -- attempting to proceed with restore`
              );
            }
            console.warn();
            performRestore({
              mode: ModeEnum.ALL,
              source: RestoreSource.FILESYSTEM,
              dto: fsRestore,
            });
          }
        },
        onClose: () => {},
      });
    },
    [
      addConfirmModal,
      performRestore,
      showFutureSoftwareModal,
      t,
      validateRestore,
    ]
  );

  const handleRestart = () => {
    addConfirmModal({
      headerContent: t("instrumentScreens.system.restartModal.title"),
      bodyContent: (
        <SpotText level="paragraph">
          {t("instrumentScreens.system.restartModal.message")}
        </SpotText>
      ),
      "data-testid": TestId.restartModal,
      cancelButtonContent: t("general.buttons.cancel"),
      confirmButtonContent: t("instrumentScreens.general.buttons.restart"),
      onClose: () => {},
      onConfirm: () => {
        requestRestart();

        nav("/");
      },
    });
  };
  const handlePowerDown = () => {
    addConfirmModal({
      headerContent: t("instrumentScreens.system.powerDownModal.title"),
      bodyContent: (
        <SpotText level="paragraph">
          {t("instrumentScreens.system.powerDownModal.message")}
        </SpotText>
      ),
      "data-testid": TestId.powerDownModal,
      cancelButtonContent: t("general.buttons.cancel"),
      confirmButtonContent: t("instrumentScreens.general.buttons.powerDown"),
      onClose: () => {},
      onConfirm: () => {
        requestPowerDown();
        nav("/");
      },
    });
  };

  const { clearAllPrintJobs } = useClearAllPrintJobs();

  return (
    <InstrumentPageRoot>
      <StyledContent data-testid="system-maintenance-screen">
        <Overview>
          <SystemImageContainer>
            <SystemImage src={getSystemDisplayImage()} />
          </SystemImageContainer>
          <Info>
            <SpotText level="h2">
              {t("instrumentScreens.general.labels.system")}
            </SpotText>
            <SpotText level="h5">
              {t("instrumentScreens.system.title")}
            </SpotText>
          </Info>
        </Overview>
        <Settings>
          <Column>
            <SpotText level="h4">
              {t("instrumentScreens.system.labels.hardware")}
            </SpotText>
            <Link data-testid="advanced-link" to={"advanced"}>
              {t("instrumentScreens.system.labels.advanced")}
            </Link>
            <Link
              data-testid="clear-all-print-jobs"
              to={"#"}
              onClick={clearAllPrintJobs}
            >
              {t("settings.printing.clearAllPrintJobs.button")}
            </Link>

            <SpotText level="h4">
              {t("instrumentScreens.system.labels.data")}
            </SpotText>
            <Link
              data-testid="backup-data-link"
              to={"#"}
              onClick={() => setBackupModalVisible(true)}
            >
              {t("instrumentScreens.system.labels.backupData")}
            </Link>
            <Link
              data-testid="restore-data-link"
              to={"#"}
              onClick={checkRestore}
            >
              {t("instrumentScreens.system.labels.restoreData")}
            </Link>
          </Column>
          <Column>
            <SpotText level="h4">
              {t("instrumentScreens.system.labels.software")}
            </SpotText>
            <Link
              data-testid="upgrade-software-link"
              to={"#"}
              onClick={() => setUpgradeModalVisible(true)}
            >
              {t("instrumentScreens.system.labels.upgradeSoftware")}
            </Link>
            <Link data-testid="system-info-link" to={"settings"}>
              {t("instrumentScreens.system.labels.systemInfo")}
            </Link>
          </Column>
        </Settings>
      </StyledContent>

      <InstrumentPageRightPanel data-testid="maintenance-screen-right">
        <InstrumentPageRightPanelButtonContainer>
          <Button data-testid={TestId.restartButton} onClick={handleRestart}>
            {t("instrumentScreens.general.buttons.restart")}
          </Button>

          <Button
            data-testid={TestId.PowerDownButton}
            buttonType="secondary"
            onClick={handlePowerDown}
          >
            {t("instrumentScreens.general.buttons.powerDown")}
          </Button>
        </InstrumentPageRightPanelButtonContainer>

        <InstrumentPageRightPanelDivider />

        <InstrumentInfo
          properties={{
            [t("instrumentScreens.general.labels.softwareVersion")]: data,
            [t("instrumentScreens.general.labels.vpSoftwareVersion")]:
              vpVersion,
            [t("instrumentScreens.general.labels.serialNumber")]:
              systemInfo?.serialNumber,
            [t("instrumentScreens.general.labels.ipAddress")]:
              systemInfo?.ipAddress,
          }}
        />
      </InstrumentPageRightPanel>

      {upgradeModalVisible && (
        <SystemUpgrade onCancel={() => setUpgradeModalVisible(false)} />
      )}

      {backupModalVisible && (
        <SystemBackup onCancel={() => setBackupModalVisible(false)} />
      )}

      {restoreModalVisible && (
        <UsbRestore onCancel={() => setRestoreModalVisible(false)} />
      )}
    </InstrumentPageRoot>
  );
}
