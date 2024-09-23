import type { PatientGender } from "../ivls/generated/ivls-api";

export interface CalculateLifestageParams {
  speciesId: number;
  birthDate: string;
  gender?: PatientGender;
}
