import styled from "styled-components";
import { Button } from "@viewpoint/spot-react";
import { PatientSearch } from "../components/patient-search/PatientSearch";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { patientApi, SearchPatientsParams } from "../api/PatientApi";
import { PatientDto } from "@viewpoint/api";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import { useDebounce, useHeaderTitle, useUrlSync } from "../utils/hooks/hooks";
import { skipToken } from "@reduxjs/toolkit/query";
import { AddPatientSearchPlaceholder } from "../components/patient-search/AddPatientSearchPlaceholder";
import {
  ButtonsColumn,
  Divider,
  StyledButton,
} from "../components/patient-search/common-search-page-components";
import { FullSizeSpinner } from "../components/spinner/FullSizeSpinner";

const AnalyzeSampleRoot = styled.div`
  margin: 50px 100px;
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow-y: hidden;

  @media screen and (max-width: 1024px) {
    margin: 0px 25px;
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

const getSearchCriteriaFromParams = (search: string) => {
  const params = new URLSearchParams(search);
  return {
    patientName: params.get("patientName") ?? undefined,
    clientIdentifier: params.get("clientIdentifier") ?? undefined,
    clientLastName: params.get("clientLastName") ?? undefined,
  };
};

export function AnalyzeSample() {
  const { t } = useTranslation();
  useHeaderTitle({
    label: t("searchPatient.header"),
  });
  const { search } = useLocation();
  const nav = useNavigate();

  const [searchCriteria, setSearchCriteria] = useState<SearchPatientsParams>(
    getSearchCriteriaFromParams(search)
  );
  const [selectedPatient, setSelectedPatient] = useState<PatientDto>();

  const debouncedSearchCriteria = useDebounce(searchCriteria, 300);

  const skip =
    Object.keys(debouncedSearchCriteria).length === 0 ||
    Object.values(debouncedSearchCriteria).every((v) => !v || v.length === 0);

  const {
    currentData: searchResults,
    isFetching,
    isUninitialized,
  } = patientApi.useGetPatientsQuery(
    skip ? skipToken : debouncedSearchCriteria
  );

  useUrlSync(searchCriteria);

  const handleEdit = () => {
    nav(`/patients/${selectedPatient?.id}`);
  };

  const handleAddNew = () => {
    nav(
      `/addPatient?${new URLSearchParams({
        patientName: searchCriteria.patientName ?? "",
        clientLastName: searchCriteria.clientLastName ?? "",
        clientIdentifier: searchCriteria.clientIdentifier ?? "",
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

  const handleNext = () => {
    if (selectedPatient) {
      const params = {
        patientId: selectedPatient.id,
      };
      nav({
        pathname: "/labRequest/build",
        search: new URLSearchParams(params as Record<string, any>).toString(),
      });
    }
  };

  const handleBack = () => nav(-1);

  return (
    <AnalyzeSampleRoot>
      <TopRow>
        <PatientSearch
          results={searchResults || []}
          onPatientNameChange={(name) =>
            setSearchCriteria((criteria: SearchPatientsParams) => ({
              ...criteria,
              patientName: name,
            }))
          }
          onClientLastNameChange={(name) =>
            setSearchCriteria((criteria: SearchPatientsParams) => ({
              ...criteria,
              clientLastName: name,
            }))
          }
          onClientIdChange={(id) =>
            setSearchCriteria((criteria: SearchPatientsParams) => ({
              ...criteria,
              clientIdentifier: id,
            }))
          }
          onPatientSelected={(selected) => setSelectedPatient(selected)}
          selectedPatientId={selectedPatient?.id}
          patientName={searchCriteria.patientName}
          clientId={searchCriteria.clientIdentifier}
          clientLastName={searchCriteria.clientLastName}
          showPlaceholder={
            isFetching || isUninitialized || searchResults?.length === 0
          }
          placeholderContent={
            <AddPatientSearchPlaceholder
              onAddNewPatient={handleAddNew}
              loading={isFetching}
              uninitialized={isUninitialized}
            />
          }
        />
        <ButtonsColumn>
          <StyledButton
            data-testid="next-button"
            buttonSize="large"
            onClick={handleNext}
            disabled={!selectedPatient}
          >
            {t("searchPatient.next")}
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
    </AnalyzeSampleRoot>
  );
}
