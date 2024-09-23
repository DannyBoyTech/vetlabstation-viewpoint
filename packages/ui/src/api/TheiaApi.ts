import { CacheTags, viewpointApi } from "./ApiSlice";
import {
  BarcodeType,
  MaintenanceProcedure,
  TheiaMatchingRunResultDto,
} from "@viewpoint/api";

export const theiaApi = viewpointApi.injectEndpoints({
  endpoints: (builder) => ({
    getMatchingRuns: builder.query<TheiaMatchingRunResultDto[], number>({
      query: (patientId) => {
        return {
          method: "GET",
          url: `theia/patient/${patientId}/matchSuggestions`,
        };
      },
      providesTags: [CacheTags.RunningLabRequests, CacheTags.Results],
    }),
    executeMaintenanceProcedure: builder.mutation<
      void,
      { instrumentId: number; maintenanceProcedure: MaintenanceProcedure }
    >({
      query: ({ instrumentId, maintenanceProcedure }) => {
        return {
          method: "POST",
          url: `theia/${instrumentId}/procedure/execute`,
          params: { instrumentMaintenanceProcedure: maintenanceProcedure },
        };
      },
    }),
    getValidBarcodeTypes: builder.query<BarcodeType[], void>({
      query: () => {
        return {
          method: "GET",
          url: `theia/barcodes/types`,
        };
      },
      providesTags: [CacheTags.FeatureFlags],
    }),
  }),
});

export const {
  useGetMatchingRunsQuery,
  useExecuteMaintenanceProcedureMutation,
  useGetValidBarcodeTypesQuery,
} = theiaApi;
