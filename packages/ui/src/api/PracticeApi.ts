import { PracticeInfo } from "@viewpoint/api/src/ivls/generated/ivls-api";
import { viewpointApi } from "./ApiSlice";

export const practiceApi = viewpointApi.injectEndpoints({
  endpoints: (builder) => ({
    getPracticeInfo: builder.query<PracticeInfo, void>({
      query: () => `/practice/info`,
    }),
  }),
});

export const { useGetPracticeInfoQuery } = practiceApi;
