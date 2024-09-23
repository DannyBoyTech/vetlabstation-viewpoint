import { CacheTags, viewpointApi } from "./ApiSlice";
import {
  UpgradeAvailableDto,
  UpgradeLetterDto,
  UpgradeMedium,
  UpgradePropertiesDto,
  UpgradeRequestDto,
  UpgradeResultDto,
  UpgradeStatusDto,
} from "@viewpoint/api";

export const SmartServiceUpgradeAction = {
  Manual: "upgradeManual",
  Later: "later",
  Upgrade: "upgrade",
};

export type SmartServiceUpgradeType =
  (typeof SmartServiceUpgradeAction)[keyof typeof SmartServiceUpgradeAction];

export const upgradeApi = viewpointApi.injectEndpoints({
  endpoints: (builder) => ({
    getUpgradeMediums: builder.query<UpgradeMedium[], void>({
      query: () => "upgrade/upgrade_mediums",
    }),
    hasValidUpgrade: builder.query<boolean, string>({
      query: (usbId) => ({
        url: "upgrade/valid/USB",
        params: { usbId },
      }),
    }),
    getUsbUpgradeProperties: builder.query<UpgradePropertiesDto, string>({
      query: (usbId) => ({
        url: "upgrade/usb/properties",
        params: { usbId },
      }),
    }),
    getUpgradeLetter: builder.query<UpgradeLetterDto, string>({
      query: (usbId) => ({
        url: "upgrade/usb/upgradeLetter",
        params: { usbId },
      }),
    }),
    getUpgradeStatus: builder.query<UpgradeStatusDto, void>({
      query: () => ({
        url: "upgrade/status/fetch",
      }),
      providesTags: [CacheTags.UpgradeStatus],
    }),
    upgradeAvailable: builder.query<UpgradeAvailableDto, void>({
      query: () => ({
        url: "upgrade/upgrade_available",
      }),
      providesTags: [CacheTags.UpgradeStatus],
    }),
    upgradeBySmartService: builder.mutation<void, SmartServiceUpgradeType>({
      query: (action) => ({
        method: "POST",
        url: `upgrade/perform/SmartService/${action}`,
      }),
    }),
    upgradeByUsb: builder.mutation<UpgradeResultDto, UpgradeRequestDto>({
      query: (body) => ({
        method: "POST",
        url: `upgrade/perform/copied_usb`,
        body,
      }),
    }),
    resetUpgradeStatus: builder.mutation<void, void>({
      query: () => ({
        method: "POST",
        url: `upgrade/status/reset`,
      }),
      invalidatesTags: [CacheTags.UpgradeStatus],
    }),
  }),
});

export const {
  useLazyGetUpgradeMediumsQuery,
  useLazyHasValidUpgradeQuery,
  useLazyGetUsbUpgradePropertiesQuery,
  useGetUpgradeLetterQuery,
  useUpgradeAvailableQuery,
  useLazyUpgradeAvailableQuery,
  useGetUpgradeStatusQuery,
  useLazyGetUpgradeStatusQuery,
  useUpgradeBySmartServiceMutation,
  useUpgradeByUsbMutation,
  useResetUpgradeStatusMutation,
} = upgradeApi;
