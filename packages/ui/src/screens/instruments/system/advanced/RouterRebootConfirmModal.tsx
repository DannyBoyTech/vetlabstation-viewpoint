import { useTranslation } from "react-i18next";
import { ConfirmModal } from "../../../../components/confirm-modal/ConfirmModal";

interface RouterRebootConfirmModalProps {
  onClose: () => void;
  onConfirm: () => void;
}

function RouterRebootConfirmModal(props: RouterRebootConfirmModalProps) {
  const { t } = useTranslation();
  return (
    <ConfirmModal
      {...props}
      open={true}
      dismissable={false}
      confirmable={true}
      headerContent={t(
        "instrumentScreens.system.advanced.rebootConfirmModal.title"
      )}
      bodyContent={t(
        "instrumentScreens.system.advanced.rebootConfirmModal.content"
      )}
      cancelButtonContent={t("general.buttons.cancel")}
      confirmButtonContent={t("general.buttons.apply")}
    />
  );
}

export type { RouterRebootConfirmModalProps };
export { RouterRebootConfirmModal };
