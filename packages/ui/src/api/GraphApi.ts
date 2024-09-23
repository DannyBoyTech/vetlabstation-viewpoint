import { CacheTags, viewpointApi } from "./ApiSlice";
import { GraphDataDto, InstrumentType, SystemDto } from "@viewpoint/api";

export interface GetGraphDataParams {
  patientId: number;
  instrumentType: InstrumentType;
  assayIdentityName: string;
  sampleTypeId?: number;
  fromDate?: string;
  toDate?: string;
}

export const graphApi = viewpointApi.injectEndpoints({
  endpoints: (builder) => ({
    getGraphData: builder.query<GraphDataDto, GetGraphDataParams>({
      query: (params) => ({
        url: "graph/dataPoints",
        params,
      }),
      providesTags: [CacheTags.Results],
    }),
  }),
});

export const { useGetGraphDataQuery } = graphApi;
