import { SpotText } from "@viewpoint/spot-react";
import { Trans, useTranslation } from "react-i18next";
import type { ModalStepProps } from "./UsbRestore";
import { ModeEnum, RestoreFileDto } from "@viewpoint/api";
import { UsbCopyProgressDialog } from "../../../../components/usb/UsbCopyProgressDialog";

interface PerformRestoreStepProps extends ModalStepProps {
  selectedRestoreFileDto: RestoreFileDto | undefined;
  restoreType: ModeEnum;
  copyId?: string;
  isFirstBoot?: boolean;
}

export function CopyRestoreFilesModal({
  onCancel,
  onNext,
  copyId,
  isFirstBoot,
}: PerformRestoreStepProps) {
  const { t } = useTranslation();

  return (
    <UsbCopyProgressDialog
      open={true}
      copyId={copyId}
      onCancel={onCancel}
      onComplete={onNext}
      headerContent={t("restore.copyRestore.title")}
      bodyContent={
        <SpotText level="paragraph">
          <Trans i18nKey="restore.copyRestore.body" />
        </SpotText>
      }
      isFirstBoot={isFirstBoot}
    />
  );
}
