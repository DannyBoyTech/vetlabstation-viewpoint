import { useTranslation } from "react-i18next";
import { ConfirmModal } from "../../../../components/confirm-modal/ConfirmModal";

interface WarningModalProps {
  onClose: () => void;
  onConfirm: () => void;
}

const WarningModal = (props: WarningModalProps) => {
  const { t } = useTranslation();

  return (
    <ConfirmModal
      {...props}
      open={true}
      dismissable={false}
      headerContent={t(
        "instrumentScreens.proCyteOne.maintenance.warningModal.title"
      )}
      bodyContent={t(
        "instrumentScreens.proCyteOne.maintenance.warningModal.content"
      )}
      cancelButtonContent={t("general.buttons.cancel")}
      confirmButtonContent={t("general.buttons.ok")}
    />
  );
};

export type { WarningModalProps };
export { WarningModal };
