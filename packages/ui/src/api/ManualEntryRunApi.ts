import { ManualCrpResultDto, UserEnteredSnapResultDto } from "@viewpoint/api";
import { CacheTags, viewpointApi } from "./ApiSlice";

export const manualEntryRunApi = viewpointApi.injectEndpoints({
  endpoints: (builder) => ({
    startSnapTimer: builder.mutation<void, number>({
      query: (runId) => ({
        url: `instrumentRun/${runId}/startSnapTimer`,
        method: "POST",
      }),
    }),
    resetSnapTimer: builder.mutation<void, number>({
      query: (runId) => ({
        url: `instrumentRun/${runId}/resetSnapTimer`,
        method: "POST",
      }),
    }),
    saveSnapResults: builder.mutation<
      void,
      { instrumentRunId: number; results: UserEnteredSnapResultDto }
    >({
      query: ({ instrumentRunId, results }) => ({
        url: `instrumentRun/${instrumentRunId}/results/snap`,
        method: "POST",
        body: {
          "@class": "com.idexx.labstation.core.dto.UserEnteredSnapResultDto",
          ...results,
        },
      }),
      invalidatesTags: [CacheTags.Results, CacheTags.RunningLabRequests],
    }),
    editSnapResults: builder.mutation<
      void,
      { instrumentRunId: number; results: UserEnteredSnapResultDto }
    >({
      query: ({ instrumentRunId, results }) => ({
        url: `instrumentRun/${instrumentRunId}/results/snap`,
        method: "PUT",
        body: {
          "@class": "com.idexx.labstation.core.dto.UserEnteredSnapResultDto",
          ...results,
        },
      }),
      invalidatesTags: [CacheTags.Results],
    }),
    saveSnapResultsAndCreateRun: builder.mutation<
      void,
      {
        labRequestId: number;
        snapDeviceId: number;
        results: UserEnteredSnapResultDto;
      }
    >({
      query: ({ labRequestId, snapDeviceId, results }) => ({
        url: `instrumentRun/resultsAndRun/snap/${labRequestId}/${snapDeviceId}`,
        method: "POST",
        body: {
          "@class": "com.idexx.labstation.core.dto.UserEnteredSnapResultDto",
          ...results,
        },
      }),
      invalidatesTags: [CacheTags.Results, CacheTags.RunningLabRequests],
    }),

    saveCrpResults: builder.mutation<
      void,
      { instrumentRunId: number; results: ManualCrpResultDto }
    >({
      query: ({ instrumentRunId, results }) => ({
        url: `instrumentRun/${instrumentRunId}/results/crp`,
        method: "POST",
        body: {
          ...results,
        },
      }),
      invalidatesTags: [CacheTags.Results, CacheTags.RunningLabRequests],
    }),
    editCrpResults: builder.mutation<
      void,
      { instrumentRunId: number; results: ManualCrpResultDto }
    >({
      query: ({ instrumentRunId, results }) => ({
        url: `instrumentRun/${instrumentRunId}/results/crp`,
        method: "PUT",
        body: {
          ...results,
        },
      }),
      invalidatesTags: [CacheTags.Results],
    }),
  }),
});

export const {
  useStartSnapTimerMutation,
  useEditSnapResultsMutation,
  useResetSnapTimerMutation,
  useSaveSnapResultsMutation,
  useSaveSnapResultsAndCreateRunMutation,
  useSaveCrpResultsMutation,
  useEditCrpResultsMutation,
} = manualEntryRunApi;
