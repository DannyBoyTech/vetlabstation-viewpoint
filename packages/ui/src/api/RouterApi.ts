import {
  IvlsRouterDto,
  IvlsWiredRouterConfigDto,
  IvlsWirelessRouterConfigDto,
} from "@viewpoint/api";
import { CacheTags, viewpointApi } from "./ApiSlice";

const routerApi = viewpointApi.injectEndpoints({
  endpoints: (builder) => ({
    getRouter: builder.query<IvlsRouterDto, void>({
      query: () => ({
        method: "GET",
        url: "/router",
        timeout: 2500,
      }),
      providesTags: [CacheTags.RouterInfo],
    }),
    updateWired: builder.mutation<
      boolean,
      { config: IvlsWiredRouterConfigDto; reboot: boolean }
    >({
      query: ({ config, reboot }) => ({
        method: "PUT",
        url: "/router/configuration/wired",
        body: config,
        params: { reboot },
      }),
      invalidatesTags: [CacheTags.RouterInfo],
    }),
    updateWireless: builder.mutation<
      boolean,
      { config: IvlsWirelessRouterConfigDto; reboot: boolean }
    >({
      query: ({ config, reboot }) => ({
        method: "PUT",
        url: "/router/configuration/wireless",
        body: config,
        params: { reboot },
      }),
      invalidatesTags: [CacheTags.RouterInfo],
    }),
  }),
});

export const {
  useLazyGetRouterQuery,
  useUpdateWiredMutation,
  useUpdateWirelessMutation,
} = routerApi;
