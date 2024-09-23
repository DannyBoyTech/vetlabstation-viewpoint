import { Trans, useTranslation } from "react-i18next";
import { useConfirmModal } from "../../components/global-modals/components/GlobalConfirmModal";
import { useToast } from "@viewpoint/spot-react";
import { CommonTransComponents } from "../../utils/i18n-utils";
import { DefaultSuccessToastOptions } from "../../utils/toast/toast-defaults";
import { useCallback } from "react";
import { usePurgeJobsMutation } from "../../api/PrintApi";
import { useLazyGetDefaultPrinter } from "../../utils/print/print";

export const TestId = {
  clearAllPrintJobsModal: "clear-all-print-jobs-modal",
} as const;

/**
 * A react hook that handles a user request for clearing all print jobs on the current 'default printer'
 */
export function useClearAllPrintJobs() {
  const { t } = useTranslation();
  const { addConfirmModal } = useConfirmModal();
  const { addToast } = useToast();
  const [getDefaultPrinter] = useLazyGetDefaultPrinter();
  const [purgeJobs] = usePurgeJobsMutation();

  const clearAllPrintJobs = useCallback(async () => {
    try {
      const printer = await getDefaultPrinter();

      if (printer != null) {
        addConfirmModal({
          "data-testid": TestId.clearAllPrintJobsModal,
          headerContent: t(
            "settings.printing.clearAllPrintJobs.confirmModal.title"
          ),
          bodyContent: (
            <Trans
              i18nKey="settings.printing.clearAllPrintJobs.confirmModal.body"
              components={CommonTransComponents}
              values={{ printer: printer.displayName }}
            />
          ),
          cancelButtonContent: t("general.buttons.cancel"),
          confirmButtonContent: t("settings.printing.clearAllPrintJobs.button"),
          onClose: () => {},
          onConfirm: async () => {
            try {
              await purgeJobs(printer.name).unwrap();
              addToast({
                ...DefaultSuccessToastOptions,
                content: t("settings.printing.clearAllPrintJobs.sucessToast", {
                  printer: printer.displayName,
                }),
                location: "bottomLeft",
              });
            } catch (e) {
              console.log(`failed to purge jobs for '${printer.name}'`, e);
            }
          },
        });
      }
    } catch (e) {
      console.log("failed to clear all jobs for default printer", e);
    }
  }, [t, addConfirmModal, addToast, getDefaultPrinter, purgeJobs]);

  return { clearAllPrintJobs };
}
