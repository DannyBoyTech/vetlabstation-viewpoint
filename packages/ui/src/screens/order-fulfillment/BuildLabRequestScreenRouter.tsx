import { pimsApi } from "../../api/PimsApi";
import SpinnerOverlay from "../../components/overlay/SpinnerOverlay";
import { patientApi, useGetPatientQuery } from "../../api/PatientApi";
import { useGetDetailedLabRequestQuery } from "../../api/LabRequestsApi";
import { useSearchParams } from "react-router-dom";
import { BuildLabRequestWithContext } from "./BuildLabRequest";
import { useGetDoctorsQuery } from "../../api/DoctorApi";
import { skipToken } from "@reduxjs/toolkit/query";
import { useTranslation } from "react-i18next";
import { useHeaderTitle } from "../../utils/hooks/hooks";
import { useEffect, useState } from "react";
import { PimsRequestDto } from "@viewpoint/api";

export interface BuildFromCensusProps {
  pimsRequestId: string;
}

function BuildFromCensus(props: BuildFromCensusProps) {
  const [censusRequest, setCensusRequest] = useState<PimsRequestDto>();
  // If populated via census request...
  const { data: censusRequestResponse, isLoading: censusLoading } =
    pimsApi.useGetCensusRequestsQuery(undefined, {
      selectFromResult: (res) => ({
        ...res,
        data: res.data?.find(
          (cr) => cr.pimsRequestUUID === props.pimsRequestId
        ),
      }),
    });

  useEffect(() => {
    // TODO - remove when IVLS provides endpoint for getting PIMS request by ID/UUID
    // The census request may be removed from the pending list and no longer
    // available via the above API query. If it is removed, we should not unset
    // the value here as it will cause the screen to go into spinner mode.
    // Ideally, IVLS will someday provide a way to get the census request by
    // UUID/ID directly even if it's no longer in the pending list, and we can use that instead
    if (censusRequestResponse != null) {
      setCensusRequest(censusRequestResponse);
    }
  }, [censusRequestResponse]);

  const { patient, doctor, requestWeight, loading } =
    useDataForMatchedPendingRequest();

  if (patient == null || censusRequest == null || loading) {
    return <SpinnerOverlay />;
  }

  return (
    <BuildLabRequestWithContext
      patient={patient}
      matchedDoctor={doctor}
      mostRecentWeight={requestWeight ?? patient.lastKnownWeight}
      pendingRequest={censusRequest}
    />
  );
}

export interface BuildFromPendingProps {
  pimsRequestId: string;
}

function BuildFromPending(props: BuildFromPendingProps) {
  const [pendingRequest, setPendingRequest] = useState<PimsRequestDto>();
  const { data: pendingRequestResponse } =
    pimsApi.useGetPendingPimsRequestByUuidQuery(props.pimsRequestId);

  useEffect(() => {
    // TODO - remove when IVLS provides endpoint for getting PIMS request by ID/UUID
    // The pending request may be removed from the pending list and no longer
    // available via the above API query. If it is removed, we should not unset
    // the value here as it will cause the screen to go into spinner mode.
    // Ideally, IVLS will someday provide a way to get the pending request by
    // UUID/ID directly even if it's no longer in the pending list, and we can use that instead
    if (pendingRequestResponse != null) {
      setPendingRequest(pendingRequestResponse);
    }
  }, [pendingRequestResponse]);

  const { patient, doctor, originalLabRequest, requestWeight, loading } =
    useDataForMatchedPendingRequest();

  if (patient == null || pendingRequest == null || loading) {
    return <SpinnerOverlay />;
  }

  return (
    <BuildLabRequestWithContext
      patient={patient}
      matchedDoctor={doctor}
      originalLabRequest={originalLabRequest}
      mostRecentWeight={requestWeight ?? patient.lastKnownWeight}
      pendingRequest={pendingRequest}
    />
  );
}

export interface BuildFromPatientIdProps {
  patientId: number;
}

function BuildFromPatientId(props: BuildFromPatientIdProps) {
  // If populated via analyze sample...
  const { data: foundPatient, isLoading: patientLoading } =
    patientApi.useGetPatientQuery(props.patientId);

  if (patientLoading || !foundPatient) {
    return <SpinnerOverlay />;
  }
  return (
    <BuildLabRequestWithContext
      patient={foundPatient}
      mostRecentWeight={foundPatient.lastKnownWeight}
    />
  );
}

export interface BuildFromPatientNameProps {
  patientName: string;
  clientIdentifier: string;
}

export function BuildFromPatientName(props: BuildFromPatientNameProps) {
  // If populated via add patient...
  const { data: newPatient, isLoading: patientLoading } =
    patientApi.useGetPatientsQuery({
      patientName: props.patientName,
      clientIdentifier: props.clientIdentifier,
    });

  if (patientLoading || !newPatient || newPatient.length === 0) {
    return <SpinnerOverlay />;
  }
  return (
    <BuildLabRequestWithContext
      patient={newPatient[0]}
      mostRecentWeight={newPatient[0].lastKnownWeight}
    />
  );
}

interface BuildForAddTestProps {
  labRequestId: number;
}

export function BuildForAddTest(props: BuildForAddTestProps) {
  const { data: labRequest, isLoading } = useGetDetailedLabRequestQuery({
    labRequestId: props.labRequestId,
  });

  if (props.labRequestId == null || labRequest == null || isLoading) {
    return <SpinnerOverlay />;
  }

  return (
    <BuildLabRequestWithContext
      originalLabRequest={labRequest}
      patient={labRequest.patientDto}
      mostRecentWeight={labRequest.patientDto.lastKnownWeight}
    />
  );
}

export function BuildLabRequestScreenRouter() {
  const [params] = useSearchParams();

  const { t } = useTranslation();
  useHeaderTitle({ label: t("orderFulfillment.title") });

  if (params.has("pimsRequestId")) {
    return <BuildFromPending pimsRequestId={params.get("pimsRequestId")!} />;
  }
  if (params.has("censusPimsRequestId")) {
    return (
      <BuildFromCensus pimsRequestId={params.get("censusPimsRequestId")!} />
    );
  }
  if (params.has("originalLabRequestId")) {
    return (
      <BuildForAddTest
        labRequestId={Number(params.get("originalLabRequestId"))}
      />
    );
  }
  if (params.has("patientId")) {
    return (
      <BuildFromPatientId patientId={parseInt(params.get("patientId")!)} />
    );
  }
  if (params.has("patientName") && params.has("clientIdentifier")) {
    return (
      <BuildFromPatientName
        patientName={params.get("patientName")!}
        clientIdentifier={params.get("clientIdentifier")!}
      />
    );
  }

  return <SpinnerOverlay />;
}

function useDataForMatchedPendingRequest() {
  const [searchParams] = useSearchParams();

  const patientId = searchParams.get("patientId");
  const doctorId = searchParams.get("doctorId");
  const originalLabRequestId = searchParams.get("originalLabRequestId");
  const requestWeight = searchParams.get("weight");

  const { data: patient, isLoading: patientLoading } = useGetPatientQuery(
    patientId == null ? skipToken : Number(patientId)
  );
  const { data: originalLabRequest, isLoading: labRequestLoading } =
    useGetDetailedLabRequestQuery(
      originalLabRequestId == null
        ? skipToken
        : { labRequestId: Number(originalLabRequestId) }
    );
  const { data: doctor, isLoading: doctorLoading } = useGetDoctorsQuery(
    undefined,
    {
      skip: doctorId == null,
      selectFromResult: (res) => ({
        ...res,
        data: res.data?.find((d) => d.id === Number(doctorId)),
      }),
    }
  );

  return {
    patient,
    originalLabRequest,
    doctor,
    requestWeight,
    loading: patientLoading || labRequestLoading || doctorLoading,
  };
}
