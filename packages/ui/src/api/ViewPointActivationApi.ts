import { ViewPointActivationStatusDto } from "@viewpoint/api";
import { viewpointApi } from "./ApiSlice";

export const viewPointActivationApi = viewpointApi.injectEndpoints({
  endpoints: (builder) => ({
    setViewPointEnabled: builder.mutation<void, ViewPointActivationStatusDto>({
      query: (body) => ({
        url: `viewPoint/activation`,
        method: "PUT",
        body,
      }),
    }),
  }),
});

export const { useSetViewPointEnabledMutation } = viewPointActivationApi;
