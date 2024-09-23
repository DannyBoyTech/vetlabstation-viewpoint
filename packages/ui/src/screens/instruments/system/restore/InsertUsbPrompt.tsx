import { Trans, useTranslation } from "react-i18next";
import { SpotText } from "@viewpoint/spot-react";
import React from "react";
import type { ModalStepProps } from "./UsbRestore";
import { ConfirmModal } from "../../../../components/confirm-modal/ConfirmModal";

export function InsertUsbPrompt(props: ModalStepProps) {
  const { t } = useTranslation();
  return (
    <ConfirmModal
      dismissable={false}
      open={true}
      onClose={props.onCancel}
      headerContent={
        <SpotText level="h3">{t("restore.insertDrive.title")}</SpotText>
      }
      bodyContent={
        <SpotText level="paragraph">
          {props.isFirstBoot ? (
            <Trans i18nKey="restore.insertDrive.firstBootInsertUsb" />
          ) : (
            <Trans i18nKey="restore.insertDrive.body" />
          )}
        </SpotText>
      }
      cancelButtonContent={t("general.buttons.cancel")}
      onConfirm={props.onNext}
      confirmButtonContent={t("general.buttons.next")}
    />
  );
}
