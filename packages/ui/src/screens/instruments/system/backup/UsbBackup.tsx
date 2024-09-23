import { Button, Modal, SpotText } from "@viewpoint/spot-react";
import { useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { BasicModal } from "../../../../components/basic-modal/BasicModal";
import { UsbSelectionModal } from "../../../../components/usb/UsbSelectionModal";
import { ConfirmModal } from "../../../../components/confirm-modal/ConfirmModal";
import { CommonTransComponents } from "../../../../utils/i18n-utils";
import { PerformUsbBackup } from "./PerformUsbBackup";
import { DeleteBackupsModal } from "./DeleteBackupsModal";

const UsbBackupSteps = {
  InsertUsbDrive: "InsertUsbDrive", // Prompt user to insert a USB drive
  SelectUsbDrive: "SelectUsbDrive", // Show user list of drives and allow them to select one
  CheckDriveSpace: "CheckDriveSpace", // Verify the selected drive has enough free space for the backup
  PerformBackup: "PerformBackup", // Generate the backup, check disk size, copy to USB, etc.
  NotEnoughCapacity: "NotEnoughCapacity", // Drive isn't big enough to hold -- drops user back to the instrument screen and they start over
  NotEnoughSpace: "NotEnoughSpace", // Not enough space on the drive -- shows user a list of previous backups they could delete if they wanted to
  UnknownError: "UnknownError",
};
type UsbBackupStep = (typeof UsbBackupSteps)[keyof typeof UsbBackupSteps];

export const TestId = {
  InsertPrompt: "usb-backup-insert-drive-prompt",
  NotEnoughCapacityPrompt: "usb-backup-not-enough-capacity",
};

export interface UsbBackupProps {
  onCancel: () => void;
  onDone: () => void;
}

export function UsbBackup(props: UsbBackupProps) {
  const [step, setStep] = useState<UsbBackupStep>(
    UsbBackupSteps.InsertUsbDrive
  );
  const [backupSize, setBackupSize] = useState<number>();
  const [selectedUsbId, setSelectedUsbId] = useState<string>();
  const { t } = useTranslation();

  switch (step) {
    case UsbBackupSteps.InsertUsbDrive:
      return (
        <InsertUsbPrompt
          onCancel={props.onCancel}
          onNext={() => setStep(UsbBackupSteps.SelectUsbDrive)}
        />
      );
    case UsbBackupSteps.SelectUsbDrive:
      return (
        <UsbSelectionModal
          visible={true}
          onClose={props.onCancel}
          bodyContent={t("backups.selectDrive.body")}
          onDriveSelected={(usbId) => {
            setSelectedUsbId(usbId);
            setStep(UsbBackupSteps.PerformBackup);
          }}
        />
      );
    case UsbBackupSteps.PerformBackup:
      if (selectedUsbId != null) {
        return (
          <PerformUsbBackup
            usbId={selectedUsbId}
            onCancel={props.onCancel}
            onFinish={props.onDone}
            onError={(errorType, backupSize) => {
              setStep(errorType);
              setBackupSize(backupSize);
            }}
          />
        );
      } else {
        console.error("No drive ID selected");
        return <></>;
      }
    case UsbBackupSteps.NotEnoughSpace:
      return (
        <DeleteBackupsModal
          usbId={selectedUsbId!}
          backupSize={backupSize!}
          onCancel={props.onCancel}
          onConfirm={() => setStep(UsbBackupSteps.PerformBackup)}
          onError={(err) => setStep(err)}
        />
      );
    case UsbBackupSteps.NotEnoughCapacity:
      return (
        <ConfirmModal
          data-testid={TestId.NotEnoughCapacityPrompt}
          dismissable={false}
          open={true}
          onClose={props.onCancel}
          onConfirm={props.onCancel}
          bodyContent={
            <Trans
              i18nKey={"backups.notEnoughCapacity.body"}
              components={CommonTransComponents}
            />
          }
          confirmButtonContent={t("general.buttons.ok")}
          headerContent={t("backups.notEnoughCapacity.title")}
        />
      );
    case UsbBackupSteps.UnknownError:
      return (
        <ConfirmModal
          open={true}
          onClose={props.onCancel}
          onConfirm={props.onCancel}
          bodyContent={t("general.messages.somethingWentWrong")}
          confirmButtonContent={t("general.buttons.ok")}
          headerContent={t("general.messages.error")}
        />
      );
  }

  return <></>;
}

interface InsertUsbPromptProps {
  onCancel: () => void;
  onNext: () => void;
}

function InsertUsbPrompt(props: InsertUsbPromptProps) {
  const { t } = useTranslation();
  return (
    <BasicModal
      open={true}
      data-testid={TestId.InsertPrompt}
      onClose={props.onCancel}
      headerContent={
        <SpotText level="h3">{t("backups.insertDrive.title")}</SpotText>
      }
      bodyContent={
        <SpotText level="paragraph">
          <Trans i18nKey="backups.insertDrive.body" />
        </SpotText>
      }
      footerContent={
        <>
          <Modal.FooterCancelButton onClick={props.onCancel}>
            {t("general.buttons.cancel")}
          </Modal.FooterCancelButton>

          <Button onClick={props.onNext}>{t("general.buttons.next")}</Button>
        </>
      }
    />
  );
}
