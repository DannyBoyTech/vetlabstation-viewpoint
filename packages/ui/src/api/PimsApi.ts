import { CacheTags, viewpointApi } from "./ApiSlice";
import { PendingPimsRequestMatchDto, PimsRequestDto } from "@viewpoint/api";

export const pimsApi = viewpointApi.injectEndpoints({
  endpoints: (builder) => ({
    getPendingRequests: builder.query<PimsRequestDto[], void>({
      query: () => `pims/pending`,
      providesTags: [CacheTags.PendingRequests],
    }),
    getCensusRequests: builder.query<PimsRequestDto[], void>({
      query: () => `pims/census`,
      providesTags: [CacheTags.PendingRequests],
    }),
    getPendingPimsRequest: builder.query<PimsRequestDto | undefined, number>({
      query: () => `pims/pending`,
      transformResponse: (response: PimsRequestDto[], _meta, arg) => {
        const found = response.find((ivlsReq) => ivlsReq.id === arg);
        return found ?? undefined;
      },
      providesTags: [CacheTags.PendingRequests],
    }),
    getPendingPimsRequestByUuid: builder.query<
      PimsRequestDto | undefined,
      string
    >({
      query: () => `pims/pending`,
      transformResponse: (response: PimsRequestDto[], _meta, arg) => {
        const found = response.find((req) => req.pimsRequestUUID === arg);
        return found ?? undefined;
      },
      providesTags: [CacheTags.PendingRequests],
    }),
    getPatientMatch: builder.query<
      PendingPimsRequestMatchDto,
      { pimsRequestId: number; patientId: number; clientId: number }
    >({
      query: ({ pimsRequestId, ...args }) => ({
        url: `pims/pending/${pimsRequestId}/matchRecords`,
        method: "POST",
        params: args,
      }),
      providesTags: [CacheTags.Patients],
    }),
    resolveMatchesForPimsRequest: builder.mutation<
      PendingPimsRequestMatchDto,
      number
    >({
      query: (pimsRequestId) => ({
        url: `pims/pending/${pimsRequestId}/match`,
        method: "POST",
      }),
      invalidatesTags: [
        CacheTags.Patients,
        CacheTags.Doctors,
        CacheTags.PendingRequests,
      ],
    }),
    createNewPatientForPimsRequest: builder.mutation<
      PendingPimsRequestMatchDto,
      number
    >({
      query: (pimsRequestId) => ({
        url: `pims/pending/${pimsRequestId}/createRecords`,
        method: "POST",
      }),
      invalidatesTags: [
        CacheTags.Patients,
        CacheTags.Doctors,
        CacheTags.PendingRequests,
      ],
    }),
    matchPimsRequestRecords: builder.mutation<
      PendingPimsRequestMatchDto,
      { pimsRequestId: number; patientId: number; clientId: number }
    >({
      query: ({ pimsRequestId, patientId, clientId }) => ({
        url: `pims/pending/${pimsRequestId}/matchRecords`,
        params: { patientId, clientId },
        method: "POST",
      }),
      invalidatesTags: [
        CacheTags.Patients,
        CacheTags.Doctors,
        CacheTags.PendingRequests,
      ],
    }),
    deletePimsRequest: builder.mutation<PimsRequestDto, number>({
      query: (pimsRequestId) => ({
        url: `pims/pending/${pimsRequestId}`,
        method: "delete",
      }),
      invalidatesTags: [CacheTags.PendingRequests],
    }),
    markPimsRequestProcessed: builder.mutation<PimsRequestDto, number>({
      query: (pimsRequestId) => ({
        url: `pims/pending/${pimsRequestId}`,
        method: "post",
      }),
      invalidatesTags: [CacheTags.PendingRequests],
    }),
    getPimsEverConnected: builder.query<boolean, void>({
      query: () => `pims/everHadPimsConnected`,
      providesTags: [CacheTags.Instruments],
    }),
    getPimsUnsentRunCount: builder.query<any, void>({
      query: () => `pims/unsentRunCount`,
      providesTags: [CacheTags.PimsResultTransmission, CacheTags.Results],
    }),
  }),
});

export const {
  useGetPendingRequestsQuery,
  useGetCensusRequestsQuery,
  useGetPimsEverConnectedQuery,
  useGetPimsUnsentRunCountQuery,
  useMarkPimsRequestProcessedMutation,
  useResolveMatchesForPimsRequestMutation,
} = pimsApi;
