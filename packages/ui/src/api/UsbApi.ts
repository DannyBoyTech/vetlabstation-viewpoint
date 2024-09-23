import { viewpointApi } from "./ApiSlice";
import {
  BackupMetadataWrapperDto,
  RemovableDriveDto,
  UsbUpgradeCopyResultDto,
} from "@viewpoint/api";

export const usbApi = viewpointApi.injectEndpoints({
  endpoints: (builder) => ({
    getRemovableDrives: builder.query<RemovableDriveDto[], void>({
      query: () => "usb/drives",
    }),
    getDeletableBackupCandidates: builder.query<
      BackupMetadataWrapperDto[],
      { usbId: string; backupSize: number }
    >({
      query: (params) => ({ url: "usb/backup/deletable", params }),
    }),
    copyUpgrade: builder.mutation<UsbUpgradeCopyResultDto, string>({
      query: (usbId) => ({
        method: "POST",
        url: "usb/copy/upgrade",
        params: { usbId },
      }),
    }),
    cancelCopy: builder.mutation<void, string>({
      query: (copyId) => ({
        method: "POST",
        url: "usb/copy/cancel",
        params: { copyId },
      }),
    }),
    copyBackup: builder.mutation<
      string,
      {
        usbId: string;
        backupMetadata: BackupMetadataWrapperDto;
      }
    >({
      query: ({ usbId, backupMetadata }) => ({
        method: "POST",
        url: "usb/backup",
        params: { usbId },
        body: backupMetadata,
        responseHandler: (resp) => resp.text(),
      }),
    }),
    calculateBackupSize: builder.mutation<number, BackupMetadataWrapperDto>({
      query: (backupMetadata) => ({
        method: "POST",
        url: "usb/backup/size",
        body: backupMetadata,
      }),
    }),
    deleteUsbBackups: builder.mutation<boolean, BackupMetadataWrapperDto[]>({
      query: (backupMetadata) => ({
        method: "POST",
        url: "usb/backup/delete",
        body: backupMetadata,
      }),
    }),
  }),
});

export const {
  useGetRemovableDrivesQuery,
  useLazyGetRemovableDrivesQuery,
  useLazyGetDeletableBackupCandidatesQuery,
  useCopyUpgradeMutation,
  useCancelCopyMutation,
  useCopyBackupMutation,
  useCalculateBackupSizeMutation,
  useDeleteUsbBackupsMutation,
} = usbApi;
