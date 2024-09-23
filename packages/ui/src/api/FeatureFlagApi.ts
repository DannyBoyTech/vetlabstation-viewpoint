import { CacheTags, viewpointApi } from "./ApiSlice";
import { FeatureFlagName } from "@viewpoint/api";

export const featureFlagApi = viewpointApi.injectEndpoints({
  endpoints: (builder) => ({
    featureFlag: builder.query<boolean, FeatureFlagName>({
      query: (featureFlagName) => `featureFlag/${featureFlagName}`,
      providesTags: [CacheTags.FeatureFlags],
    }),
  }),
});

export const { useFeatureFlagQuery } = featureFlagApi;
