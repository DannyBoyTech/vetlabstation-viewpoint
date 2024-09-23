import { type SnapDeviceDto } from "@viewpoint/api";
import { CacheTags, viewpointApi } from "./ApiSlice";

export const snapApi = viewpointApi.injectEndpoints({
  endpoints: (builder) => ({
    getSnapDevices: builder.query<
      SnapDeviceDto[],
      { speciesId: number; enabledOnly?: boolean }
    >({
      query: ({ speciesId, ...params }) => ({
        url: `snapDevice/species/${speciesId}/devices`,
        params,
      }),
      providesTags: [CacheTags.Settings],
    }),
  }),
});

export const { useGetSnapDevicesQuery } = snapApi;
