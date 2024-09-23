import { CacheTags, viewpointApi } from "./ApiSlice";
import {
  QcLotsFilter,
  AcadiaQualityControlLotDto,
  AcadiaQualityControlRunRecordDto,
} from "@viewpoint/api";

export const proCyteOneQualityControlApi = viewpointApi.injectEndpoints({
  endpoints: (builder) => ({
    getProCyteOneQcLots: builder.query<
      AcadiaQualityControlLotDto[],
      {
        instrumentId: number;
        filter: QcLotsFilter;
      }
    >({
      query: ({ instrumentId, ...args }) => ({
        url: `/acadiaQualityControl/${instrumentId}/lots`,
        params: args,
      }),
      providesTags: [CacheTags.Results],
    }),
    getProCyteOneQcLotRuns: builder.query<
      AcadiaQualityControlRunRecordDto[],
      { instrumentId: number; lotNumber?: string }
    >({
      query: ({ instrumentId, ...params }) => ({
        url: `/acadiaQualityControl/${instrumentId}/lot/runs`,
        params,
      }),
      providesTags: [CacheTags.Results],
    }),
  }),
});

export const { useGetProCyteOneQcLotsQuery, useGetProCyteOneQcLotRunsQuery } =
  proCyteOneQualityControlApi;
