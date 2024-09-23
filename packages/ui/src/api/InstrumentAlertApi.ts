import { CacheTags, viewpointApi } from "./ApiSlice";
import { AlertActionDto, InstrumentAlertDto } from "@viewpoint/api";

export const instrumentAlertApi = viewpointApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllInstrumentAlerts: builder.query<InstrumentAlertDto[], void>({
      query: () => "instruments/alerts",
      providesTags: [CacheTags.Instruments],
    }),
    performAlertAction: builder.mutation<
      void,
      { instrumentId: number; actionDto: AlertActionDto }
    >({
      query: ({ instrumentId, actionDto }) => ({
        url: `/instruments/${instrumentId}/alertAction`,
        method: "POST",
        body: {
          "@class": "com.idexx.labstation.core.dto.InstrumentAlertActionDto",
          ...actionDto,
        },
      }),
      invalidatesTags: [CacheTags.Instruments],
    }),
  }),
});

export const { useGetAllInstrumentAlertsQuery, usePerformAlertActionMutation } =
  instrumentAlertApi;
