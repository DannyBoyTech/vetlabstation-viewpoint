import { CacheTags, viewpointApi } from "./ApiSlice";

export const instrumentUpgradeApi = viewpointApi.injectEndpoints({
  endpoints: (builder) => ({
    upgradeNow: builder.mutation<
      void,
      { instrumentId: number; version: string }
    >({
      query: ({ instrumentId, version }) => ({
        method: "POST",
        url: `instruments/${instrumentId}/upgrade`,
        params: { version },
      }),
      invalidatesTags: [CacheTags.Instruments, CacheTags.InstrumentConfig],
    }),
  }),
});

export const { useUpgradeNowMutation } = instrumentUpgradeApi;
