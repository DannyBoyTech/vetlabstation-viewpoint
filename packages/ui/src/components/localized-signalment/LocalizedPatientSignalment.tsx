import PatientSignalment, {
  PatientSignalmentProps,
  SpotClient,
  SpotPatient,
} from "@viewpoint/spot-react/src/components/patient-signalment/PatientSignalment";
import { TFunction, useTranslation } from "react-i18next";
import {
  BreedDto,
  ClientDto,
  GenderDto,
  PatientDto,
  SpeciesDto,
} from "@viewpoint/api";
import { useMemo } from "react";
import { getAgeString } from "../../utils/date-utils";
import styled from "styled-components";
import { getSpeciesIconName } from "@viewpoint/spot-react/src/components/patient-signalment/PatientImage";

const StyledPatientSignalment = styled(PatientSignalment)<{
  $boldName?: boolean;
}>`
  .spot-patient-display__pet-name {
    ${(p) => (p.$boldName ? `font-weight: 600;` : "")}
  }
`;

export interface LocalizablePatient
  extends Pick<PatientDto, "patientName" | "pimsPatientId" | "birthDate"> {
  clientDto: MinimalClient;
  speciesDto: Pick<SpeciesDto, "speciesName">;
  breedDto?: Pick<BreedDto, "breedName">;
  genderDto?: Pick<GenderDto, "genderName">;
}

export interface MinimalClient
  extends Pick<ClientDto, "firstName" | "lastName"> {
  clientId?: string;
}

export interface LocalizedPatientSignalmentProps
  extends Omit<PatientSignalmentProps, "patient" | "client"> {
  patient?: LocalizablePatient;
  boldName?: boolean;
}

export function LocalizedPatientSignalment(
  props: LocalizedPatientSignalmentProps
) {
  const { t } = useTranslation();
  const localizedPatient = useMemo(
    () => (props.patient ? mapToSpotPatient(props.patient, t) : undefined),
    [props.patient, t]
  );
  const localizedClient = useMemo(
    () =>
      props.patient?.clientDto
        ? mapToSpotClient(props.patient.clientDto)
        : undefined,
    [props.patient]
  );

  return (
    <StyledPatientSignalment
      {...props}
      $boldName={props.boldName}
      patient={localizedPatient}
      client={localizedClient}
      iconName={getSpeciesIconName(props.patient?.speciesDto.speciesName)}
    />
  );
}

export function mapToSpotPatient(
  patient: LocalizablePatient,
  t: TFunction
): SpotPatient {
  const mapped: SpotPatient = {
    name: patient.patientName,
    patientId: patient.pimsPatientId,
    speciesName: t(
      `Species.${patient.speciesDto.speciesName}`,
      patient.speciesDto.speciesName
    ),
    breed: patient.breedDto?.breedName,
  };

  if (patient.genderDto?.genderName) {
    mapped.gender = t(
      `gender.${patient.genderDto.genderName}` as any,
      t("general.placeholder.noValue"),
      {
        context: patient.speciesDto?.speciesName,
      }
    );
  }

  if (patient.birthDate) {
    mapped.age = getAgeString(patient.birthDate);
  }

  return mapped;
}

export function mapToSpotClient(client: MinimalClient): SpotClient {
  return {
    clientId: client.clientId,
    familyName: client.lastName,
    givenName: client.firstName,
  };
}
