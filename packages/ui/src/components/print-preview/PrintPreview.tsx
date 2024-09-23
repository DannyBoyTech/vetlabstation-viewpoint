import { ReactNode, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { IFrameConfirmModal } from "../iframe-confirm-modal/IFrameConfirmModal";
import { Failure } from "../failure/Failure";
import { usePrint } from "../../utils/print/print";

interface PrintPreviewProps {
  className?: string;
  "data-testid"?: string;

  url?: string;
  srcDoc?: string;
  open: boolean;
  error?: boolean;

  headerContent: ReactNode;

  printJobName: string;

  onClose?: () => void;
  onConfirm?: () => void;
}

/**
 * A modal that loads content from a URL and an option to print or cancel it.
 */
const PrintPreview = (props: PrintPreviewProps) => {
  const { t } = useTranslation();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { printPdf } = usePrint();

  const { onConfirm, printJobName: job } = props;
  const handleConfirm = useCallback(
    async (objectUrl?: string) => {
      try {
        if (objectUrl == null) {
          throw Error(`nullish objectURL: ${objectUrl}`);
        }

        const res = await fetch(objectUrl);
        const data = await res.blob();

        printPdf(data, job);
      } catch (e) {
        console.error(`unable to print on confirm: ${e}`);
      }
      onConfirm?.();
    },
    [printPdf, job, onConfirm]
  );

  return (
    <IFrameConfirmModal
      {...props}
      ref={iframeRef}
      onClose={props.onClose}
      onConfirm={handleConfirm}
      cancelButtonContent={t("general.buttons.cancel")}
      confirmButtonContent={t("general.buttons.print")}
      errorContent={<Failure />}
    />
  );
};

export type { PrintPreviewProps };
export { PrintPreview };
