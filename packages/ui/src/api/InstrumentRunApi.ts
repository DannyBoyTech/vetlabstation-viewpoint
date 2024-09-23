import {
  CytologyImageDto,
  DotPlotNodeDataResponse,
  UriSedImageDto,
  UserInputRequest,
  WorkRequestStatus,
} from "@viewpoint/api";
import { CacheTags, viewpointApi } from "./ApiSlice";

const instrumentRunApi = viewpointApi.injectEndpoints({
  endpoints: (builder) => ({
    getUserInputRequests: builder.query<UserInputRequest[], number>({
      query: (instrumentRunId) => ({
        url: `instrumentRun/${instrumentRunId}/userInputRequests`,
      }),
      providesTags: [CacheTags.UserInputRequests],
    }),
    getWorkRequestStatus: builder.query<WorkRequestStatus, number>({
      query: (instrumentRunId) => ({
        url: `instrumentRun/${instrumentRunId}/workRequestStatus`,
      }),
      providesTags: [CacheTags.Instruments, CacheTags.RunningLabRequests], // work req status is derived from instrument and run status
    }),
    startRun: builder.mutation<void, number>({
      query: (instrumentRunId) => ({
        method: "POST",
        url: `instrumentRun/${instrumentRunId}/execute`,
      }),
    }),
    getImageData: builder.query<
      UriSedImageDto[],
      { runId: number; thumbnailWidth?: number; thumbnailHeight?: number }
    >({
      query: ({ runId, thumbnailWidth, thumbnailHeight }) => ({
        url: `sediVue/instrumentRun/${runId}/images`,
        params: { thumbnailHeight, thumbnailWidth },
      }),
      providesTags: [
        CacheTags.RunningLabRequests,
        CacheTags.Results,
        CacheTags.Images,
      ],
    }),
    markImagesForRecord: builder.mutation<
      void,
      { runId: number; markedImageMappings: Record<string, boolean> }
    >({
      query: ({ runId, markedImageMappings }) => ({
        method: "POST",
        url: `/sediVue/instrumentRun/${runId}/userImageSelectionStatus`,
        body: markedImageMappings,
      }),
      invalidatesTags: [CacheTags.Images],
    }),
    getDotPlotData: builder.query<
      DotPlotNodeDataResponse[],
      { runUuid: string; thumbnailWidth?: number; thumbnailHeight?: number }
    >({
      query: ({ runUuid, thumbnailWidth, thumbnailHeight }) => ({
        url: `_images/dotPlot/run/${runUuid}/image`,
        params: { thumbnailHeight, thumbnailWidth },
      }),
      providesTags: [
        CacheTags.RunningLabRequests,
        CacheTags.Results,
        CacheTags.Images,
      ],
    }),

    getCytologyImageData: builder.query<
      CytologyImageDto[],
      { runId: number; thumbnailWidth?: number; thumbnailHeight?: number }
    >({
      query: ({ runId, thumbnailWidth, thumbnailHeight }) => ({
        url: `/theia/instrumentRuns/${runId}/images`,
        params: { thumbnailHeight, thumbnailWidth },
      }),
      providesTags: [
        CacheTags.RunningLabRequests,
        CacheTags.Results,
        CacheTags.Images,
      ],
    }),
  }),
});

export const {
  useGetUserInputRequestsQuery,
  useGetWorkRequestStatusQuery,
  useStartRunMutation,
  useGetImageDataQuery,
  useMarkImagesForRecordMutation,
  useGetDotPlotDataQuery,
  useGetCytologyImageDataQuery,
} = instrumentRunApi;
