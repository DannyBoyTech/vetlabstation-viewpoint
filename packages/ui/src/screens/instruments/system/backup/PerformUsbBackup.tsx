import styled from "styled-components";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  useCalculateBackupSizeMutation,
  useCancelCopyMutation,
  useCopyBackupMutation,
  useGetRemovableDrivesQuery,
} from "../../../../api/UsbApi";
import {
  useCancelWaitingMutation,
  useCreateBackupMutation,
  useLazyWaitForBackupQuery,
} from "../../../../api/BackupApi";
import { UsbCopyProgressDialog } from "../../../../components/usb/UsbCopyProgressDialog";
import { Modal, Button, SpotText } from "@viewpoint/spot-react";

const PerformBackupSteps = {
  WaitingForBackup: "WaitingForBackup", // Waiting for the backup to be ready
  CopyingBackup: "CopyingBackup", // Copying is in progress
  CopyingComplete: "CopyingComplete", // Copying is done -- Wait for user to close the prompt
};
type PerformBackupStep =
  (typeof PerformBackupSteps)[keyof typeof PerformBackupSteps];

interface PerformBackupProps {
  usbId: string;
  onCancel: () => void;
  onFinish: () => void;
  onError: (
    errorType: "NotEnoughSpace" | "NotEnoughCapacity" | "UnknownError",
    backupSize?: number
  ) => void;
}

export function PerformUsbBackup(props: PerformBackupProps) {
  const [step, setStep] = useState<PerformBackupStep>();
  const [backupId, setBackupId] = useState<string>();
  const [copyId, setCopyId] = useState<string>();
  const { t } = useTranslation();

  const { data: selectedDrive } = useGetRemovableDrivesQuery(undefined, {
    selectFromResult: (result) => ({
      ...result,
      data: result.data?.find((drive) => drive.id === props.usbId),
    }),
  });

  const [createBackup] = useCreateBackupMutation();
  const [waitForBackup] = useLazyWaitForBackupQuery();
  const [copyBackup] = useCopyBackupMutation();
  const [stopWaitingForBackup] = useCancelWaitingMutation();
  const [cancelCopy] = useCancelCopyMutation();
  const [calculateBackupSize] = useCalculateBackupSizeMutation();

  let bodyContent: string = "";

  switch (step) {
    case undefined:
    case PerformBackupSteps.WaitingForBackup:
      bodyContent = t("backups.performBackup.preparingBackup");
      break;
    case PerformBackupSteps.CopyingBackup:
      bodyContent = t("backups.performBackup.copyingBackup");
      break;
    case PerformBackupSteps.CopyingComplete:
      bodyContent = t("backups.performBackup.copyingComplete");
      break;
  }

  const handleCancel = () => {
    if (step === PerformBackupSteps.WaitingForBackup && backupId != null) {
      stopWaitingForBackup(backupId);
    } else if (step === PerformBackupSteps.CopyingBackup && copyId != null) {
      cancelCopy(copyId);
    }
    props.onCancel();
  };

  // On initial mount
  useEffect(() => {
    // Ask SmartService to create a backup
    createBackup()
      .unwrap()
      .then(async (backupId) => {
        if (backupId != null) {
          setBackupId(backupId);
          // Move to next step
          setStep(PerformBackupSteps.WaitingForBackup);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    if (
      step === PerformBackupSteps.WaitingForBackup &&
      backupId != null &&
      selectedDrive != null
    ) {
      // Wait for the backup to be ready
      (async function () {
        try {
          const backupMetadata = await waitForBackup(backupId).unwrap();
          const backupSize = await calculateBackupSize(backupMetadata).unwrap();
          if (selectedDrive!.capacity <= backupSize) {
            props.onError("NotEnoughCapacity", backupSize);
          } else if (selectedDrive!.freeSpace < backupSize) {
            props.onError("NotEnoughSpace", backupSize);
          } else {
            // Assuming drive space is good, start copying the backup
            const copyId = await copyBackup({
              usbId: props.usbId,
              backupMetadata,
            }).unwrap();
            setCopyId(copyId);
            setStep(PerformBackupSteps.CopyingBackup);
          }
        } catch (err) {
          console.error(err);
          props.onError("UnknownError");
        }
      })();
    }
  }, [step, backupId, selectedDrive]);

  return (
    <UsbCopyProgressDialog
      open={true}
      copyId={copyId}
      onCancel={handleCancel}
      onComplete={() => setStep(PerformBackupSteps.CopyingComplete)}
      headerContent={
        <SpotText level="h3">{t("backups.performBackup.title")}</SpotText>
      }
      bodyContent={bodyContent}
      footerContent={
        <>
          {step !== PerformBackupSteps.CopyingComplete && (
            <Modal.FooterCancelButton onClick={handleCancel}>
              {t("general.buttons.cancel")}
            </Modal.FooterCancelButton>
          )}

          <FinishButton
            disabled={step !== PerformBackupSteps.CopyingComplete}
            onClick={props.onFinish}
          >
            {t("general.buttons.finish")}
          </FinishButton>
        </>
      }
    />
  );
}

const FinishButton = styled(Button)`
  && {
    margin-left: auto;
  }
`;
