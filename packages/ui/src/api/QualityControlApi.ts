import { CacheTags, viewpointApi } from "./ApiSlice";
import {
  InstrumentType,
  QualityControlDto,
  QualityControlRunRecordDto,
  QcLotsFilter,
  QualityControlRunRequestDto,
  ExecuteQualityControlRunResponseDto,
  QcLotDto,
  QualityControlTrendDto,
} from "@viewpoint/api";

const qualityControlApi = viewpointApi.injectEndpoints({
  endpoints: (builder) => ({
    getCatalystQcLots: builder.query<
      QualityControlDto[],
      {
        instrumentId: number;
        instrumentType: InstrumentType;
        filter: QcLotsFilter;
      }
    >({
      query: ({ ...args }) => ({
        url: `/qualityControl/catalyst/lots`,
        params: args,
      }),
      providesTags: [CacheTags.Results, CacheTags.QualityControl],
    }),

    getQcLots: builder.query<
      QcLotDto[],
      {
        instrumentId: number;
        instrumentType: InstrumentType;
      }
    >({
      query: ({ ...args }) => ({
        url: `/qualityControl/lots`,
        params: args,
      }),
      providesTags: [CacheTags.Results, CacheTags.QualityControl],
    }),

    getQcRunRecords: builder.query<
      QualityControlRunRecordDto[],
      { instrumentId: number; qualityControlId?: number }
    >({
      query: ({ instrumentId, ...params }) => ({
        url: `/device/${instrumentId}/runs`,
        params,
      }),
      providesTags: [CacheTags.Results, CacheTags.QualityControl],
    }),

    runSmartQc: builder.mutation<ExecuteQualityControlRunResponseDto, number>({
      query: (instrumentId) => ({
        method: "POST",
        url: `/qualityControl/${instrumentId}`,
        headers: {
          "content-type": "application/json",
        },
      }),
      invalidatesTags: [CacheTags.Results],
    }),

    runQc: builder.mutation<
      ExecuteQualityControlRunResponseDto,
      QualityControlRunRequestDto
    >({
      query: (qcReq) => ({
        method: "POST",
        url: `/qualityControl`,
        body: qcReq,
      }),
      invalidatesTags: [CacheTags.Results],
    }),

    saveQcTrendDto: builder.mutation<
      void,
      { runId: number; trendDto: QualityControlTrendDto }
    >({
      query: ({ trendDto, runId }) => ({
        method: "PUT",
        url: `/qualityControl/${runId}/trends`,
        body: trendDto,
      }),
      invalidatesTags: [CacheTags.Results],
    }),
  }),
});

export default qualityControlApi;

export const {
  useGetCatalystQcLotsQuery,
  useGetQcLotsQuery,
  useGetQcRunRecordsQuery,
  useRunSmartQcMutation,
  useRunQcMutation,
  useSaveQcTrendDtoMutation,
} = qualityControlApi;
