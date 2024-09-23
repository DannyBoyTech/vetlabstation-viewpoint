import type { ManualUAResults, RecentResultDto } from "@viewpoint/api";
import { CacheTags, viewpointApi } from "./ApiSlice";

interface UpdateResultAssayTypeParams {
  instrumentRunId: number;
  instrumentResultId: number;
  assayType: number;
}

const resultsApi = viewpointApi.injectEndpoints({
  endpoints: (builder) => ({
    getRecentResults: builder.query<RecentResultDto[], number>({
      query: (days) => ({ url: "/result/recent", params: { days } }),
      providesTags: [CacheTags.Results, CacheTags.Patients],
    }),
    updateResultAssayType: builder.mutation<void, UpdateResultAssayTypeParams>({
      query: ({ instrumentRunId, instrumentResultId, assayType }) => ({
        method: "POST",
        url: `/result/instrumentRun/${instrumentRunId}/instrumentResult/${instrumentResultId}/updateResultAssayType`,
        body: `${assayType}`,
        headers: {
          "content-type": "application/json",
        },
      }),
      invalidatesTags: [CacheTags.UserInputRequests],
    }),
    saveManualUaResults: builder.mutation<
      void,
      { results: ManualUAResults; instrumentRunId: number }
    >({
      query: (args) => ({
        url: `/instrumentRun/${args.instrumentRunId}/results/mua`,
        method: "POST",
        body: args.results,
      }),
      invalidatesTags: [CacheTags.RunningLabRequests, CacheTags.Results],
    }),
    editManualUaResults: builder.mutation<
      void,
      { results: ManualUAResults; instrumentRunId: number }
    >({
      query: (args) => ({
        url: `/instrumentRun/${args.instrumentRunId}/results/mua`,
        method: "PUT",
        body: args.results,
      }),
      invalidatesTags: [CacheTags.RunningLabRequests, CacheTags.Results],
    }),
  }),
});

export type { UpdateResultAssayTypeParams };

export { resultsApi };

export const {
  useGetRecentResultsQuery,
  useUpdateResultAssayTypeMutation,
  useSaveManualUaResultsMutation,
  useEditManualUaResultsMutation,
} = resultsApi;
