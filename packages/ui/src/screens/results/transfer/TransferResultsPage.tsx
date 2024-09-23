import { LabRequestDto, PatientDto } from "@viewpoint/api";
import { Button, SpotText } from "@viewpoint/spot-react";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import { skipToken } from "@reduxjs/toolkit/query";
import { useGetDetailedLabRequestQuery } from "../../../api/LabRequestsApi";
import {
  GetPatientsForSpeciesParams,
  useGetPatientsForSpeciesQuery,
} from "../../../api/PatientApi";
import { PatientSearch } from "../../../components/patient-search/PatientSearch";
import { TransferResults } from "../../../components/transfer-results/TransferResults";
import { useDebounce, useHeaderTitle } from "../../../utils/hooks/hooks";
import {
  ButtonsColumn,
  Divider,
  StyledButton,
} from "../../../components/patient-search/common-search-page-components";
import { AddPatientSearchPlaceholder } from "../../../components/patient-search/AddPatientSearchPlaceholder";
import { FullSizeSpinner } from "../../../components/spinner/FullSizeSpinner";

const PageRoot = styled.div`
  margin: 0px 25px;
  display: flex;
  flex: 1;
  overflow-y: hidden;
`;

const MainContent = styled.div`
  display: flex;
  overflow-y: hidden;

  flex-direction: column;
  flex: 4;
`;

const Prompt = styled.div`
  flex: 0;
  margin: 20px 0;
`;

const TransferResultsPage = () => {
  const { t } = useTranslation();
  useHeaderTitle({
    label: t("transferResultsPage.headerTitle"),
  });
  const nav = useNavigate();
  const [transferOpen, setTransferOpen] = useState(false);

  const { labRequestId } = useParams();
  const { data: labRequest }: { data?: LabRequestDto | undefined } =
    useGetDetailedLabRequestQuery(
      labRequestId ? { labRequestId: Number(labRequestId) } : skipToken
    );

  const [searchCriteria, setSearchCriteria] = useState<
    Omit<GetPatientsForSpeciesParams, "speciesId">
  >({} as GetPatientsForSpeciesParams);

  const handleBack = useCallback(() => {
    nav(-1);
  }, [nav]);

  const debouncedSearchCriteria = useDebounce(searchCriteria, 300);

  const skip =
    Object.keys(debouncedSearchCriteria).length === 0 ||
    Object.values(debouncedSearchCriteria).every((v) => !v || v.length === 0);

  const {
    currentData: searchResults,
    isFetching,
    isUninitialized,
  } = useGetPatientsForSpeciesQuery(
    skip
      ? skipToken
      : {
          ...debouncedSearchCriteria,
          speciesId: labRequest?.patientDto.speciesDto.id,
        }
  );

  const [destPatient, setDestPatient] = useState<PatientDto | undefined>();

  const handleTransferRequest = useCallback(() => {
    setTransferOpen(true);
  }, [setTransferOpen]);

  const handleTransferCancel = useCallback(() => {
    setTransferOpen(false);
  }, [setTransferOpen]);

  const handleTransferConfirm = useCallback(async () => {
    setTransferOpen(false);
  }, [setTransferOpen]);

  const handleAddNew = () => {
    nav(
      `addPatient?${new URLSearchParams({
        patientName: searchCriteria.patientName ?? "",
        clientLastName: searchCriteria.clientLastName ?? "",
        clientIdentifier: searchCriteria.clientId ?? "",
      }).toString()}`
    );
  };

  return (
    <PageRoot>
      <MainContent>
        <Prompt>
          <SpotText level="paragraph" bold>
            {t("transferResultsPage.title", {
              patientName: labRequest?.patientDto.patientName,
              clientFamilyName: labRequest?.patientDto.clientDto?.lastName,
            })}
          </SpotText>
          <SpotText level="secondary">
            *{t("transferResultsPage.onlyPatientsOfSameSpeciesShown")}
          </SpotText>
        </Prompt>
        <PatientSearch
          results={searchResults || []}
          onPatientNameChange={(name) =>
            setSearchCriteria((criteria: GetPatientsForSpeciesParams) => ({
              ...criteria,
              patientName: name,
            }))
          }
          onClientLastNameChange={(name) =>
            setSearchCriteria((criteria: GetPatientsForSpeciesParams) => ({
              ...criteria,
              clientLastName: name,
            }))
          }
          onClientIdChange={(id) =>
            setSearchCriteria((criteria: GetPatientsForSpeciesParams) => ({
              ...criteria,
              clientId: id,
            }))
          }
          onPatientSelected={(selected) => setDestPatient(selected)}
          selectedPatientId={destPatient?.id}
          patientName={searchCriteria.patientName}
          clientId={searchCriteria.clientId}
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
      </MainContent>
      <ButtonsColumn>
        <StyledButton
          data-testid="transfer-button"
          buttonSize="large"
          onClick={handleTransferRequest}
          disabled={!destPatient}
        >
          {t("general.buttons.reassign")}
        </StyledButton>
        <StyledButton
          data-testid="back-button"
          buttonSize="large"
          buttonType="secondary"
          onClick={handleBack}
        >
          {t("general.buttons.back")}
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
      </ButtonsColumn>
      <TransferResults
        labRequestId={labRequest?.id}
        destPatientId={destPatient?.id}
        destPatientName={destPatient?.patientName}
        destClientFamilyName={destPatient?.clientDto?.lastName}
        open={transferOpen}
        onClose={handleTransferCancel}
        onConfirm={handleTransferConfirm}
      />
    </PageRoot>
  );
};

export { TransferResultsPage };
