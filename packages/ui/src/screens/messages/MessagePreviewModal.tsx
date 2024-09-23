import { IFrameConfirmModal } from "../../components/iframe-confirm-modal/IFrameConfirmModal";
import { Failure } from "../../components/failure/Failure";
import { useTranslation } from "react-i18next";
import { useCallback } from "react";
import { getPrintableContent } from "../../api/MessageApi";
import { usePrint } from "../../utils/print/print";

export interface MessagePreviewModalProps {
  messageId: number;
  className?: string;

  "data-testid"?: string;
  url?: string;
  srcDoc?: string;

  onClose?: () => void;
  onConfirm?: () => void;
  error?: boolean;
}

export const MessagePreviewModal = (props: MessagePreviewModalProps) => {
  const { t } = useTranslation();
  const { printPdf } = usePrint();

  const handleConfirm = useCallback(async () => {
    // always print the "printdoc" of the message, not the content that is passed to the iFrame
    const printContent = await getPrintableContent(props.messageId);
    const blob = await printContent.blob();
    printPdf(blob, t("general.printJobs.notification"));
  }, [printPdf, props.messageId, t]);

  return (
    <IFrameConfirmModal
      open
      url={props.url}
      srcDoc={props.srcDoc}
      headerContent={undefined}
      onClose={props.onClose}
      onConfirm={handleConfirm}
      cancelButtonContent={t("general.buttons.cancel")}
      confirmButtonContent={t("general.buttons.print")}
      errorContent={<Failure />}
    />
  );
};
