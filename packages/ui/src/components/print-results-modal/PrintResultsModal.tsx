import { useTranslation } from "react-i18next";
import classNames from "classnames";
import { PrintPreview } from "../print-preview/PrintPreview";
import { Views, pdfViewerOpts } from "../../utils/url-utils";

interface PrintResultsModalProps {
  className?: string;

  labRequestIds?: number[];

  open: boolean;

  onClose: () => void;
  onConfirm?: () => void;
}

/**
 * Displays a custom print dialog specific to printing (potentially
 * multiple) lab results.
 *
 * It is designed to reside in the dom before and after the print dialog is
 * opened.
 *
 * It will not load content until it the first time the modal has been opened.
 *
 * If you wish to release the modal's loaded pdf content, clear the
 * labrequest id list.
 *
 */
const PrintResultsModal = ({
  labRequestIds,
  ...props
}: PrintResultsModalProps) => {
  const { t } = useTranslation();

  const classes = classNames("print-results-modal", props.className);

  const url =
    labRequestIds != null && labRequestIds.length > 0
      ? `/labstation-webapp/api/report/labReport?labRequestId=${labRequestIds.join(
          ","
        )}#${pdfViewerOpts({ toolbar: false, view: Views.FIT_HORIZONTAL })}`
      : undefined; // PDF Open Parameters: don't show toolbars, and fit document to width

  return (
    <PrintPreview
      {...props}
      data-testid="print-results-modal"
      className={classes}
      headerContent={t("printResultsModal.title")}
      url={url}
      printJobName={t("general.printJobs.resultsReport")}
    />
  );
};

export type { PrintResultsModalProps };

export { PrintResultsModal };
