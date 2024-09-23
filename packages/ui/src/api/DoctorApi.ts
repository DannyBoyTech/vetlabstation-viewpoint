import { DoctorDto } from "@viewpoint/api";
import { viewpointApi, CacheTags } from "./ApiSlice";

export const doctorApi = viewpointApi.injectEndpoints({
  endpoints: (builder) => ({
    getDoctors: builder.query<DoctorDto[], void>({
      query: () => "doctor",
      providesTags: [CacheTags.Doctors],
    }),
    addDoctor: builder.mutation<void, { firstName: string; lastName: string }>({
      query: ({ ...body }) => ({
        url: "doctor",
        method: "POST",
        body,
      }),
      invalidatesTags: [CacheTags.Doctors],
    }),
    editDoctor: builder.mutation<
      void,
      { doctorId: string; firstName: string; lastName: string }
    >({
      query: ({ doctorId, ...body }) => ({
        url: `doctor/${doctorId}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: [CacheTags.Doctors],
    }),
    deleteDoctor: builder.mutation<void, { doctorId: number }>({
      query: ({ doctorId }) => ({
        url: `doctor/${doctorId}`,
        method: "DELETE",
      }),
      invalidatesTags: [CacheTags.Doctors],
    }),
  }),
});

export const {
  useGetDoctorsQuery,
  useAddDoctorMutation,
  useEditDoctorMutation,
  useDeleteDoctorMutation,
} = doctorApi;
