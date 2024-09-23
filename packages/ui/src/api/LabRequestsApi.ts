import { CacheTags, viewpointApi } from "./ApiSlice";
import {
  ExecuteInstrumentRunDto,
  ExecuteLabRequestDto,
  LabRequestDto,
  LabRequestRecordDto,
  RunningLabRequestDto,
  SupportedRunTypeValidationDto,
  UndoMergeRunsDto,
  WorkRequestStatus,
} from "@viewpoint/api";

export const labRequestApi = viewpointApi.injectEndpoints({
  endpoints: (builder) => ({
    getRunningLabRequests: builder.query<RunningLabRequestDto[], void>({
      query: () => `labRequest/running`,
      providesTags: [CacheTags.RunningLabRequests, CacheTags.Patients],
    }),
    getDetailedLabRequest: builder.query<
      LabRequestDto,
      { labRequestId: number; previousRunDepth?: number }
    >({
      query: ({ labRequestId, previousRunDepth }) => ({
        url: `labRequest/${labRequestId}`,
        params: { previousRunDepth },
      }),
      providesTags: [
        CacheTags.RunningLabRequests,
        CacheTags.Patients,
        CacheTags.Results,
        CacheTags.PimsResultTransmission,
        CacheTags.Images,
      ],
    }),
    submitNew: builder.mutation<RunningLabRequestDto, ExecuteLabRequestDto>({
      query: (params) => ({ url: "labRequest", body: params, method: "POST" }),
      invalidatesTags: [
        CacheTags.RunningLabRequests,
        CacheTags.Patients,
        CacheTags.Doctors,
      ],
    }),
    validateAddTestTypesForRunRequest: builder.mutation<
      SupportedRunTypeValidationDto[],
      { labRequestId: number; runs: Partial<ExecuteInstrumentRunDto>[] }
    >({
      query: ({ labRequestId, runs }) => ({
        url: `labRequest/${labRequestId}/addTest/validate`,
        method: "POST",
        body: runs,
      }),
    }),
    addTestAppend: builder.mutation<
      RunningLabRequestDto,
      { labRequestId: number; runs: Partial<ExecuteInstrumentRunDto>[] }
    >({
      query: ({ labRequestId, runs }) => ({
        url: `labRequest/${labRequestId}/append`,
        method: "POST",
        body: runs,
      }),
      invalidatesTags: [CacheTags.RunningLabRequests, CacheTags.Patients],
    }),
    addTestNew: builder.mutation<
      RunningLabRequestDto,
      { labRequestId: number; runs: Partial<ExecuteInstrumentRunDto>[] }
    >({
      query: ({ labRequestId, runs }) => ({
        url: `labRequest/${labRequestId}/copyAndAddTests`,
        method: "POST",
        body: runs,
      }),
      invalidatesTags: [CacheTags.RunningLabRequests, CacheTags.Patients],
    }),
    addTestMerge: builder.mutation<
      RunningLabRequestDto,
      { labRequestId: number; runs: Partial<ExecuteInstrumentRunDto>[] }
    >({
      query: ({ labRequestId, runs }) => ({
        url: `labRequest/${labRequestId}/merge`,
        method: "POST",
        body: runs,
      }),
      invalidatesTags: [CacheTags.RunningLabRequests, CacheTags.Patients],
    }),
    transfer: builder.mutation<
      void,
      { labRequestId: number; patientId: number }
    >({
      query: ({ labRequestId, patientId }) => ({
        url: `labRequest/${labRequestId}/transfer`,
        method: "POST",
        body: patientId,
        headers: {
          "content-type": "application/json",
        },
      }),
      invalidatesTags: [CacheTags.RunningLabRequests, CacheTags.Results],
    }),
    cancelRun: builder.mutation<void, number>({
      query: (instrumentRunId) => ({
        url: `instrumentRun/${instrumentRunId}/cancel`,
        method: "POST",
      }),
    }),
    getRecordsForPatient: builder.query<LabRequestRecordDto[], number>({
      query: (patientId) => ({ url: `patient/${patientId}/labRequestRecords` }),
      providesTags: [CacheTags.RunningLabRequests, CacheTags.Images],
    }),
    getSentToPims: builder.query<boolean, number>({
      query: (labRequestId) => ({
        url: `labRequest/${labRequestId}/sentToPims`,
      }),
      providesTags: [CacheTags.PimsResultTransmission],
    }),
    getWorkRequestStatuses: builder.query<
      Record<number, WorkRequestStatus>,
      number
    >({
      query: (labRequestId) => ({
        url: `labRequest/${labRequestId}/workRequestStatus`,
      }),
      providesTags: [CacheTags.Instruments, CacheTags.RunningLabRequests], // work req status is derived from instrument and run status
    }),
    resendLabRequestToPims: builder.mutation<void, number>({
      query: (labRequestId) => ({
        url: `labRequest/${labRequestId}/resendToPims`,
        method: "POST",
      }),
    }),
    isLabRequestComplete: builder.query<boolean, number>({
      query: (labRequestId) => ({
        url: `labRequest/${labRequestId}/isComplete`,
      }),
      providesTags: [
        CacheTags.Results,
        CacheTags.RunningLabRequests,
        CacheTags.PendingRequests,
        CacheTags.Images,
      ],
    }),
    getUndoMergeRuns: builder.query<UndoMergeRunsDto, number>({
      query: (labRequestId) => ({
        url: `labRequest/${labRequestId}/undoMergeRuns`,
      }),
      providesTags: [
        CacheTags.Results,
        CacheTags.RunningLabRequests,
        CacheTags.Images,
      ],
    }),
    undoMerge: builder.mutation<void, number>({
      query: (labRequestId) => ({
        url: `labRequest/${labRequestId}/undoMerge`,
        method: "POST",
      }),
      invalidatesTags: [CacheTags.Results, CacheTags.RunningLabRequests],
    }),
  }),
});

export const {
  useGetRunningLabRequestsQuery,
  useGetDetailedLabRequestQuery,
  useLazyGetDetailedLabRequestQuery,
  useSubmitNewMutation,
  useCancelRunMutation,
  useGetRecordsForPatientQuery,
  useValidateAddTestTypesForRunRequestMutation,
  useAddTestAppendMutation,
  useAddTestNewMutation,
  useAddTestMergeMutation,
  useTransferMutation,
  useGetSentToPimsQuery,
  useGetWorkRequestStatusesQuery,
  useResendLabRequestToPimsMutation,
  useIsLabRequestCompleteQuery,
  useGetUndoMergeRunsQuery,
  useUndoMergeMutation,
} = labRequestApi;
