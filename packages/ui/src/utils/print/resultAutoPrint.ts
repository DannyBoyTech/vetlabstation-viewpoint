import {
  EventIds,
  IncludedRunsType,
  LabRequestComplete,
  SettingTypeEnum,
} from "@viewpoint/api";
import { useEventListener } from "../../context/EventSourceContext";
import { useGetSettingsQuery } from "../../api/SettingsApi";
import { usePrint } from "./print";
import { useCallback, useMemo } from "react";
import { fetchLabReport } from "../../api/ReportApi";
import { useTranslation } from "react-i18next";
import { usePrintResult } from "./printResult";
import { trackResultPrinted } from "../../analytics/nltx-events";

interface ResultAutoPrintSettings {
  autoPrintResults: boolean;
  autoPrintCopies: number;
  excludeManualSnap: boolean;
  excludeSnapPro: boolean;
}

function numberOrElse(
  numberStr: string | null | undefined,
  fallback: number
): number {
  if (numberStr == null) return fallback;

  const maybeNumber = Number(numberStr);
  return Number.isNaN(maybeNumber) ? fallback : maybeNumber;
}

function useAutoPrintSettings() {
  const { data, isLoading } = useGetSettingsQuery([
    SettingTypeEnum.AUTOMATICALLY_PRINT,
    SettingTypeEnum.AUTO_PRINT_EXCEPTION_MANUAL_SNAP,
    SettingTypeEnum.AUTO_PRINT_EXCEPTION_SNAPPRO,
    SettingTypeEnum.PRINT_NUMBER_OF_COPIES,
  ]);

  return useMemo(() => {
    const settings: ResultAutoPrintSettings | undefined = data && {
      autoPrintResults: data?.[SettingTypeEnum.AUTOMATICALLY_PRINT] === "true",
      autoPrintCopies: numberOrElse(
        data?.[SettingTypeEnum.PRINT_NUMBER_OF_COPIES],
        1
      ),
      excludeManualSnap:
        data?.[SettingTypeEnum.AUTO_PRINT_EXCEPTION_MANUAL_SNAP] === "true",
      excludeSnapPro:
        data?.[SettingTypeEnum.AUTO_PRINT_EXCEPTION_SNAPPRO] === "true",
    };

    return {
      data: settings,
      isLoading,
    };
  }, [data, isLoading]);
}

export function useResultAutoPrintHandler() {
  const { data: settings } = useAutoPrintSettings();
  const printResult = usePrintResult();

  const autoPrintHandler = useCallback(
    async (msg: MessageEvent) => {
      const { isQualityControl, includedRunsType, labRequestId } = JSON.parse(
        msg.data
      ) as LabRequestComplete;

      const resultExcluded =
        isQualityControl ||
        includedRunsType === IncludedRunsType.NO_COMPLETE_RUNS ||
        (includedRunsType === IncludedRunsType.MANUAL_SNAP_ONLY &&
          settings?.excludeManualSnap) ||
        (includedRunsType === IncludedRunsType.SNAP_PRO_ONLY &&
          settings?.excludeSnapPro) ||
        (includedRunsType === IncludedRunsType.BOTH_SNAP_ONLY &&
          settings?.excludeManualSnap &&
          settings?.excludeSnapPro);

      if (settings?.autoPrintResults && !resultExcluded) {
        await printResult(labRequestId, settings.autoPrintCopies);
        trackResultPrinted({ type: "auto", copies: settings.autoPrintCopies });
      }
    },
    [settings, printResult]
  );

  useEventListener(EventIds.LabRequestComplete, autoPrintHandler);
}
