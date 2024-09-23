import { Button } from "@viewpoint/spot-react";
import { useRef, useState } from "react";
import {
  PatientEntry,
  PatientSaveEditDtoWithSpeciesClass,
} from "../../components/patient-entry/PatientEntry";
import { ClientDto } from "@viewpoint/api";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { unstable_useBlocker as useBlocker } from "react-router";
import { CancelConfirmationModal } from "../../components/confirm-modal/CancelConfirmationModal";
import {
  useCreateNewPatientWithClient,
  validateClient,
  validatePatient,
} from "../../components/patient-entry/patient-entry-utils";
import {
  PatientEntryScreenContainer,
  ButtonContainer,
  InnerContainer,
  PatientEntryWrapper,
  TestId,
} from "./add-patient-components";
import { useHeaderTitle } from "../../utils/hooks/hooks";

export function AddPatientScreen() {
  const { t } = useTranslation();
  useHeaderTitle({
    label: t("patientEntry.titles.newPatient"),
  });

  const [search] = useSearchParams();

  const [newPatient, setNewPatient] = useState<
    Partial<PatientSaveEditDtoWithSpeciesClass>
  >({
    patientName: search.get("patientName") ?? undefined,
  });
  const [client, setClient] = useState<Partial<ClientDto>>({
    clientId: search.get("clientIdentifier") ?? undefined,
    lastName: search.get("clientLastName") ?? undefined,
  });

  const shouldBlock = useRef(false);

  const [createPatientAndClient, createPatientIsLoading] =
    useCreateNewPatientWithClient();

  const nav = useNavigate();

  async function handleNext() {
    try {
      const createdPatient = await createPatientAndClient(
        newPatient as PatientSaveEditDtoWithSpeciesClass,
        client as ClientDto
      );
      shouldBlock.current = false;

      const params = new URLSearchParams({
        patientId: createdPatient.id?.toString(),
        clientIdentifier: createdPatient.clientDto?.clientId,
      });
      nav({
        pathname: "/labRequest/build",
        search: params.toString(),
      });
    } catch (err) {
      console.error(err);
      shouldBlock.current = true;
    }
  }

  // Using a ref and callback version of useBlocker because we need to be able
  // to set it to "false" and then immediately navigate -- using setState and
  // passing the value directly would force us to wait for the state propagation
  // to change before it would unblock the navigation.
  const blocker = useBlocker(() => shouldBlock.current);

  return (
    <PatientEntryScreenContainer>
      <InnerContainer>
        <PatientEntryWrapper>
          <PatientEntry
            patient={newPatient}
            client={client}
            onPatientChanged={(patient) => {
              shouldBlock.current = true;
              setNewPatient(patient);
            }}
            onClientChanged={(client) => {
              shouldBlock.current = true;
              setClient(client);
            }}
          />
        </PatientEntryWrapper>
        <ButtonContainer>
          <Button
            buttonSize="large"
            data-testid={TestId.Next}
            disabled={
              createPatientIsLoading ||
              !validatePatient(newPatient, newPatient.speciesClass) ||
              !validateClient(client)
            }
            onClick={handleNext}
          >
            {t("general.buttons.next")}
          </Button>
          <Button
            data-testid={TestId.Cancel}
            buttonType="secondary"
            buttonSize="large"
            onClick={() => nav(-1)}
          >
            {t("general.buttons.cancel")}
          </Button>
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
