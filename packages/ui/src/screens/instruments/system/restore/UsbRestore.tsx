import { Button, Modal, SpotText } from "@viewpoint/spot-react";
import React, { useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { BasicModal } from "../../../../components/basic-modal/BasicModal";
import { UsbSelectionModal } from "../../../../components/usb/UsbSelectionModal";
import {
  ModeEnum,
  RestoreFileDto,
  RestoreSource,
  RestoreValidationResponse,
} from "@viewpoint/api";

import { SelectDataToRestore } from "./SelectDataToRestore";
import { InsertUsbPrompt } from "./InsertUsbPrompt";
import { BackupFileSelectionModal } from "./BackupFileSelectionModal";
import { ConfirmModal } from "../../../../components/confirm-modal/ConfirmModal";
import { RestoreReady } from "./RestoreReady";
import { CopyRestoreFilesModal } from "./CopyRestoreFilesModal";
import {
  restoreApi,
  useCopyRestoreFilesMutation,
  useValidateRestoreFileMutation,
} from "../../../../api/RestoreApi";
import { CommonTransComponents } from "../../../../utils/i18n-utils";

const UsbRestoreSteps = {
  SelectDataToRestore: "SelectDataToRestore",
  InsertUsbDrive: "InsertUsbDrive",
  SelectUsbDrive: "SelectUsbDrive",
  SelectDriveData: "SelectDriveData",
  CopyRestore: "CopyRestore",
  RestoreReady: "RestoreReady",
  // Error scenarios
  FutureSoftware: "FutureSoftware",
  NotEnoughSpace: "NotEnoughSpace",
  UnknownError: "UnknownError",
};

type UsbRestoreStep = (typeof UsbRestoreSteps)[keyof typeof UsbRestoreSteps];

export interface ModalStepProps {
  isFirstBoot?: boolean;
  onCancel: () => void;
  onNext: () => void;
}

export function UsbRestore(props: {
  isFirstBoot?: boolean;
  onCancel: () => void;
}) {
  const { t } = useTranslation();
  const [step, setStep] = useState<UsbRestoreStep>(
    UsbRestoreSteps.SelectDataToRestore
  );

  const [selectedUsbId, setSelectedUsbId] = useState<string>();
  const [selectedRestoreFileDto, setSelectedRestoreFilename] =
    useState<RestoreFileDto>();
  const [restoreMode, setRestoreMode] = useState(ModeEnum.ALL);
  const [copyRestoreFiles, { data: copyId }] = useCopyRestoreFilesMutation();
  const [validateRestore] = useValidateRestoreFileMutation();
  const [performRestore] = restoreApi.usePerformRestoreMutation();

  switch (step) {
    case UsbRestoreSteps.SelectDataToRestore:
      return (
        <SelectDataToRestore
          isFirstBoot={props.isFirstBoot}
          onCancel={props.onCancel}
          onNext={() => setStep(UsbRestoreSteps.InsertUsbDrive)}
          restoreMode={restoreMode}
          onRestoreModeSelected={(
            restoreMode: React.SetStateAction<ModeEnum>
          ) => {
            setRestoreMode(restoreMode);
          }}
        />
      );

    case UsbRestoreSteps.InsertUsbDrive:
      return (
        <InsertUsbPrompt
          isFirstBoot={props.isFirstBoot}
          onCancel={props.onCancel}
          onNext={() => setStep(UsbRestoreSteps.SelectUsbDrive)}
        />
      );

    case UsbRestoreSteps.SelectUsbDrive:
      return (
        <UsbSelectionModal
          visible={true}
          onClose={props.onCancel}
          bodyContent={t("backups.selectDrive.body")}
          onDriveSelected={(usbDriveId) => {
            setSelectedUsbId(usbDriveId);
            setStep(UsbRestoreSteps.SelectDriveData);
          }}
        />
      );

    case UsbRestoreSteps.SelectDriveData:
      return (
        <BackupFileSelectionModal
          onCancel={props.onCancel}
          usbId={selectedUsbId}
          selectedRestoreFileDto={selectedRestoreFileDto}
          onNext={() => {
            if (selectedRestoreFileDto != null) {
              setStep(UsbRestoreSteps.CopyRestore);
              copyRestoreFiles(selectedRestoreFileDto);
            }
          }}
          onRestoreFilenameSelected={(
            usbRestoreDto: React.SetStateAction<RestoreFileDto | undefined>
          ) => {
            setSelectedRestoreFilename(
              usbRestoreDto === selectedRestoreFileDto
                ? undefined
                : usbRestoreDto
            );
          }}
        />
      );

    case UsbRestoreSteps.CopyRestore:
      return (
        <CopyRestoreFilesModal
          isFirstBoot={props.isFirstBoot}
          copyId={copyId}
          restoreType={restoreMode}
          selectedRestoreFileDto={selectedRestoreFileDto}
          onCancel={props.onCancel}
          onNext={async () => {
            if (selectedRestoreFileDto != null) {
              const validationResult = await validateRestore(
                selectedRestoreFileDto
              ).unwrap();
              // IVLS today only reacts to future software validation error -- it will still attempt
              // the restore for other validation failure scenarios
              if (
                validationResult === RestoreValidationResponse.FUTURE_SOFTWARE
              ) {
                setStep(UsbRestoreSteps.FutureSoftware);
              } else {
                setStep(UsbRestoreSteps.RestoreReady);
              }
            }
          }}
        />
      );

    case UsbRestoreSteps.RestoreReady:
      return (
        <RestoreReady
          isFirstBoot={props.isFirstBoot}
          selectedUsbId={selectedUsbId}
          onCancel={props.onCancel}
          onNext={async () => {
            if (selectedRestoreFileDto != null) {
              props.onCancel();
              performRestore({
                dto: selectedRestoreFileDto,
                mode: restoreMode,
                source: RestoreSource.USB,
              });
            }
          }}
        />
      );
    case UsbRestoreSteps.FutureSoftware:
      return <FutureSoftwareModal onConfirm={props.onCancel} />;
    case UsbRestoreSteps.NotEnoughSpace:
      return (
        <NotEnoughSpace onCancel={props.onCancel} onNext={props.onCancel} />
      );

    case UsbRestoreSteps.UnknownError:
      return <UnknownErrorModal onOK={props.onCancel} />;

    default:
      return null;
  }
}

interface FutureSoftwareModalProps {
  onConfirm: () => void;
}

function FutureSoftwareModal({ onConfirm }: FutureSoftwareModalProps) {
  const { t } = useTranslation();
  return (
    <ConfirmModal
      dismissable={false}
      open={true}
      onClose={onConfirm}
      onConfirm={onConfirm}
      headerContent={t("restore.futureSoftware.title")}
      bodyContent={
        <SpotText level="paragraph">
          <Trans
            i18nKey="restore.futureSoftware.body"
            components={CommonTransComponents}
          />
        </SpotText>
      }
      confirmButtonContent={t("general.buttons.ok")}
    />
  );
}

function NotEnoughSpace({ onCancel, onNext }: ModalStepProps) {
  const { t } = useTranslation();
  return (
    <BasicModal
      dismissable={false}
      open={true}
      onClose={onCancel}
      headerContent={
        <SpotText level="h3">{t("restore.notEnoughSpace.title")}</SpotText>
      }
      bodyContent={
        <SpotText level="paragraph">
          <Trans i18nKey="restore.notEnoughSpace.body" />
        </SpotText>
      }
      footerContent={
        <>
          <Modal.FooterCancelButton onClick={onCancel}>
            {t("general.buttons.cancel")}
          </Modal.FooterCancelButton>
          <Button onClick={onNext}>{t("general.buttons.next")}</Button>
        </>
      }
    />
  );
}

function UnknownErrorModal({ onOK }: { onOK: () => void }) {
  const { t } = useTranslation();
  return (
    <BasicModal
      dismissable={false}
      open={true}
      onClose={onOK}
      headerContent={
        <SpotText level="h3">{t("restore.unknownError.title")}</SpotText>
      }
      bodyContent={
        <SpotText level="paragraph">
          <Trans i18nKey="restore.unknownError.body" />
        </SpotText>
      }
      footerContent={
        <Modal.FooterCancelButton onClick={onOK}>
          {t("general.buttons.ok")}
        </Modal.FooterCancelButton>
      }
    />
  );
}
