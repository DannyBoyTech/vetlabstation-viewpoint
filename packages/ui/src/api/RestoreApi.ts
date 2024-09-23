import { CacheTags, viewpointApi } from "./ApiSlice";
import {
  ModeEnum,
  RestoreFileDto,
  RestoreSource,
  RestoreValidationResponse,
} from "@viewpoint/api";

export const restoreApi = viewpointApi.injectEndpoints({
  endpoints: (builder) => ({
    copyRestoreFiles: builder.mutation<string, RestoreFileDto>({
      query: (dto: RestoreFileDto) => ({
        url: "restore/copyUsbRestoreFiles",
        method: "POST",
        body: dto,
        responseHandler: (resp) => resp.text(),
      }),
    }),
    getRestoreFiles: builder.query<RestoreFileDto[], string>({
      query: (usbId: string) => ({
        url: "restore/usbRestoreFiles",
        params: { usbId },
      }),
      providesTags: [CacheTags.Backups],
    }),
    performRestore: builder.mutation<
      string,
      { mode: ModeEnum; dto: RestoreFileDto; source: RestoreSource }
    >({
      query: ({ mode, source, dto }) => ({
        url: `/restore/performRestore/${source}/${mode}`,
        method: "POST",
        body: dto,
      }),
    }),
    getFileSystemBackup: builder.query<RestoreFileDto, void>({
      query: () => ({
        url: "/restore/hasFileSystemBackup",
      }),
    }),
    validateRestoreFile: builder.mutation<
      RestoreValidationResponse,
      RestoreFileDto
    >({
      query: (dto) => ({
        url: `/restore/validate`,
        method: "PUT",
        body: dto,
      }),
    }),
    respondToAsyncRestoreRequest: builder.mutation<
      void,
      {
        backupId: string;
        accepted: boolean;
        reason?: string;
        restoreEventId?: string;
      }
    >({
      query: ({ backupId, ...params }) => ({
        url: `/restore/remoteRestore/response/${backupId}`,
        method: "POST",
        params,
      }),
    }),
  }),
});

export const {
  useCopyRestoreFilesMutation,
  useGetRestoreFilesQuery,
  usePerformRestoreMutation,
  useLazyGetFileSystemBackupQuery,
  useValidateRestoreFileMutation,
  useRespondToAsyncRestoreRequestMutation,
} = restoreApi;
