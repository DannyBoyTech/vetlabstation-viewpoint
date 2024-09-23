import { CacheTags, viewpointApi } from "./ApiSlice";
import {
  BarcodeValidationRequestDto,
  BarcodeValidationResponseDto,
  ConnectionApprovalRequestDto,
  DefaultRunConfigs,
  DetailedInstrumentStatusDto,
  DilutionDisplayConfig,
  EventLogDto,
  InstrumentSettingKey,
  InstrumentStatusDto,
  InstrumentType,
  SnapProInstrumentStatusDto,
} from "@viewpoint/api";

export type GetDefaultRunConfigsParams = {
  speciesId: number;
  refClassId?: number;
};

export const instrumentApi = viewpointApi.injectEndpoints({
  endpoints: (builder) => ({
    getInstrumentStatuses: builder.query<InstrumentStatusDto[], void>({
      query: () => "device/status",
      providesTags: [CacheTags.Instruments],
    }),
    getLaserCyteStatuses: builder.query<InstrumentStatusDto[], void>({
      query: () => "device/laserCyte",
      providesTags: [CacheTags.Instruments],
    }),
    getInstrument: builder.query<InstrumentStatusDto | undefined, number>({
      query: (instrumentId) => `device/${instrumentId}/status`,
      providesTags: [CacheTags.Instruments],
    }),
    getDetailedInstrumentStatus: builder.query<
      DetailedInstrumentStatusDto | undefined,
      number
    >({
      query: (id) => `instruments/${id}/status`,
      providesTags: [CacheTags.Instruments],
    }),
    getSnapStatuses: builder.query<SnapProInstrumentStatusDto[], void>({
      query: () => ({ url: `device/snap/status` }),
      providesTags: [CacheTags.SnapProStatus, CacheTags.Instruments],
    }),
    getInstrumentsForSpecies: builder.query<
      InstrumentStatusDto[],
      { speciesId?: number }
    >({
      query: (params) => ({ url: "device/status", params }),
      providesTags: [CacheTags.Instruments],
    }),
    getDefaultRunConfigs: builder.query<
      DefaultRunConfigs | undefined,
      GetDefaultRunConfigsParams
    >({
      query: (args) => ({
        url: `device/runConfigs`,
        params: args,
      }),
      // Content is dependent on the connected instruments -- if a new one is added, the cache for this endpoint needs to be invalidated
      providesTags: [CacheTags.Instruments],
    }),
    getDilutionConfigs: builder.query<
      { [key in InstrumentType]?: DilutionDisplayConfig },
      void
    >({
      query: () => "device/dilutionConfigs",
    }),
    enterStandby: builder.mutation<void, number>({
      query: (instrumentId) => ({
        url: `standby/${instrumentId}/enter`,
        method: "POST",
      }),
      invalidatesTags: [CacheTags.Instruments],
    }),
    exitStandby: builder.mutation<void, number>({
      query: (instrumentId) => ({
        url: `standby/${instrumentId}/exit`,
        method: "POST",
      }),
      invalidatesTags: [CacheTags.Instruments],
    }),
    standby: builder.mutation<void, { instrumentId: number; standby: boolean }>(
      {
        query: ({ instrumentId, ...body }) => ({
          url: `device/${instrumentId}/standby`,
          method: "PUT",
          body,
        }),
        invalidatesTags: [CacheTags.Instruments],
      }
    ),
    startupInstrument: builder.mutation<void, number>({
      query: (instrumentId) => ({
        url: `instrument/${instrumentId}/startup`,
        method: "POST",
      }),
      invalidatesTags: [CacheTags.Instruments],
    }),
    suppress: builder.mutation<void, { instrumentId: number }>({
      query: ({ instrumentId, ...body }) => ({
        url: `/device/${instrumentId}/suppress`,
        method: "POST",
        body,
      }),
      invalidatesTags: [CacheTags.Instruments],
    }),

    sendEventLogs: builder.mutation<void, { instrumentId: number }>({
      query: ({ instrumentId }) => ({
        url: `instrumentEventLogs/${instrumentId}`,
        method: "POST",
      }),
    }),
    requestInstrumentSettingsUpdate: builder.mutation<
      void,
      { instrumentId: number; settingKey: InstrumentSettingKey }
    >({
      query: ({ instrumentId, settingKey }) => ({
        url: `settings/instrument/${instrumentId}/${settingKey}`,
        method: "POST",
      }),
      invalidatesTags: [CacheTags.InstrumentConfig],
    }),

    updateInstrumentSetting: builder.mutation<
      void,
      { instrumentId: number; settingKey: InstrumentSettingKey; value: string }
    >({
      query: ({ instrumentId, settingKey, value }) => ({
        url: `settings/instrument/${instrumentId}/${settingKey}`,
        method: "PUT",
        body: value,
        headers: {
          "content-type": "application/json", // IVLS expects this content-type even though the body is just a plain string
        },
      }),
      invalidatesTags: [CacheTags.InstrumentConfig],
    }),
    eventLog: builder.query<
      EventLogDto[],
      { identifier: string; cutoffDate?: string }
    >({
      query: ({ identifier, cutoffDate }) => {
        return {
          url: `eventlog`,
          params: { identifier, cutoffDate },
        };
      },
      providesTags: [CacheTags.Instruments],
    }),
    getDevicesAwaitingApproval: builder.query<
      ConnectionApprovalRequestDto[],
      void
    >({
      query: () => "device/awaitingApproval",
      providesTags: [CacheTags.DevicesApproval],
    }),
    approveConnection: builder.mutation<
      void,
      { instrumentId: number; approved: boolean }
    >({
      query: ({ instrumentId, approved }) => ({
        url: `/device/${instrumentId}/approved`,
        method: "POST",
        params: { approved },
      }),
      invalidatesTags: [CacheTags.Instruments],
    }),

    cancelProcedure: builder.mutation<
      void,
      { instrumentId: number; procedure: string }
    >({
      query: ({ instrumentId, procedure }) => ({
        url: `procedures/${procedure}/cancel`,
        method: "POST",
        params: { instrumentId },
      }),
    }),

    stopWaiting: builder.mutation<void, { instrumentId: number }>({
      query: ({ instrumentId }) => ({
        url: `/device/${instrumentId}/stopWaiting`,
        method: "POST",
      }),
      invalidatesTags: [CacheTags.Instruments],
    }),

    validateBarcode: builder.mutation<
      BarcodeValidationResponseDto,
      BarcodeValidationRequestDto & { instrumentId: number }
    >({
      query: ({ instrumentId, ...request }) => {
        return {
          method: "PUT",
          url: `instrument/${instrumentId}/barcode`,
          body: request,
        };
      },
    }),
  }),
});

export const {
  useApproveConnectionMutation,
  useCancelProcedureMutation,
  useEnterStandbyMutation,
  useEventLogQuery,
  useExitStandbyMutation,
  useGetDefaultRunConfigsQuery,
  useGetDetailedInstrumentStatusQuery,
  useGetDevicesAwaitingApprovalQuery,
  useGetDilutionConfigsQuery,
  useGetInstrumentQuery,
  useGetInstrumentStatusesQuery,
  useGetInstrumentsForSpeciesQuery,
  useGetSnapStatusesQuery,
  useRequestInstrumentSettingsUpdateMutation,
  useSendEventLogsMutation,
  useStartupInstrumentMutation,
  useStopWaitingMutation,
  useSuppressMutation,
  useUpdateInstrumentSettingMutation,
  useValidateBarcodeMutation,
  useGetLaserCyteStatusesQuery,
  useLazyGetLaserCyteStatusesQuery,
} = instrumentApi;
