import {
  ClientDto,
  ClientSaveEditDto,
  GenderDto,
  Id,
  PatientDto,
  PatientSaveEditDto,
  PatientWithRunsDto,
  RefClassDto,
} from "@viewpoint/api";
import { CacheTags, viewpointApi } from "./ApiSlice";

export const ResultsRangeOptionsValues = {
  SEVEN: "7",
  THIRTY: "30",
} as const;
export type ResultsRangeOptionsValues =
  (typeof ResultsRangeOptionsValues)[keyof typeof ResultsRangeOptionsValues];

export interface SearchPatientsParams {
  patientName?: string;
  clientLastName?: string;
  clientIdentifier?: string;
}

export interface GetPatientsWithRunsParams {
  patientName?: string;
  clientLastName?: string;
  clientId?: string;
  daysBack?: ResultsRangeOptionsValues;
}

export interface GetPatientsForSpeciesParams {
  patientName?: string;
  clientLastName?: string;
  clientId?: string;
  speciesId?: number;
}

export interface SearchClientsParams {
  clientFirstName?: string | null;
  clientLastName?: string | null;
  clientIdentifier?: string | null;
}

export const patientApi = viewpointApi.injectEndpoints({
  endpoints: (builder) => ({
    getPatients: builder.query<PatientDto[], SearchPatientsParams>({
      query: (params) => ({ url: "patient", params }),
      providesTags: [CacheTags.Patients],
    }),
    getPatientsWithRuns: builder.query<
      PatientWithRunsDto[],
      SearchPatientsParams
    >({
      query: (params: GetPatientsWithRunsParams) => ({
        url: "patient/history",
        params,
      }),
      providesTags: [CacheTags.Patients, CacheTags.Results],
    }),
    getPatientsForSpecies: builder.query<
      PatientDto[],
      GetPatientsForSpeciesParams
    >({
      query: (params: SearchPatientsParams) => ({
        url: "patient/species",
        params,
      }),
    }),
    getPatient: builder.query<PatientDto | undefined, number>({
      query: (patientId) => ({
        url: `patient/${patientId}`,
      }),
      providesTags: [CacheTags.Patients],
    }),
    getGenders: builder.query<GenderDto[], void>({
      query: () => "patient/genders",
    }),
    getSuggestedLifestage: builder.query<RefClassDto | undefined, number>({
      query: (patientId) => `vp/patient/${patientId}/mostRecentRefClass`,
      providesTags: [CacheTags.Patients],
    }),
    createPatient: builder.mutation<PatientDto, PatientSaveEditDto>({
      query: (args) => ({
        url: "patient",
        method: "POST",
        body: {
          ...args,
          "@class": "com.idexx.labstation.core.dto.input.PatientSaveEditDto",
        },
      }),
      invalidatesTags: [CacheTags.Patients],
    }),
    editPatient: builder.mutation<void, PatientSaveEditDto & Id>({
      query: ({ id, ...body }) => ({
        url: `patient/${id}`,
        method: "PUT",
        body: {
          ...body,
          id,
          "@class": "com.idexx.labstation.core.dto.input.PatientSaveEditDto",
        },
      }),
      invalidatesTags: [CacheTags.Patients],
    }),
    createClient: builder.mutation<ClientDto, ClientSaveEditDto>({
      query: (client) => ({
        url: "client",
        method: "POST",
        body: client,
      }),
      invalidatesTags: [CacheTags.Patients],
    }),
    editClient: builder.mutation<void, ClientSaveEditDto & Id>({
      query: (body) => ({
        url: `client/${body.id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: [CacheTags.Patients],
    }),
    getClients: builder.query<ClientDto[], SearchClientsParams>({
      query: (params: SearchClientsParams) => ({ url: "client", params }),
      providesTags: [CacheTags.Patients],
    }),
  }),
});

export const {
  useGetPatientsQuery,
  useGetPatientsWithRunsQuery,
  useGetPatientsForSpeciesQuery,
  useGetPatientQuery,
  useGetGendersQuery,
  useGetSuggestedLifestageQuery,
  useLazyGetSuggestedLifestageQuery,
  useCreatePatientMutation,
  useCreateClientMutation,
  useGetClientsQuery,
} = patientApi;
