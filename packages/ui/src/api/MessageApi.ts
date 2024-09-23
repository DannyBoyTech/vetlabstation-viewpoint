import { Message, MessageCounts, NotificationContentDto } from "@viewpoint/api";
import { CacheTags, viewpointApi } from "./ApiSlice";
import { fetch } from "../utils/fetch-utils";

const messageApi = viewpointApi.injectEndpoints({
  endpoints: (builder) => ({
    getMessageCounts: builder.query<MessageCounts, void>({
      query: () => ({
        method: "GET",
        url: "/notifications/counts",
      }),
      providesTags: [CacheTags.Messages],
    }),
    getMessages: builder.query<Message[], void>({
      query: () => ({
        method: "GET",
        url: "/notifications",
      }),
      providesTags: [CacheTags.Messages],
    }),
    deleteMessage: builder.mutation<void, { messageId: number }>({
      query: ({ messageId }) => ({
        method: "DELETE",
        url: `/notifications/${messageId}`,
      }),
      invalidatesTags: [CacheTags.Messages],
    }),
    unreadMessage: builder.mutation<void, { messageId: number }>({
      query: ({ messageId }) => ({
        method: "POST",
        url: `/notifications/${messageId}/unread`,
      }),
      invalidatesTags: [CacheTags.Messages],
    }),
  }),
});

export function getMessageContent(messageId: number) {
  return fetch(`/labstation-webapp/api/notifications/${messageId}/view`);
}

export function getProactiveNotificationContent(messageId: number) {
  return fetch(
    `/labstation-webapp/api/notifications/${messageId}/proactiveNotification`
  );
}

export function getPrintableContent(messageId: number) {
  return fetch(`/labstation-webapp/api/notifications/${messageId}/print`);
}

export const {
  useGetMessageCountsQuery,
  useGetMessagesQuery,
  useLazyGetMessagesQuery,
  useDeleteMessageMutation,
  useUnreadMessageMutation,
} = messageApi;
