import { CacheTags, viewpointApi } from "./ApiSlice";
import {
  TenseiQcBarcodeSaveRequestDto,
  TenseiQcBarcodeValidateRequestDto,
  TenseiQcBarcodeValidateResponseDto,
} from "@viewpoint/api";

export const QC_BARCODE_LENGTH = 26;

export const tenseiApi = viewpointApi.injectEndpoints({
  endpoints: (builder) => ({
    requestDrainRbcIsolationChamber: builder.mutation<void, number>({
      query: (instrumentId) => {
        return {
          method: "POST",
          url: `tensei/${instrumentId}/maintenance/drainRbcIsolationChamber/request`,
        };
      },
      invalidatesTags: [CacheTags.Instruments],
    }),
    requestDrainReactionChamber: builder.mutation<void, number>({
      query: (instrumentId) => {
        return {
          method: "POST",
          url: `tensei/${instrumentId}/maintenance/drainReactionChamber/request`,
        };
      },
      invalidatesTags: [CacheTags.Instruments],
    }),
    requestDrainWasteChamber: builder.mutation<void, number>({
      query: (instrumentId) => {
        return {
          method: "POST",
          url: `tensei/${instrumentId}/maintenance/drainWasteChamber/request`,
        };
      },
      invalidatesTags: [CacheTags.Instruments],
    }),

    validateTenseiQcBarcodes: builder.mutation<
      TenseiQcBarcodeValidateResponseDto,
      TenseiQcBarcodeValidateRequestDto
    >({
      query: (body) => ({
        url: "tensei/qc/barcodes/validate",
        method: "PUT",
        body,
      }),
    }),
    saveTenseiQcBarcodes: builder.mutation<void, TenseiQcBarcodeSaveRequestDto>(
      {
        query: (body) => ({
          url: "tensei/qc/barcodes/save",
          method: "POST",
          body,
        }),
        invalidatesTags: [CacheTags.QualityControl],
      }
    ),

    requestAutoRinse: builder.mutation<void, number>({
      query: (instrumentId) => {
        return {
          method: "POST",
          url: `tensei/${instrumentId}/maintenance/autoRinse/request`,
        };
      },
      invalidatesTags: [CacheTags.Instruments],
    }),
    requestMonthlyRinse: builder.mutation<void, number>({
      query: (instrumentId) => {
        return {
          method: "POST",
          url: `tensei/${instrumentId}/maintenance/monthlyRinse/request`,
        };
      },
      invalidatesTags: [CacheTags.Instruments],
    }),
    cancelMonthlyRinse: builder.mutation<void, number>({
      query: (instrumentId) => {
        return {
          method: "POST",
          url: `tensei/${instrumentId}/maintenance/monthlyRinse/cancel`,
        };
      },
      invalidatesTags: [CacheTags.Instruments],
    }),
    requestFlowCellRinse: builder.mutation<void, number>({
      query: (instrumentId) => {
        return {
          method: "POST",
          url: `tensei/${instrumentId}/maintenance/flowCellRinse/request`,
        };
      },
      invalidatesTags: [CacheTags.Instruments],
    }),
    cancelFlowCellRinse: builder.mutation<void, number>({
      query: (instrumentId) => {
        return {
          method: "POST",
          url: `tensei/${instrumentId}/maintenance/flowCellRinse/cancel`,
        };
      },
      invalidatesTags: [CacheTags.Instruments],
    }),
    requestWasteChamberRinse: builder.mutation<void, number>({
      query: (instrumentId) => {
        return {
          method: "POST",
          url: `tensei/${instrumentId}/maintenance/wasteChamberRinse/request`,
        };
      },
      invalidatesTags: [CacheTags.Instruments],
    }),
    cancelWasteChamberRinse: builder.mutation<void, number>({
      query: (instrumentId) => {
        return {
          method: "POST",
          url: `tensei/${instrumentId}/maintenance/wasteChamberRinse/cancel`,
        };
      },
      invalidatesTags: [CacheTags.Instruments],
    }),
    requestClearPinchValve: builder.mutation<void, number>({
      query: (instrumentId) => {
        return {
          method: "POST",
          url: `tensei/${instrumentId}/maintenance/clearPinchValve/request`,
        };
      },
      invalidatesTags: [CacheTags.Instruments],
    }),
    requestRemoveClog: builder.mutation<void, number>({
      query: (instrumentId) => {
        return {
          method: "POST",
          url: `tensei/${instrumentId}/maintenance/removeClog/request`,
        };
      },
      invalidatesTags: [CacheTags.Instruments],
    }),

    requestResetAirPump: builder.mutation<void, number>({
      query: (instrumentId) => {
        return {
          method: "POST",
          url: `tensei/${instrumentId}/maintenance/resetAirPump/request`,
        };
      },
      invalidatesTags: [CacheTags.Instruments],
    }),
    requestResetAspirationMotor: builder.mutation<void, number>({
      query: (instrumentId) => {
        return {
          method: "POST",
          url: `tensei/${instrumentId}/maintenance/resetAspirationMotor/request`,
        };
      },
      invalidatesTags: [CacheTags.Instruments],
    }),
    requestResetSheathMotor: builder.mutation<void, number>({
      query: (instrumentId) => {
        return {
          method: "POST",
          url: `tensei/${instrumentId}/maintenance/resetSheathMotor/request`,
        };
      },
      invalidatesTags: [CacheTags.Instruments],
    }),
    requestResetTubeMotor: builder.mutation<void, number>({
      query: (instrumentId) => {
        return {
          method: "POST",
          url: `tensei/${instrumentId}/maintenance/resetTubeMotor/request`,
        };
      },
      invalidatesTags: [CacheTags.Instruments],
    }),
    requestResetWBMotor: builder.mutation<void, number>({
      query: (instrumentId) => {
        return {
          method: "POST",
          url: `tensei/${instrumentId}/maintenance/resetWBMotor/request`,
        };
      },
      invalidatesTags: [CacheTags.Instruments],
    }),

    requestReplenishHGBReagent: builder.mutation<void, number>({
      query: (instrumentId) => {
        return {
          method: "POST",
          url: `tensei/${instrumentId}/maintenance/replenishHGBReagent/request`,
        };
      },
      invalidatesTags: [CacheTags.Instruments],
    }),
    requestReplenishLyticReagent: builder.mutation<void, number>({
      query: (instrumentId) => {
        return {
          method: "POST",
          url: `tensei/${instrumentId}/maintenance/replenishLyticReagent/request`,
        };
      },
      invalidatesTags: [CacheTags.Instruments],
    }),
    requestReplenishReticulocyteDiluent: builder.mutation<void, number>({
      query: (instrumentId) => {
        return {
          method: "POST",
          url: `tensei/${instrumentId}/maintenance/replenishReticulocyteDiluent/request`,
        };
      },
      invalidatesTags: [CacheTags.Instruments],
    }),
    requestReplenishStain: builder.mutation<void, number>({
      query: (instrumentId) => {
        return {
          method: "POST",
          url: `tensei/${instrumentId}/maintenance/replenishStain/request`,
        };
      },
      invalidatesTags: [CacheTags.Instruments],
    }),
    requestReplenishSystemDiluent: builder.mutation<void, number>({
      query: (instrumentId) => {
        return {
          method: "POST",
          url: `tensei/${instrumentId}/maintenance/replenishSystemDiluent/request`,
        };
      },
      invalidatesTags: [CacheTags.Instruments],
    }),
  }),
});

export const {
  useRequestDrainRbcIsolationChamberMutation,
  useRequestDrainReactionChamberMutation,
  useRequestDrainWasteChamberMutation,
  useValidateTenseiQcBarcodesMutation,
  useSaveTenseiQcBarcodesMutation,
  useRequestAutoRinseMutation,
  useRequestMonthlyRinseMutation,
  useCancelMonthlyRinseMutation,
  useRequestFlowCellRinseMutation,
  useCancelFlowCellRinseMutation,
  useRequestWasteChamberRinseMutation,
  useCancelWasteChamberRinseMutation,
  useRequestClearPinchValveMutation,
  useRequestRemoveClogMutation,
  useRequestResetAirPumpMutation,
  useRequestResetAspirationMotorMutation,
  useRequestResetSheathMotorMutation,
  useRequestResetTubeMotorMutation,
  useRequestResetWBMotorMutation,
  useRequestReplenishStainMutation,
  useRequestReplenishLyticReagentMutation,
  useRequestReplenishReticulocyteDiluentMutation,
  useRequestReplenishHGBReagentMutation,
  useRequestReplenishSystemDiluentMutation,
} = tenseiApi;
