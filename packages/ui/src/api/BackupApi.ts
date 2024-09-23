import { CacheTags, viewpointApi } from "./ApiSlice";
import { BackupMetadataWrapperDto } from "@viewpoint/api";

export const backupApi = viewpointApi.injectEndpoints({
  endpoints: (builder) => ({
    isSmartServiceAgentRunning: builder.query<boolean, void>({
      query: () => "backup/agent/status",
    }),
    recoverSmartServiceAgent: builder.mutation<void, void>({
      query: () => ({
        url: "backup/agent/doRecover",
        method: "POST",
      }),
    }),
    createBackup: builder.mutation<string, void>({
      query: () => ({
        url: "backup",
        method: "POST",
        responseHandler: (resp) => resp.text(),
      }),
      invalidatesTags: [CacheTags.Backups],
    }),
    waitForBackup: builder.query<BackupMetadataWrapperDto, string>({
      query: (backupId) => ({
        url: `backup/await`,
        params: { backupId },
        method: "GET",
      }),
    }),
    cancelWaiting: builder.mutation<void, string>({
      query: (backupId) => ({
        url: `backup/await/cancel`,
        params: { backupId },
        method: "POST",
      }),
    }),
  }),
});

export const {
  useLazyIsSmartServiceAgentRunningQuery,
  useLazyWaitForBackupQuery,
  useRecoverSmartServiceAgentMutation,
  useCreateBackupMutation,
  useCancelWaitingMutation,
} = backupApi;
