import { SpotText } from "@viewpoint/spot-react";
import { Trans, useTranslation } from "react-i18next";
import { useGetRemovableDrivesQuery } from "../../../../api/UsbApi";
import { ConfirmModal } from "../../../../components/confirm-modal/ConfirmModal";
import React from "react";
import type { ModalStepProps } from "./UsbRestore";

export interface RestoreReadyStepProps extends ModalStepProps {
  selectedUsbId: string | undefined;
  isFirstBoot?: boolean;
}

export function RestoreReady({
  onCancel,
  onNext,
  selectedUsbId,
  isFirstBoot,
}: RestoreReadyStepProps) {
  const { t } = useTranslation();
  const { data: availableDrives, isLoading } = useGetRemovableDrivesQuery(
    undefined,
    { pollingInterval: 2000 }
  );
  const isDriveAvailable = availableDrives?.some(
    (drive) => drive.id === selectedUsbId
  );

  return (
    <ConfirmModal
      dismissable={false}
      open={true}
      onClose={onCancel}
      headerContent={t("restore.restoreReady.title")}
      bodyContent={
        <SpotText level="paragraph">
          <Trans i18nKey="restore.restoreReady.body" />
          {isFirstBoot && (
            <>
              <br />
              <br />
              <SpotText level="paragraph" bold>
                {t("restore.restoreReady.firstBootBody")}
              </SpotText>
            </>
          )}
        </SpotText>
      }
      confirmButtonContent={t("general.buttons.ok")}
      cancelButtonContent={t("general.buttons.cancel")}
      onConfirm={onNext}
      confirmable={!isDriveAvailable}
    />
  );
}
