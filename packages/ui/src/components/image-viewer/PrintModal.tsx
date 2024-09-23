import { useTranslation } from "react-i18next";
import { PrintPreview } from "../print-preview/PrintPreview";

interface PrintModalProps {
  className?: string;
  "data-testid"?: string;

  url?: string;
  open: boolean;
  error: boolean;

  printJobName: string;

  onClose?: () => void;
  onConfirm?: () => void;
}

const PrintModal = (props: PrintModalProps) => {
  const { t } = useTranslation();

  return (
    <PrintPreview {...props} headerContent={t("imageViewer.printResults")} />
  );
};

export type { PrintModalProps };
export { PrintModal };
