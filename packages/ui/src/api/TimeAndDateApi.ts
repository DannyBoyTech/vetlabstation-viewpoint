import { CacheTags, viewpointApi } from "./ApiSlice";
import { LocationDto, TimeConfigurationDto, TimeZoneDto } from "@viewpoint/api";

export const timeAndDateApi = viewpointApi.injectEndpoints({
  endpoints: (builder) => ({
    getCurrentTimeZone: builder.query<TimeConfigurationDto, void>({
      query: () => "timeZone",
      providesTags: [CacheTags.TimeConfiguration],
    }),
    getAvailableLocations: builder.query<LocationDto[], void>({
      query: () => "timeZone/locations",
      providesTags: [CacheTags.TimeConfiguration],
    }),
    getAvailableTimeZones: builder.query<
      TimeZoneDto[],
      { countryCode?: string } | undefined
    >({
      query: (params) => ({
        url: "timeZone/list",
        params: params,
      }),
    }),
    getIsTimeZoneSyncing: builder.query<boolean, void>({
      query: () => "timeZone/sync",
    }),
    updateTimeConfiguration: builder.mutation<void, TimeConfigurationDto>({
      query: (body) => {
        return {
          method: "POST",
          url: `timeZone`,
          body: {
            "@class": "com.idexx.labstation.core.dto.TimeConfigurationDto",
            ...body,
          },
        };
      },
      invalidatesTags: [CacheTags.TimeConfiguration],
    }),
  }),
});

export const {
  useGetAvailableLocationsQuery,
  useGetAvailableTimeZonesQuery,
  useGetCurrentTimeZoneQuery,
  useUpdateTimeConfigurationMutation,
  useGetIsTimeZoneSyncingQuery,
} = timeAndDateApi;
