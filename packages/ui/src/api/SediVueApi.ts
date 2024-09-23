import { CacheTags, viewpointApi } from "./ApiSlice";
import {
  MaintenanceProcedure,
  QualityControlBarcodesDto,
  QualityControlBarcodeSetDto,
} from "@viewpoint/api";

export const sediVueApi = viewpointApi.injectEndpoints({
  endpoints: (builder) => ({
    updateSediVueComment: builder.mutation<
      void,
      { instrumentRunId: number; comment?: string }
    >({
      query: ({ instrumentRunId, comment }) => {
        return {
          method: "POST",
          url: `sediVue/instrumentRun/${instrumentRunId}/comment`,
          params: { comment },
        };
      },
      invalidatesTags: [CacheTags.Results],
    }),

    saveSediVueQcLot: builder.mutation<void, QualityControlBarcodesDto>({
      query: (barcodes) => ({
        method: "POST",
        url: "/sediVue/lots",
        body: barcodes,
      }),
      invalidatesTags: [CacheTags.QualityControl],
    }),

    validateSediVueQcLot: builder.mutation<
      QualityControlBarcodeSetDto,
      QualityControlBarcodesDto
    >({
      query: (barcodes) => ({
        method: "POST",
        url: "/sediVue/barcodes/validate",
        body: barcodes,
      }),
    }),

    requestSediVueCuvetteStatus: builder.mutation<
      void,
      { instrumentId: number }
    >({
      query: ({ instrumentId }) => ({
        url: `sediVue/${instrumentId}/cuvettes/async`,
        method: "POST",
      }),
    }),

    requestSediVueProcedure: builder.mutation<
      void,
      {
        instrumentId: number;
        procedure: MaintenanceProcedure;
      }
    >({
      query: ({ instrumentId, procedure }) => ({
        url: `sediVue/${instrumentId}/procedure/execute`,
        method: "POST",
        params: { instrumentMaintenanceProcedure: procedure },
      }),
      invalidatesTags: [CacheTags.Instruments],
    }),
  }),
});

export const {
  useUpdateSediVueCommentMutation,
  useSaveSediVueQcLotMutation,
  useValidateSediVueQcLotMutation,
  useRequestSediVueProcedureMutation,
  useRequestSediVueCuvetteStatusMutation,
} = sediVueApi;
