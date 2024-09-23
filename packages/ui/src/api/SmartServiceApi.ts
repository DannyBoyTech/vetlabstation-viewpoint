import { CacheTags, viewpointApi } from "./ApiSlice";
import { SmartServiceEulaDto, SmartServiceStatus } from "@viewpoint/api";

export const smartServiceApi = viewpointApi.injectEndpoints({
  endpoints: (builder) => ({
    getSmartServiceStatus: builder.query<SmartServiceStatus, void>({
      query: () => ({
        url: "smartService/status",
      }),
      providesTags: [CacheTags.SmartService],
    }),
    activateSmartService: builder.mutation<void, SmartServiceEulaDto>({
      query: (body) => ({
        url: "smartService/activate",
        method: "POST",
        body,
      }),
      invalidatesTags: [CacheTags.SmartService],
    }),
    enableSmartService: builder.mutation<void, void>({
      query: () => ({
        url: "smartService/enable",
        method: "POST",
      }),
      invalidatesTags: [CacheTags.SmartService],
    }),
    disableSmartService: builder.mutation<void, void>({
      query: () => ({
        url: "smartService/disable",
        method: "POST",
      }),
      invalidatesTags: [CacheTags.SmartService],
    }),
    rescheduleOfflineNotification: builder.mutation<void, void>({
      query: () => ({
        url: "smartService/offlineNotification/reschedule",
        method: "POST",
      }),
      invalidatesTags: [CacheTags.SmartService],
    }),
    resetOfflineNotificationStatus: builder.mutation<void, void>({
      query: () => ({
        url: "smartService/offlineNotification/reset",
        method: "POST",
      }),
      invalidatesTags: [CacheTags.SmartService],
    }),
  }),
});

export const {
  useGetSmartServiceStatusQuery,
  useEnableSmartServiceMutation,
  useDisableSmartServiceMutation,
  useActivateSmartServiceMutation,
  useRescheduleOfflineNotificationMutation,
  useResetOfflineNotificationStatusMutation,
} = smartServiceApi;
