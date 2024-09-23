import styled from "styled-components";
import { Button } from "@viewpoint/spot-react";
import { PatientSearch } from "../components/patient-search/PatientSearch";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  GetPatientsWithRunsParams,
  patientApi,
  ResultsRangeOptionsValues,
} from "../api/PatientApi";
import { PatientDto } from "@viewpoint/api";
import { labRequestApi } from "../api/LabRequestsApi";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import { skipToken } from "@reduxjs/toolkit/query";
import { sortRecords } from "../utils/patient-utils";
import { useDebounce, useHeaderTitle, useUrlSync } from "../utils/hooks/hooks";
import {
  ButtonsColumn,
  Divider,
  StyledButton,
} from "../components/patient-search/common-search-page-components";
import { AddPatientSearchPlaceholder } from "../components/patient-search/AddPatientSearchPlaceholder";

const PatientSearchRoot = styled.div`
  margin: 50px 100px;
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow-y: hidden;

  @media screen and (max-width: 1024px) {
    margin: 0 25px;
  }
`;

const TopRow = styled.div`
  display: flex;
  overflow-y: hidden;
  flex: 1;
`;

const statIdForInstant = (instant: Date): string =>
  `ST${dayjs(instant).format("MMDDYYHHmm")}`;
const statIdForNow = () => statIdForInstant(new Date());
const statPatientParams = (idFn: () => string) => ({
  patientName: idFn(),
  clientIdentifier: idFn(),
});

const getSearchCriteriaFromParams = (
  search: string
): GetPatientsWithRunsParams => {
  const params = new URLSearchParams(search);
  const criteria: GetPatientsWithRunsParams = {
    patientName: params.get("patientName") || "",
    clientId: params.get("clientId") || "",
    clientLastName: params.get("clientLastName") || "",
  };
  if (!hasSearchCriteria(criteria)) {
    criteria.daysBack = params.has("daysBack")
      ? (params.get("daysBack") as ResultsRangeOptionsValues)
      : ResultsRangeOptionsValues.SEVEN;
  }
  return criteria;
};

function hasSearchCriteria(criteria: GetPatientsWithRunsParams): boolean {
  return (
    (criteria.patientName?.length ?? 0) > 0 ||
    (criteria.clientLastName?.length ?? 0) > 0 ||
    (criteria.clientId?.length ?? 0) > 0
  );
}

export function PatientSearchScreen() {
  const { t } = useTranslation();
  useHeaderTitle({ label: t("searchPatient.recordsSearch") });
  const { search } = useLocation();
  const nav = useNavigate();

  const [searchCriteria, setSearchCriteria] =
    useState<GetPatientsWithRunsParams>(getSearchCriteriaFromParams(search));
  const [selectedPatient, setSelectedPatient] = useState<PatientDto>();
  // Track the results range value separately -- it gets zeroed out in the search criteria when patient/client info
  // is entered, but we want to be able to restore the user's selection/default value when the patient/client search
  // criteria is cleared out.
  const [prevSelectedResultsRange, setPrevSelectedResultsRange] =
    useState<ResultsRangeOptionsValues>(ResultsRangeOptionsValues.SEVEN);

  const {
    data: records,
    isFetching: getRecordsFetching,
    isUninitialized: getRecordsUninitialized,
  } = labRequestApi.useGetRecordsForPatientQuery(
    selectedPatient?.id ?? skipToken,
    {
      selectFromResult: (result) => ({
        ...result,
        data: sortRecords(result.data),
      }),
    }
  );

  const debouncedSearchCriteria = useDebounce(searchCriteria, 300);

  // Intentionally checking for empty string values
  const hasPatientSearchCriteria = hasSearchCriteria(debouncedSearchCriteria);

  const skipQuery =
    !hasPatientSearchCriteria &&
    (debouncedSearchCriteria.daysBack?.length ?? 0) === 0;

  const {
    currentData: { patientResults },
    isFetching: getPatientsFetching,
    isUninitialized: getPatientsUninitialized,
  } = patientApi.useGetPatientsWithRunsQuery(debouncedSearchCriteria, {
    skip: skipQuery,
    selectFromResult: (res) => ({
      ...res,
      currentData: {
        patientResults: res.currentData?.map((res) => ({
          ...res.patientDto,
          lastRunDate: res.runDate,
        })),
      },
    }),
  });
  // Update the URL's search params -- if the user navigates back to this page, the search string in the location will
  // allow it to remember what was entered in the search boxes
  useUrlSync(searchCriteria);

  const handleEdit = () => {
    nav(`/patients/${selectedPatient?.id}`);
  };

  const handleAddNew = () => {
    nav(
      `/addPatient?${new URLSearchParams({
        patientName: searchCriteria.patientName ?? "",
        clientLastName: searchCriteria.clientLastName ?? "",
        clientIdentifier: searchCriteria.clientId ?? "",
      }).toString()}`
    );
  };

  const handleStat = () => {
    nav(
      `/addPatient?${new URLSearchParams({
        ...statPatientParams(statIdForNow),
      }).toString()}`
    );
  };

  const handleViewResults = () => {
    if (selectedPatient && records) {
      nav({
        pathname: "/labRequest/" + records[0].labRequestId,
      });
    }
  };

  const handleBack = () => nav(-1);

  return (
    <PatientSearchRoot>
      <TopRow>
        <PatientSearch
          includeTimeFrameFilter
          results={patientResults ?? []}
          rangeDisabled={hasPatientSearchCriteria}
          onPatientNameChange={(name) => {
            const updated: GetPatientsWithRunsParams = {
              ...searchCriteria,
              patientName: name,
            };
            updated.daysBack = hasSearchCriteria(updated)
              ? undefined
              : prevSelectedResultsRange;
            setSearchCriteria(updated);
          }}
          onClientLastNameChange={(name) => {
            const updated: GetPatientsWithRunsParams = {
              ...searchCriteria,
              clientLastName: name,
            };
            updated.daysBack = hasSearchCriteria(updated)
              ? undefined
              : prevSelectedResultsRange;
            setSearchCriteria(updated);
          }}
          onClientIdChange={(id) => {
            const updated: GetPatientsWithRunsParams = {
              ...searchCriteria,
              clientId: id,
            };
            updated.daysBack = hasSearchCriteria(updated)
              ? undefined
              : prevSelectedResultsRange;
            setSearchCriteria(updated);
          }}
          onSelectedResultsRangeChange={(selectedResultsRange) => {
            setSearchCriteria((criteria: GetPatientsWithRunsParams) => ({
              ...criteria,
              daysBack: selectedResultsRange,
            }));
            if (
              selectedResultsRange != null &&
              selectedResultsRange.length > 0
            ) {
              setPrevSelectedResultsRange(selectedResultsRange);
            }
          }}
          onPatientSelected={(selected) => setSelectedPatient(selected)}
          selectedPatientId={selectedPatient?.id}
          patientName={searchCriteria.patientName}
          clientId={searchCriteria.clientId}
          clientLastName={searchCriteria.clientLastName}
          selectedResultsRange={searchCriteria.daysBack}
          showPlaceholder={
            getPatientsFetching ||
            (getPatientsUninitialized && getRecordsUninitialized) ||
            patientResults?.length === 0
          }
          placeholderContent={
            <AddPatientSearchPlaceholder
              onAddNewPatient={handleAddNew}
              loading={getPatientsFetching || getRecordsFetching}
              uninitialized={
                getPatientsUninitialized && getRecordsUninitialized
              }
            />
          }
        />
        <ButtonsColumn>
          <StyledButton
            data-testid="next-button"
            buttonSize="large"
            onClick={handleViewResults}
            disabled={!selectedPatient}
          >
            {t("searchPatient.view")}
          </StyledButton>
          <StyledButton
            data-testid="back-button"
            buttonSize="large"
            buttonType="secondary"
            onClick={handleBack}
          >
            {t("searchPatient.back")}
          </StyledButton>

          <Divider />

          <StyledButton
            data-testid="add-new-button"
            buttonType="secondary"
            buttonSize="large"
            onClick={handleAddNew}
          >
            {t("searchPatient.addNew")}
          </StyledButton>

          <StyledButton
            data-testid="stat-button"
            buttonType="secondary"
            buttonSize="large"
            onClick={handleStat}
          >
            {t("searchPatient.stat")}
          </StyledButton>

          <StyledButton
            data-testid="edit-button"
            buttonType="secondary"
            buttonSize="large"
            onClick={handleEdit}
            disabled={!selectedPatient}
          >
            {t("searchPatient.edit")}
          </StyledButton>
        </ButtonsColumn>
      </TopRow>
    </PatientSearchRoot>
  );
}
