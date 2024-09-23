import {
  CatOneConfigurationDto,
  OffsetsDto,
  SmartQCRunRecordDto,
} from "@viewpoint/api";
import { CacheTags, viewpointApi } from "./ApiSlice";

export const catOneApi = viewpointApi.injectEndpoints({
  endpoints: (builder) => ({
    requestShutdownForShipping: builder.mutation<void, number>({
      query: (instrumentId) => {
        return {
          method: "POST",
          url: `catOne/${instrumentId}/maintenance/shutdownForShipping/request`,
        };
      },
      invalidatesTags: [CacheTags.Instruments],
    }),
    requestGeneralClean: builder.mutation<void, number>({
      query: (instrumentId) => {
        return {
          method: "POST",
          url: `catOne/${instrumentId}/maintenance/clean/request`,
        };
      },
      invalidatesTags: [CacheTags.Instruments],
    }),
    completeGeneralClean: builder.mutation<void, number>({
      query: (instrumentId) => {
        return {
          method: "POST",
          url: `catOne/${instrumentId}/maintenance/clean/complete`,
        };
      },
      invalidatesTags: [CacheTags.Instruments],
    }),
    cancelGeneralClean: builder.mutation<void, number>({
      query: (instrumentId) => {
        return {
          method: "POST",
          url: `catOne/${instrumentId}/maintenance/clean/cancel`,
        };
      },
      invalidatesTags: [CacheTags.Instruments],
    }),
    requestOpticsCalibration: builder.mutation<void, number>({
      query: (instrumentId) => {
        return {
          method: "POST",
          url: `catOne/${instrumentId}/maintenance/opticsCalibration/request`,
        };
      },
      invalidatesTags: [CacheTags.Instruments],
    }),
    completeOpticsCalibration: builder.mutation<void, number>({
      query: (instrumentId) => {
        return {
          method: "POST",
          url: `catOne/${instrumentId}/maintenance/opticsCalibration/complete`,
        };
      },
      invalidatesTags: [CacheTags.Instruments],
    }),
    cancelOpticsCalibration: builder.mutation<void, number>({
      query: (instrumentId) => {
        return {
          method: "POST",
          url: `catOne/${instrumentId}/maintenance/opticsCalibration/cancel`,
        };
      },
      invalidatesTags: [CacheTags.Instruments],
    }),
    requestOffsets: builder.mutation<
      void,
      { instrumentId: number; offsetsDto: OffsetsDto }
    >({
      query: ({ instrumentId, offsetsDto }) => ({
        method: "PUT",
        url: `catOne/${instrumentId}/maintenance/offsets/request`,
        body: offsetsDto,
      }),
      invalidatesTags: [CacheTags.Instruments],
    }),
    cancelOffsets: builder.mutation<void, number>({
      query: (instrumentId) => ({
        method: "POST",
        url: `catOne/${instrumentId}/maintenance/offsets/cancel`,
      }),
      invalidatesTags: [CacheTags.Instruments],
    }),
    completeOffsets: builder.mutation<void, number>({
      query: (instrumentId) => ({
        method: "POST",
        url: `catOne/${instrumentId}/maintenance/offsets/complete`,
      }),
      invalidatesTags: [CacheTags.Instruments],
    }),

    getCatOneConfiguration: builder.query<CatOneConfigurationDto, number>({
      query: (instrumentId) => `catOne/${instrumentId}/catOneConfigurations`,
      providesTags: [CacheTags.InstrumentConfig],
    }),
    updateCatOneConfiguration: builder.mutation<
      CatOneConfigurationDto,
      { instrumentId: number; configuration: CatOneConfigurationDto }
    >({
      query: ({ instrumentId, configuration }) => ({
        url: `catOne/${instrumentId}/catOneConfigurations`,
        body: configuration,
        method: "POST",
      }),
      invalidatesTags: [CacheTags.InstrumentConfig],
    }),

    requestOptimization: builder.mutation<void, number>({
      query: (instrumentId) => ({
        method: "POST",
        url: `catOne/${instrumentId}/maintenance/optimize`,
      }),
      invalidatesTags: [CacheTags.Instruments],
    }),

    getCatOneSmartQcRuns: builder.query<SmartQCRunRecordDto[], number>({
      query: (instrumentId) => `catOne/${instrumentId}/smartQC/runs`,
      providesTags: [CacheTags.Results, CacheTags.QualityControl],
    }),

    deferCatOneSmartQcReminder: builder.mutation<void, void>({
      query: () => ({
        method: "POST",
        url: `catOne/smartQC/reminder/deferral`,
      }),
      invalidatesTags: [CacheTags.Instruments, CacheTags.Settings],
    }),
  }),
});

export const {
  useRequestShutdownForShippingMutation,
  useRequestGeneralCleanMutation,
  useCancelGeneralCleanMutation,
  useCompleteGeneralCleanMutation,
  useRequestOpticsCalibrationMutation,
  useCancelOpticsCalibrationMutation,
  useCompleteOpticsCalibrationMutation,
  useRequestOffsetsMutation,
  useCancelOffsetsMutation,
  useCompleteOffsetsMutation,
  useGetCatOneConfigurationQuery,
  useUpdateCatOneConfigurationMutation,
  useRequestOptimizationMutation,
  useGetCatOneSmartQcRunsQuery,
  useDeferCatOneSmartQcReminderMutation,
} = catOneApi;
