import { QualityControlRunRecordDto } from "@viewpoint/api";
import { CacheTags, viewpointApi } from "./ApiSlice";

export const uriSysDxApi = viewpointApi.injectEndpoints({
  endpoints: (builder) => ({
    requestUriSysDxInitializeProcedure: builder.mutation<
      void,
      {
        instrumentId: number;
      }
    >({
      query: ({ instrumentId }) => ({
        url: `instruments/urisysdx/${instrumentId}/maintenance/initialize/request`,
        method: "POST",
      }),
      invalidatesTags: [CacheTags.Instruments],
    }),
    requestUriSysDxShutdownProcedure: builder.mutation<
      void,
      {
        instrumentId: number;
      }
    >({
      query: ({ instrumentId }) => ({
        url: `instruments/urisysdx/${instrumentId}/maintenance/shutdown/request`,
        method: "POST",
      }),
      invalidatesTags: [CacheTags.Instruments],
    }),
    getUriSysDxCalibrationRuns: builder.query<
      QualityControlRunRecordDto[],
      { instrumentId: number }
    >({
      query: ({ instrumentId }) => ({
        url: `/uriSysDxQualityControl/${instrumentId}/runs`,
      }),
      providesTags: [CacheTags.QualityControl],
    }),
  }),
});

export const {
  useRequestUriSysDxInitializeProcedureMutation,
  useRequestUriSysDxShutdownProcedureMutation,
  useGetUriSysDxCalibrationRunsQuery,
} = uriSysDxApi;
