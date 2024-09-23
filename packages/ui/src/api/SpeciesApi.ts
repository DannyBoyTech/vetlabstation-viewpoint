import {
  AvailableSampleTypes,
  BreedDto,
  CalculateLifestageParams,
  ManualUAAssays,
  RefClassDto,
  SpeciesDto,
} from "@viewpoint/api";
import { CacheTags, viewpointApi } from "./ApiSlice";

const speciesApi = viewpointApi.injectEndpoints({
  endpoints: (builder) => ({
    getSpecies: builder.query<SpeciesDto[], void>({
      query: () => "species",
      providesTags: [CacheTags.Species],
    }),
    getReferenceClassifications: builder.query<RefClassDto[], number>({
      query: (speciesId) => `species/${speciesId}/referenceClassifications`,
      providesTags: [CacheTags.Species],
    }),
    calculateLifestage: builder.query<RefClassDto, CalculateLifestageParams>({
      query: ({ speciesId, ...args }) =>
        `species/${speciesId}/lifestage?${new URLSearchParams(
          args
        ).toString()}`,
      providesTags: [CacheTags.Species],
    }),
    getBreeds: builder.query<BreedDto[], number>({
      query: (speciesId) => `species/${speciesId}/breeds`,
      providesTags: [CacheTags.Species],
    }),
    getSampleTypes: builder.query<AvailableSampleTypes, number>({
      query: (speciesId) => `species/${speciesId}/sampleTypes`,
      providesTags: [CacheTags.Species],
    }),
    getManualAssays: builder.query<ManualUAAssays[], number>({
      query: (speciesId) => `manualAssays/${speciesId}`,
    }),
  }),
});

export const {
  useGetSpeciesQuery,
  useGetReferenceClassificationsQuery,
  useLazyGetReferenceClassificationsQuery,
  useCalculateLifestageQuery,
  useGetBreedsQuery,
  useGetSampleTypesQuery,
  useGetManualAssaysQuery,
} = speciesApi;
