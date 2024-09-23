import { SmartQCRunRecordDto } from "@viewpoint/api";
import { CacheTags, viewpointApi } from "./ApiSlice";

export const catalystDxApi = viewpointApi.injectEndpoints({
  endpoints: (builder) => ({
    getCatDxSmartQcRuns: builder.query<SmartQCRunRecordDto[], number>({
      query: (instrumentId) => `catalystDx/${instrumentId}/smartQC/runs`,
      providesTags: [CacheTags.Results, CacheTags.QualityControl],
    }),
    deferCatDxSmartQcReminder: builder.mutation<void, void>({
      query: () => ({
        method: "POST",
        url: `catalystDx/smartQC/reminder/deferral`,
      }),
      invalidatesTags: [CacheTags.Instruments, CacheTags.Settings],
    }),
  }),
});

export const {
  useGetCatDxSmartQcRunsQuery,
  useDeferCatDxSmartQcReminderMutation,
} = catalystDxApi;
