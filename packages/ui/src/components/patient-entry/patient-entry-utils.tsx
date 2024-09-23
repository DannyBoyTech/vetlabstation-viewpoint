import {
  ClientDto,
  PatientDto,
  PatientSaveEditDto,
  ReferenceClassType,
} from "@viewpoint/api";
import { PatientSaveEditDtoWithSpeciesClass } from "./PatientEntry";
import { useCallback, useState } from "react";
import {
  useCreateClientMutation,
  useCreatePatientMutation,
} from "../../api/PatientApi";

export function validatePatient(
  newPatientArgs: Partial<PatientSaveEditDto>,
  referenceClassType: ReferenceClassType | undefined
): boolean {
  return (
    newPatientArgs.patientName != null &&
    newPatientArgs.patientName.trim().length > 0 &&
    newPatientArgs.speciesDto?.id != null &&
    (referenceClassType == null ||
      referenceClassType === ReferenceClassType.Other ||
      newPatientArgs.lastKnownRefClassDto?.id != null)
  );
}

export function validateClient(client?: Partial<ClientDto>): boolean {
  return (
    typeof client?.clientId !== "undefined" && client.clientId.trim().length > 0
  );
}

export function useCreateNewPatientWithClient(): [
  (
    patientUpdates: PatientSaveEditDtoWithSpeciesClass,
    client: ClientDto
  ) => Promise<PatientDto>,
  boolean
] {
  const [isLoading, setIsLoading] = useState(false);

  const [createPatient] = useCreatePatientMutation();
  const [createClient] = useCreateClientMutation();

  return [
    useCallback(
      async (
        patient: PatientSaveEditDtoWithSpeciesClass,
        client: ClientDto
      ) => {
        try {
          setIsLoading(true);
          if (!validatePatient(patient, patient.speciesClass)) {
            throw new Error("Invalid patient");
          }
          if (!validateClient(client)) {
            throw new Error("Invalid client");
          }
          const clientEntity =
            client.id == null ? await createClient(client).unwrap() : client;
          const patientPayload = { ...patient };
          // IVLS API doesn't like unknown fields sometimes
          delete patientPayload.speciesClass;
          patientPayload.clientDto = { id: clientEntity.id };
          return await createPatient(patientPayload).unwrap();
        } finally {
          setIsLoading(false);
        }
      },
      [createClient, createPatient]
    ),
    isLoading,
  ];
}
