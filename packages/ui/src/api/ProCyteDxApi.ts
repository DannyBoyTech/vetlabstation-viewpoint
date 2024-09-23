import { CacheTags, viewpointApi } from "./ApiSlice";
import {
  BarcodeValidationResult,
  CrimsonInstalledReagentDto,
  CrimsonPropertiesDto,
  CrimsonQcBarcodeSaveRequestDto,
  CrimsonQcBarcodeValidateRequestDto,
  CrimsonQcBarcodeValidateResponseDto,
  CrimsonReplaceReagentDto,
  InstallationStatus,
  ProCyteDxFluidType,
  ProCyteDxProcedure,
  ProCyteDxReagent,
} from "@viewpoint/api";

export const QC_BARCODE_LENGTH = 26;

export const proCyteDxApi = viewpointApi.injectEndpoints({
  endpoints: (builder) => ({
    validateQcBarcodes: builder.mutation<
      CrimsonQcBarcodeValidateResponseDto,
      CrimsonQcBarcodeValidateRequestDto
    >({
      query: (body) => ({
        url: "proCyte/qc/barcodes/validate",
        method: "PUT",
        body,
      }),
    }),

    saveQcBarcodes: builder.mutation<void, CrimsonQcBarcodeSaveRequestDto>({
      query: (body) => ({
        url: "proCyte/qc/barcodes/save",
        method: "POST",
        body,
      }),
      invalidatesTags: [CacheTags.QualityControl],
    }),

    validateReagentBarcode: builder.mutation<
      BarcodeValidationResult,
      { instrumentId: number; fluidType: ProCyteDxFluidType; barcode: string }
    >({
      query: ({ instrumentId, fluidType, barcode }) => ({
        url: `proCyte/${instrumentId}/reagents/${fluidType}/barcodes/validate`,
        method: "PUT",
        body: barcode,
        headers: {
          "content-type": "application/json",
        },
      }),
    }),

    replaceReagent: builder.mutation<
      boolean,
      {
        instrumentId: number;
        fluidType: ProCyteDxFluidType;
        replaceReagentDto: CrimsonReplaceReagentDto;
      }
    >({
      query: ({ instrumentId, fluidType, replaceReagentDto }) => ({
        url: `proCyte/${instrumentId}/reagents/${fluidType}/replace`,
        method: "PUT",
        body: replaceReagentDto,
      }),
      invalidatesTags: [CacheTags.Reagent],
    }),

    getReagentHistory: builder.query<CrimsonInstalledReagentDto[], number>({
      query: (instrumentId) => `/proCyte/${instrumentId}/reagents`,
      providesTags: [CacheTags.Reagent],
    }),

    replenishProCyteDxReagent: builder.mutation<
      void,
      {
        instrumentId: number;
        reagent: ProCyteDxReagent;
      }
    >({
      query: ({ instrumentId, reagent }) => ({
        url: `proCyte/${instrumentId}/reagents/replenish`,
        method: "POST",
        params: { reagent },
      }),
      invalidatesTags: [CacheTags.Instruments],
    }),

    requestProCyteDxProcedure: builder.mutation<
      void,
      {
        instrumentId: number;
        procedure: ProCyteDxProcedure;
      }
    >({
      query: ({ instrumentId, procedure }) => ({
        url: `proCyte/${instrumentId}/procedure/execute`,
        method: "POST",
        params: { instrumentProcedureRequest: procedure },
      }),
      invalidatesTags: [CacheTags.Instruments],
    }),
    getProCyteDxInstrumentSettings: builder.query<CrimsonPropertiesDto, number>(
      {
        query: (instrumentId) =>
          `instrument/crimson/${instrumentId}/properties`,
        providesTags: [CacheTags.Instruments, CacheTags.InstrumentConfig],
      }
    ),
    updateProCyteDxInstrumentSettings: builder.mutation<
      CrimsonPropertiesDto,
      { instrumentId: number; properties: CrimsonPropertiesDto }
    >({
      query: ({ instrumentId, properties }) => ({
        url: `instrument/crimson/${instrumentId}/properties`,
        method: "PUT",
        body: {
          ...properties,
          standByTime: properties.standByTime
            ? {
                "@class":
                  "com.idexx.labstation.core.dto.instrument.properties.InstrumentTimePropertyDto",
                ...properties.standByTime,
              }
            : undefined,
        },
      }),
      invalidatesTags: [CacheTags.InstrumentConfig],
    }),
    verifyUsbForPdxInstall: builder.query<
      InstallationStatus,
      { instrumentId: number; serialNumber: string; driveId: string }
    >({
      query: ({ instrumentId, serialNumber, driveId }) => ({
        url: `proCyte/installation/instrument/${instrumentId}/verifyUsb`,
        params: { serialNumber, driveId },
      }),
    }),
    installPdxFromUsb: builder.mutation<
      InstallationStatus,
      { instrumentId: number; serialNumber: string; driveId: string }
    >({
      query: ({ instrumentId, serialNumber, driveId }) => ({
        method: "POST",
        url: `proCyte/installation/instrument/${instrumentId}/installFromUsb`,
        params: { serialNumber, driveId },
      }),
    }),
    transmitPdxSerialNumberFromUsb: builder.mutation<
      InstallationStatus,
      { instrumentId: number; serialNumber: string; driveId: string }
    >({
      query: ({ instrumentId, serialNumber, driveId }) => ({
        method: "POST",
        url: `proCyte/installation/instrument/${instrumentId}/transmitSerialNumberFromUsb`,
        params: { serialNumber, driveId },
      }),
    }),
    verifyLocalForPdxInstall: builder.query<
      InstallationStatus,
      { instrumentId: number; serialNumber: string }
    >({
      query: ({ instrumentId, serialNumber }) => ({
        url: `proCyte/installation/instrument/${instrumentId}/verifyLocal`,
        params: { serialNumber },
      }),
    }),
    installPdxFromLocal: builder.mutation<
      InstallationStatus,
      { instrumentId: number; serialNumber: string }
    >({
      query: ({ instrumentId, serialNumber }) => ({
        method: "POST",
        url: `proCyte/installation/instrument/${instrumentId}/installFromLocal`,
        params: { serialNumber },
      }),
    }),
    transmitPdxSerialNumberFromLocal: builder.mutation<
      InstallationStatus,
      { instrumentId: number; serialNumber: string }
    >({
      query: ({ instrumentId, serialNumber }) => ({
        method: "POST",
        url: `proCyte/installation/instrument/${instrumentId}/transmitSerialNumberFromLocal`,
        params: { serialNumber },
      }),
    }),
  }),
});

export const {
  useValidateQcBarcodesMutation,
  useSaveQcBarcodesMutation,
  useValidateReagentBarcodeMutation,
  useReplaceReagentMutation,
  useGetReagentHistoryQuery,
  useReplenishProCyteDxReagentMutation,
  useRequestProCyteDxProcedureMutation,
  useGetProCyteDxInstrumentSettingsQuery,
  useUpdateProCyteDxInstrumentSettingsMutation,
  useLazyVerifyUsbForPdxInstallQuery,
  useInstallPdxFromUsbMutation,
  useTransmitPdxSerialNumberFromUsbMutation,
  useLazyVerifyLocalForPdxInstallQuery,
  useInstallPdxFromLocalMutation,
  useTransmitPdxSerialNumberFromLocalMutation,
} = proCyteDxApi;
