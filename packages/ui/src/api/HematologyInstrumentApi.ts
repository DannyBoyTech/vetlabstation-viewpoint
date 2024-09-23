import { CacheTags, viewpointApi } from "./ApiSlice";

export const hematologyInstrumentApi = viewpointApi.injectEndpoints({
  endpoints: (builder) => ({
    getInstrumentReminders: builder.query<string[], number>({
      query: (instrumentId) =>
        `instruments/hematology/${instrumentId}/reminders`,
      providesTags: [CacheTags.Instruments],
    }),
  }),
});

export const { useLazyGetInstrumentRemindersQuery } = hematologyInstrumentApi;
