import { CacheTags, viewpointApi } from "./ApiSlice";
import type { SettingDto, Settings, SettingTypeEnum } from "@viewpoint/api";

export const settingsApi = viewpointApi.injectEndpoints({
  endpoints: (builder) => ({
    getSettings: builder.query<Settings, SettingTypeEnum[]>({
      query: (types) => ({
        url: "settings",
        params: types.map((value) => ["setting", value]),
      }),
      providesTags: [CacheTags.Settings],
    }),
    getSetting: builder.query<string | undefined, SettingTypeEnum>({
      query: (setting) => ({
        url: "settings",
        params: { setting },
      }),
      transformResponse: (resp: Settings, meta, arg) => resp[arg],
      providesTags: [CacheTags.Settings],
    }),
    updateSetting: builder.mutation<SettingDto[], SettingDto>({
      query: (setting) => ({
        url: "settings",
        method: "POST",
        body: [
          { ...setting, "@class": "com.idexx.labstation.core.dto.SettingDto" },
        ],
      }),
      invalidatesTags: [CacheTags.Settings],
    }),
    batchUpdateSettings: builder.mutation<SettingDto[], SettingDto[]>({
      query: (settings) => ({
        url: "settings",
        method: "POST",
        body: settings.map((setting) => ({
          ...setting,
          "@class": "com.idexx.labstation.core.dto.SettingDto",
        })),
      }),
      invalidatesTags: [CacheTags.Settings],
    }),
  }),
});

export const {
  useGetSettingsQuery,
  useGetSettingQuery,
  useLazyGetSettingQuery,
  useUpdateSettingMutation,
  useBatchUpdateSettingsMutation,
} = settingsApi;
