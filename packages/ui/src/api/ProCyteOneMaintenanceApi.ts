import { viewpointApi } from "./ApiSlice";

export const proCyteOneMaintenanceApi = viewpointApi.injectEndpoints({
  endpoints: (builder) => ({
    cancelBleachClean: builder.mutation<void, number>({
      query: (instrumentId) => {
        return {
          method: "POST",
          url: `instruments/acadiadx/${instrumentId}/maintenance/bleachClean/cancel`,
        };
      },
    }),
    requestBleachClean: builder.mutation<void, number>({
      query: (instrumentId) => {
        return {
          method: "POST",
          url: `instruments/acadiadx/${instrumentId}/maintenance/bleachClean/request`,
        };
      },
    }),
    requestDrainMixChamber: builder.mutation<void, number>({
      query: (instrumentId) => {
        return {
          method: "POST",
          url: `instruments/acadiadx/${instrumentId}/maintenance/drainMixChamber/request`,
        };
      },
    }),
    requestFlowCellSoak: builder.mutation<void, number>({
      query: (instrumentId) => {
        return {
          method: "POST",
          url: `instruments/acadiadx/${instrumentId}/maintenance/flowCellSoak/request`,
        };
      },
    }),
    requestFluidPackStatus: builder.mutation<void, number>({
      query: (instrumentId) => {
        return {
          method: "POST",
          url: `acadia/${instrumentId}/fluidPacks`,
        };
      },
    }),
    requestFullSystemPrime: builder.mutation<void, number>({
      query: (instrumentId) => {
        return {
          method: "POST",
          url: `instruments/acadiadx/${instrumentId}/maintenance/fullSystemPrime/request`,
        };
      },
    }),
    requestPowerDown: builder.mutation<void, number>({
      query: (instrumentId) => {
        return {
          method: "POST",
          url: `instruments/acadiadx/${instrumentId}/maintenance/shutdown/request`,
          params: {
            type: "POWER_OFF",
          },
        };
      },
    }),
    requestPrimeReagent: builder.mutation<void, number>({
      query: (instrumentId) => {
        return {
          method: "POST",
          url: `instruments/acadiadx/${instrumentId}/maintenance/primeReagent/request`,
        };
      },
    }),
    requestPrimeSheath: builder.mutation<void, number>({
      query: (instrumentId) => {
        return {
          method: "POST",
          url: `instruments/acadiadx/${instrumentId}/maintenance/primeSheath/request`,
        };
      },
    }),
    requestShutDownForShipping: builder.mutation<void, number>({
      query: (instrumentId) => {
        return {
          method: "POST",
          url: `instruments/acadiadx/${instrumentId}/maintenance/shutdown/request`,
          params: {
            type: "SHIPPING",
          },
        };
      },
    }),
    requestSystemFlush: builder.mutation<void, number>({
      query: (instrumentId) => {
        return {
          method: "POST",
          url: `instruments/acadiadx/${instrumentId}/maintenance/systemFlush/request`,
        };
      },
    }),
  }),
});

export const {
  useCancelBleachCleanMutation,
  useRequestBleachCleanMutation,
  useRequestDrainMixChamberMutation,
  useRequestFlowCellSoakMutation,
  useRequestFluidPackStatusMutation,
  useRequestFullSystemPrimeMutation,
  useRequestPowerDownMutation,
  useRequestPrimeReagentMutation,
  useRequestPrimeSheathMutation,
  useRequestShutDownForShippingMutation,
  useRequestSystemFlushMutation,
} = proCyteOneMaintenanceApi;
