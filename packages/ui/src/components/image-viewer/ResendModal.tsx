import { useTranslation } from "react-i18next";
import { IFrameConfirmModal } from "../iframe-confirm-modal/IFrameConfirmModal";

interface ResendModalProps {
  className?: string;
  ["data-testid"]?: string;

  url?: string;
  open: boolean;
  error: boolean;

  onClose?: () => void;
  onConfirm?: () => void;
}

const ResendModal = (props: ResendModalProps) => {
  const { t } = useTranslation();
  return (
    <IFrameConfirmModal
      {...props}
      headerContent={t("imageViewer.resendModal.title")}
      preContent={t("imageViewer.resendModal.description")}
      cancelButtonContent={t("general.buttons.cancel")}
      confirmButtonContent={t("imageViewer.resendModal.resend")}
    />
  );
};

export { ResendModal };
