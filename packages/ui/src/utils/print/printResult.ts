import { useCallback } from "react";
import { fetchLabReport } from "../../api/ReportApi";
import { useTranslation } from "react-i18next";
import { usePrint } from "./print";

export function usePrintResult() {
  const { t } = useTranslation();
  const { printPdf } = usePrint();

  const printResult = useCallback(
    async (labRequestId: number, copies?: number) => {
      const labReport = await fetchLabReport(labRequestId);
      await printPdf(labReport, t("general.printJobs.resultsReport"), copies);
    },
    [t, printPdf]
  );

  return printResult;
}
