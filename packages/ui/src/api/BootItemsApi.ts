import { viewpointApi } from "./ApiSlice";
import { BootItemsDto } from "@viewpoint/api";

export const bootItemApi = viewpointApi.injectEndpoints({
  endpoints: (builder) => ({
    getBootItems: builder.query<BootItemsDto, void>({
      query: () => "/boot/getBootItems",
    }),
  }),
});

export const { useGetBootItemsQuery, useLazyGetBootItemsQuery } = bootItemApi;
