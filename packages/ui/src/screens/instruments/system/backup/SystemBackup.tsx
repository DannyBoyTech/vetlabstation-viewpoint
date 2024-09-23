import { useEffect, useState } from "react";
import {
  useLazyIsSmartServiceAgentRunningQuery,
  useRecoverSmartServiceAgentMutation,
} from "../../../../api/BackupApi";
import SpinnerOverlay from "../../../../components/overlay/SpinnerOverlay";
import { ConfirmModal } from "../../../../components/confirm-modal/ConfirmModal";
import { useTranslation } from "react-i18next";
import { UsbBackup } from "./UsbBackup";

export const TestId = {
  NoAgentModal: "system-backup-agent-unavailable",
};

export interface SystemBackupProps {
  onCancel: () => void;
}

export function SystemBackup(props: SystemBackupProps) {
  const [agentRunning, setAgentRunning] = useState<boolean>();

  const [getIsAgentRunning] = useLazyIsSmartServiceAgentRunningQuery();
  const [recoverAgent] = useRecoverSmartServiceAgentMutation();

  const { t } = useTranslation();

  useEffect(() => {
    getIsAgentRunning()
      .unwrap()
      .then((running) => {
        // Will attempt to restart the agent service
        if (!running) {
          recoverAgent();
        }
        setAgentRunning(running);
      });
  }, [getIsAgentRunning]);

  if (agentRunning == null) {
    return <SpinnerOverlay />;
  } else if (!agentRunning) {
    return (
      <ConfirmModal
        open={true}
        data-testid={TestId.NoAgentModal}
        onClose={props.onCancel}
        onConfirm={props.onCancel}
        bodyContent={t("backups.backupError.body")}
        confirmButtonContent={t("general.buttons.ok")}
        headerContent={t("backups.backupError.title")}
      />
    );
  } else {
    return <UsbBackup onCancel={props.onCancel} onDone={props.onCancel} />;
  }
}
