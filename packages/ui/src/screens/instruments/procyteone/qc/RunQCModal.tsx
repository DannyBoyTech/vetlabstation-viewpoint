import { useTranslation } from "react-i18next";
import { ConfirmModal } from "../../../../components/confirm-modal/ConfirmModal";

interface RunQCModalProps {
  "data-testid"?: string;
  onConfirm: () => void;
  onClose: () => void;
}

const RunQCModal = (props: RunQCModalProps) => {
  const { t } = useTranslation();

  return (
    <ConfirmModal
      data-testid={props["data-testid"]}
      open={true}
      onClose={props.onClose}
      onConfirm={props.onConfirm}
      headerContent={t("instrumentScreens.proCyteOne.runQCModal.title")}
      bodyContent={t("instrumentScreens.proCyteOne.runQCModal.content")}
      cancelButtonContent={t("general.buttons.cancel")}
      confirmButtonContent={t("instrumentScreens.general.buttons.runQC")}
    />
  );
};

export type { RunQCModalProps };
export { RunQCModal };
