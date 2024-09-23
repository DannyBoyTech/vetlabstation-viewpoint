import type { AssayDto, UserInputRequestDto } from "./ivls/generated/ivls-api";

interface UserInputRequestSpecies {
  id: number;
  key: string;
  name: string;
}

interface UserInputRequest {
  type: string;
  labRequestId?: number;
  instrumentRunId?: number;
  instrumentResultId?: number;
  patientName?: string;
  species?: UserInputRequestSpecies;
}

interface UserInputOption {
  id: number;
  key: string;
}

interface SpecificUserInputRequest extends UserInputRequest {
  type: UserInputRequestType;
}

interface AssayTypeIdentificationRequest extends SpecificUserInputRequest {
  type: "assay_type_identification_request";
  categoryKey?: string;
  options?: UserInputOption[];
}

const UserInputRequestTypes = {
  AssayTypeIdentificationRequest: "assay_type_identification_request",
} as const;

type UserInputRequestType =
  (typeof UserInputRequestTypes)[keyof typeof UserInputRequestTypes];

interface AssayTypeIdentificationRequestDto extends UserInputRequestDto {
  assayCategoryKey?: string;
  assayOptions?: AssayDto[];
}

export type {
  UserInputRequest,
  UserInputRequestType,
  UserInputRequestSpecies,
  UserInputOption,
  SpecificUserInputRequest,
  AssayTypeIdentificationRequest,
  AssayTypeIdentificationRequestDto,
};

export { UserInputRequestTypes };
