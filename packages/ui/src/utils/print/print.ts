import { Printer, SettingTypeEnum, isPaperSize } from "@viewpoint/api";
import {
  useGetPrintersQuery,
  useLazyGetPrintersQuery,
  usePrintPdfMutation,
} from "../../api/PrintApi";
import {
  useGetSettingQuery,
  useLazyGetSettingQuery,
  useUpdateSettingMutation,
} from "../../api/SettingsApi";
import { useCallback, useEffect, useMemo } from "react";

/**
 * Determines the default os printer based on the printer list from the print api
 *
 * @param printers - list of printers from the print api
 * @returns a default printer, or undefined if there is no reasonable default
 */
function findDefaultOSPrinter(printers: Printer[] | undefined) {
  const systemDefaultPrinter = printers?.find((it) => it.systemDefault);
  return systemDefaultPrinter ?? printers?.[0];
}

/**
 * Returns the printer name that should be used as the default printer.
 *
 * This function should be passed an up-to-date 'DEFAULT_PRINTER' setting,
 * an up-to-date default printer according to the OS, and an up-to-date
 * _complete_ list of available printer names.
 *
 * @param dbDefaultPrinterName - the DEFAULT_PRINTER setting from the ivls db
 * @param osDefaultPrinterName - the system default printer name according to the print api / os (@see findDefaultOSPrinter)
 * @param printerNames - the complete list of printers from the print api / os
 * @returns default Printer
 */
function determineDefaultPrinter(
  dbDefaultPrinterName: string | undefined,
  osDefaultPrinterName: string | undefined,
  printers: Printer[]
): Printer | undefined {
  //if ivls db has a default printer stored and it is available, use that
  if (dbDefaultPrinterName != null) {
    const dbDefaultPrinter = printers.find(
      (it) => it.name === dbDefaultPrinterName
    );
    if (dbDefaultPrinter != null) {
      return dbDefaultPrinter;
    }
  }

  //otherwise, use the os default printer, if it exists
  return osDefaultPrinterName == null
    ? undefined
    : printers.find((it) => it.name === osDefaultPrinterName);
}

/**
 * Returns an function that can be called to determine the default printer on demand,
 * based on the default printer setting in the db, as well as the printer list from
 * the OS (via print api).
 *
 * NOTE: calling the returned function can have the side-effect of updating the
 * default printer in the database, if it is in an incorrect state.
 *
 * @returns the default printer name, or undefined
 */
export const useLazyGetDefaultPrinter = () => {
  const [getPrinters] = useLazyGetPrintersQuery();
  const [getSetting] = useLazyGetSettingQuery();
  const [updateSetting] = useUpdateSettingMutation();

  const getDefaultPrinter = useCallback(async () => {
    const printers = await getPrinters().unwrap();

    const osDefaultPrinter = findDefaultOSPrinter(printers);
    const dbDefaultPrinterName =
      (await getSetting(SettingTypeEnum.DEFAULT_PRINTER).unwrap()) ?? undefined;

    const defaultPrinter = determineDefaultPrinter(
      dbDefaultPrinterName,
      osDefaultPrinter?.name,
      printers
    );

    if (dbDefaultPrinterName != defaultPrinter?.name) {
      await updateSetting({
        settingType: SettingTypeEnum.DEFAULT_PRINTER,
        settingValue: defaultPrinter?.name,
      }).unwrap();
    }

    return defaultPrinter;
  }, [getPrinters, getSetting, updateSetting]);

  return [getDefaultPrinter];
};

/**
 * Returns the current default printer in a RTK query (functional) style.
 *
 * Calling this hook can potentially 'correct' the default printer setting in the database
 * as a side-effect.
 *
 * @param refetchOnMount - whether to bypass cache when mounted
 * @returns
 */
export const useGetDefaultPrinter = (options?: {
  refetchOnMount?: boolean;
}) => {
  const printersQuery = useGetPrintersQuery();
  const {
    data: printers,
    isSuccess: printersLoaded,
    isLoading: printersLoading,
  } = printersQuery;

  useEffect(() => {
    if (options?.refetchOnMount) {
      printersQuery.refetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const {
    data: dbDefaultPrinterName,
    isSuccess: dbDefaultPrinterNameLoaded,
    isLoading: dbDefaultPrinterNameLoading,
  } = useGetSettingQuery(SettingTypeEnum.DEFAULT_PRINTER, {
    refetchOnMountOrArgChange: options?.refetchOnMount,
  });

  const [updateSetting, { isLoading: updateSettingLoading }] =
    useUpdateSettingMutation();

  const defaultPrinter = useMemo(() => {
    const osDefaultPrinter = findDefaultOSPrinter(printers);
    return determineDefaultPrinter(
      dbDefaultPrinterName,
      osDefaultPrinter?.name,
      printers ?? []
    );
  }, [printers, dbDefaultPrinterName]);

  useEffect(() => {
    if (
      printersLoaded &&
      dbDefaultPrinterNameLoaded &&
      defaultPrinter?.name != dbDefaultPrinterName
    ) {
      updateSetting({
        settingType: SettingTypeEnum.DEFAULT_PRINTER,
        settingValue: defaultPrinter?.name,
      });
    }
  }, [
    printersLoaded,
    dbDefaultPrinterNameLoaded,
    dbDefaultPrinterName,
    defaultPrinter,
    updateSetting,
  ]);

  const isLoading =
    printersLoading || dbDefaultPrinterNameLoading || updateSettingLoading;

  return { data: defaultPrinter, isLoading };
};

/**
 * A react hook that returns functions that can be used to print based on IVLS.
 *
 * Calling `printPdf` fetches available printers, the default printer setting
 * and can potentially 'correct' the default printer setting in the database
 * as a side-effect.
 *
 * @see useLazyGetDefaultPrinter
 */
export const usePrint = () => {
  const [getSetting] = useLazyGetSettingQuery();
  const [printPdf] = usePrintPdfMutation();
  const [getDefaultPrinter] = useLazyGetDefaultPrinter();

  return useMemo(() => {
    return {
      printPdf: async (data: Blob, job: string, copies?: number) => {
        const printer = (await getDefaultPrinter())?.name;

        const paper = await getSetting(
          SettingTypeEnum.DEFAULT_PAPER_SIZE
        ).unwrap();

        if (printer == null) {
          throw Error("No printer is available");
        }

        if (!isPaperSize(paper)) {
          throw Error("Unable to determine paper size");
        }

        return printPdf({ data, job, printer, paper, copies }).unwrap();
      },
    };
  }, [getDefaultPrinter, getSetting, printPdf]);
};
