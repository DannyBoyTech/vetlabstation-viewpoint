import { useTranslation } from "react-i18next";
import { ConfirmModal, ConfirmModalProps } from "./ConfirmModal";
import classNames from "classnames";

interface CancelConfirmationModalProps
  extends Pick<ConfirmModalProps, "open" | "onConfirm" | "onClose"> {
  className?: string;
  "data-testid"?: string;
}

export function CancelConfirmationModal(props: CancelConfirmationModalProps) {
  const { t } = useTranslation();
  const classes = classNames(props.className, "cancel-confirmation-modal");

  return (
    <ConfirmModal
      {...props}
      className={classes}
      data-testid={props["data-testid"]}
      bodyContent={t("confirmBackActionModal.body")}
      cancelButtonContent={t("general.buttons.close")}
      confirmButtonContent={t("confirmBackActionModal.button.discard")}
      headerContent={t("confirmBackActionModal.title")}
    />
  );
}
