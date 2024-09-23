import { CacheTags, viewpointApi } from "./ApiSlice";
import {
  VcpActivationRequestDto,
  VcpActivationResult,
  VcpConfigurationDto,
} from "@viewpoint/api";

export const VetConnectPlusApi = viewpointApi.injectEndpoints({
  endpoints: (builder) => ({
    getVcpConfiguration: builder.query<VcpConfigurationDto, void>({
      query: () => ({
        url: "vcp/configuration",
      }),
      providesTags: [CacheTags.VetConnectPlus],
    }),
    canConnectToVcp: builder.query<boolean, void>({
      query: () => ({
        url: "vcp/connection/test",
      }),
    }),

    activateVcp: builder.mutation<VcpActivationResult, VcpActivationRequestDto>(
      {
        query: (body) => ({
          url: "vcp/activate",
          method: "POST",
          body,
        }),
        invalidatesTags: [CacheTags.VetConnectPlus],
      }
    ),

    deactivateVcp: builder.mutation<void, void>({
      query: () => ({
        url: "vcp/deactivate",
        method: "POST",
      }),
      invalidatesTags: [CacheTags.VetConnectPlus],
    }),
  }),
});

export const {
  useGetVcpConfigurationQuery,
  useLazyCanConnectToVcpQuery,
  useActivateVcpMutation,
  useDeactivateVcpMutation,
} = VetConnectPlusApi;
