import { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { skipToken } from "@reduxjs/toolkit/query";
import { Button } from "@viewpoint/spot-react";
import { ClientSaveEditDto, PatientDto, ClientDto } from "@viewpoint/api";
import { patientApi } from "../api/PatientApi";
import {
  PatientEntry,
  PatientSaveEditDtoWithSpeciesClass,
} from "../components/patient-entry/PatientEntry";
import { TextEntry } from "../components/patient-entry/Inputs";
import SpinnerOverlay from "../components/overlay/SpinnerOverlay";
import { unstable_useBlocker as useBlocker } from "react-router";
import { CancelConfirmationModal } from "../components/confirm-modal/CancelConfirmationModal";
import {
  PatientEntryScreenContainer,
  ButtonContainer,
  InnerContainer,
  PatientEntryWrapper,
} from "./add-patient/add-patient-components";
import {
  validateClient,
  validatePatient,
} from "../components/patient-entry/patient-entry-utils";
import { useHeaderTitle } from "../utils/hooks/hooks";

export const TestId = {
  Cancel: "cancel-button",
  Next: "next-button",
  PimsPatientId: "pims-patient-id-input",
  PimsClientId: "pims-client-id-input",
  PimsPatientIdClearButton: "pims-patient-id-clear-button",
  PimsClientIdClearButton: "pims-client-id-clear-button",
  CancelModal: "cancel-changes-modal",
} as const;

const PimsInput = styled.div`
  margin: 0.5rem 0;

  button {
    margin-top: 0.5rem;
  }
`;

interface EditPatientContentProps {
  initialPatient: PatientDto;
}

function EditPatientContent({ initialPatient }: EditPatientContentProps) {
  const [patientUpdates, setPatientUpdates] =
    useState<Partial<PatientSaveEditDtoWithSpeciesClass>>(initialPatient);
  const [clientUpdates, setClientUpdates] = useState<
    Partial<ClientSaveEditDto>
  >(initialPatient.clientDto);

  const [pimsPatientId, setPimsPatientId] = useState<string | undefined>(
    initialPatient.pimsPatientId
  );
  const [pimsClientId, setPimsClientId] = useState<string | undefined>(
    initialPatient.clientDto.pimsClientId
  );
  const shouldBlock = useRef(false);

  const { t } = useTranslation();
  const nav = useNavigate();

  const [editClient, editClientStatus] = patientApi.useEditClientMutation();
  const [editPatient, editPatientStatus] = patientApi.useEditPatientMutation();

  async function handleNext() {
    try {
      shouldBlock.current = false;
      if (
        !validatePatient(patientUpdates, patientUpdates.speciesClass) ||
        !validateClient(clientUpdates)
      ) {
        throw new Error("Could not validate patient/client data");
      }

      const patientPayload = { ...patientUpdates };
      delete patientPayload.speciesClass;

      const editPatientDetails = editPatient({
        ...(patientPayload as PatientDto),
        pimsPatientId,
        id: initialPatient.id,
        clientDto: {
          id: initialPatient.clientDto.id,
        },
      }).unwrap();

      const editClientPayload = {
        ...(clientUpdates as ClientDto),
        pimsClientId,
        id: initialPatient.clientDto.id,
      };
      delete (editClientPayload as Record<string, unknown>)["@class"];

      const editClientDetails = editClient(editClientPayload).unwrap();

      await Promise.all([editPatientDetails, editClientDetails]);
      nav(-1);
    } catch (err) {
      console.error(err);
      shouldBlock.current = true;
    }
  }

  const blocker = useBlocker(() => shouldBlock.current);

  return (
    <PatientEntryScreenContainer>
      <InnerContainer>
        <PatientEntryWrapper>
          <PatientEntry
            clientAlreadyConfirmed
            onPatientChanged={(patient) => {
              shouldBlock.current = true;
              setPatientUpdates(patient);
            }}
            onClientChanged={(client) => {
              shouldBlock.current = true;
              setClientUpdates(client);
            }}
            patient={patientUpdates}
            client={clientUpdates}
            disabledControls={{ species: true }}
          />
        </PatientEntryWrapper>
        <ButtonContainer>
          <Button
            buttonSize="large"
            data-testid={TestId.Next}
            disabled={
              editClientStatus.isLoading ||
              editPatientStatus.isLoading ||
              !validatePatient(patientUpdates, patientUpdates.speciesClass) ||
              !validateClient(clientUpdates)
            }
            onClick={handleNext}
          >
            {t("general.buttons.save")}
          </Button>
          <Button
            buttonType="secondary"
            buttonSize="large"
            onClick={() => nav(-1)}
          >
            {t("general.buttons.cancel")}
          </Button>

          <PimsInput>
            <TextEntry
              label={t("patientEntry.labels.client.pimsClientId")}
              value={pimsClientId}
              inputAwareProps={{
                layout: "numpad",
              }}
              maxLength={10}
              disabled={true}
              inputProps={{ "data-testid": TestId.PimsClientId }}
              onChange={setPimsClientId}
            />
            <Button
              data-testid={TestId.PimsPatientIdClearButton}
              buttonSize="small"
              buttonType="secondary"
              disabled={!pimsClientId}
              onClick={() => setPimsClientId("")}
            >
              {t("general.buttons.clear")}
            </Button>
          </PimsInput>

          <PimsInput>
            <TextEntry
              label={t("patientEntry.labels.pimsPatientId")}
              value={pimsPatientId}
              inputAwareProps={{
                layout: "numpad",
              }}
              maxLength={10}
              disabled={true}
              inputProps={{ "data-testid": TestId.PimsPatientId }}
              onChange={setPimsPatientId}
            />
            <Button
              data-testid={TestId.PimsPatientIdClearButton}
              buttonSize="small"
              buttonType="secondary"
              disabled={!pimsPatientId}
              onClick={() => setPimsPatientId("")}
            >
              {t("general.buttons.clear")}
            </Button>
          </PimsInput>
        </ButtonContainer>
      </InnerContainer>

      {blocker.state === "blocked" && (
        <CancelConfirmationModal
          data-testid={TestId.CancelModal}
          onConfirm={() => blocker.proceed()}
          open={true}
          onClose={() => blocker.reset()}
        />
      )}
    </PatientEntryScreenContainer>
  );
}

export function EditPatientScreen() {
  const { t } = useTranslation();
  useHeaderTitle({ label: t("patientEntry.titles.editPatient") });
  const { patientId: patientIdParam } = useParams();

  const { data: initialPatient, isLoading: getPatientLoading } =
    patientApi.useGetPatientQuery(
      patientIdParam == null ? skipToken : parseInt(patientIdParam)
    );

  if (getPatientLoading || initialPatient == null) {
    return <SpinnerOverlay />;
  }

  return <EditPatientContent initialPatient={initialPatient} />;
}
