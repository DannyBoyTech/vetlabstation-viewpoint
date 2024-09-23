import { Button } from "@viewpoint/spot-react";
import { useCallback, useState } from "react";
import {
  PatientEntry,
  PatientSaveEditDtoWithSpeciesClass,
} from "../../../components/patient-entry/PatientEntry";
import { PatientDto, ClientDto, LabRequestDto } from "@viewpoint/api";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { TransferResults } from "../../../components/transfer-results/TransferResults";
import { useGetDetailedLabRequestQuery } from "../../../api/LabRequestsApi";
import { unstable_useBlocker as useBlocker } from "react-router";
import { CancelConfirmationModal } from "../../../components/confirm-modal/CancelConfirmationModal";
import {
  useCreateNewPatientWithClient,
  validateClient,
  validatePatient,
} from "../../../components/patient-entry/patient-entry-utils";
import {
  PatientEntryScreenContainer,
  ButtonContainer,
  InnerContainer,
  PatientEntryWrapper,
} from "../../add-patient/add-patient-components";
import SpinnerOverlay from "../../../components/overlay/SpinnerOverlay";
import { useHeaderTitle } from "../../../utils/hooks/hooks";

export const TestId = {
  Cancel: "cancel-button",
  Next: "next-button",
  CancelModal: "cancel-changes-modal",
} as const;

interface AddPatientContentProps {
  labRequest: LabRequestDto;
  patientName?: string;
  clientId?: string;
  clientLastName?: string;
}

function AddPatientContent(props: AddPatientContentProps) {
  const [newPatient, setNewPatient] = useState<
    Partial<PatientSaveEditDtoWithSpeciesClass>
  >({
    patientName: props.patientName,
    speciesDto: props.labRequest.patientDto.speciesDto,
  });
  const [client, setClient] = useState<Partial<ClientDto>>({
    clientId: props.clientId,
    lastName: props.clientLastName,
  });

  const [transferOpen, setTransferOpen] = useState<boolean>(false);
  const [destPatient, setDestPatient] = useState<PatientDto>();
  const [shouldBlock, setShouldBlock] = useState(false);

  const { t } = useTranslation();

  const [createPatientAndClient, createPatientIsLoading] =
    useCreateNewPatientWithClient();

  const nav = useNavigate();

  const handleTransferCancel = useCallback(() => {
    setTransferOpen(false);
  }, [setTransferOpen]);

  const handleTransferConfirm = useCallback(() => {
    setTransferOpen(false);
  }, [setTransferOpen]);

  async function handleNext() {
    try {
      setShouldBlock(false);
      const createdPatient = await createPatientAndClient(
        newPatient as PatientSaveEditDtoWithSpeciesClass,
        client as ClientDto
      );
      setDestPatient(createdPatient);
      setTransferOpen(true);
    } catch (err) {
      console.error(err);
      setShouldBlock(true);
    }
  }

  const blocker = useBlocker(shouldBlock);

  return (
    <PatientEntryScreenContainer>
      <InnerContainer>
        <PatientEntryWrapper>
          <PatientEntry
            patient={newPatient}
            client={client}
            onPatientChanged={(patient) => {
              setShouldBlock(true);
              setNewPatient(patient);
            }}
            onClientChanged={(client) => {
              setShouldBlock(true);
              setClient(client);
            }}
            disabledControls={{
              species: true,
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
            {t("general.buttons.reassign")}
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
        <TransferResults
          labRequestId={props.labRequest.id}
          destPatientId={destPatient?.id}
          destPatientName={destPatient?.patientName}
          destClientFamilyName={destPatient?.clientDto?.lastName}
          open={transferOpen}
          onClose={handleTransferCancel}
          onConfirm={handleTransferConfirm}
        />
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

export function AddPatientForTransferResults() {
  const { t } = useTranslation();
  useHeaderTitle({
    label: t("patientEntry.titles.newPatient"),
  });
  const [search] = useSearchParams();
  const { labRequestId } = useParams();

  if (labRequestId == null || labRequestId.length === 0) {
    throw new Error("Cannot transfer without a lab request ID");
  }

  const { data: labRequest, isLoading: labRequestIsLoading } =
    useGetDetailedLabRequestQuery({ labRequestId: Number(labRequestId) });

  if (labRequestIsLoading || labRequest == null) {
    return <SpinnerOverlay />;
  }

  return (
    <AddPatientContent
      labRequest={labRequest}
      patientName={search.get("patientName") ?? undefined}
      clientLastName={search.get("clientLastName") ?? undefined}
      clientId={search.get("clientIdentifier") ?? undefined}
    />
  );
}
