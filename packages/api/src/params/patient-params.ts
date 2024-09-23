import type { SpeciesDto } from "../ivls/generated/ivls-api";

export interface CreatePatientArgs {
  birthDateCalculated?: boolean;
  ageIsApproximate?: boolean;
  breedId?: number;
  clientId: number;
  birthDate?: string;
  genderId?: number;
  patientId?: string;
  patientName: string;
  refClassId?: number;
  speciesId: number;
  stat?: boolean;
  lastKnownWeight?: string;
}

export interface EditPatientArgs extends CreatePatientArgs {
  id: number;
}

export interface CreateClientArgs {
  clientId: string;
  familyName?: string | undefined;
  givenName?: string | undefined;
  middleName?: string | undefined;
  pimsClientId?: string | undefined;
}

export interface PatientDetailsArgs {
  ageIsApproximate?: boolean;
  birthDateCalculated?: boolean;
  breedId?: number;
  // id in Client object
  clientDbId?: number;
  birthDate?: string;
  genderId?: number;
  pimsPatientId?: string;
  patientName: string;
  refClassId?: number;
  species?: SpeciesDto;
  stat?: boolean;
  lastKnownWeight?: string;
}

export interface ClientDetailsArgs {
  clientId?: string;
  familyName?: string;
  givenName?: string;
  middleName?: string;
  pimsClientId?: string;
}
