import { DilutionTypeEnum } from "@viewpoint/api";

export interface ResultSet {
  results: Result[];
  delayAmount?: number;
  acceptDelay?: number;
  postAcceptDelay?: number;
  dilution?: Dilution;
  notes?: Comment[];
  resultSetType?: ResultSetType;
  groups?: Group;
  sampleType?: SampleType;
}

export interface Comment {
  type: {
    qualifier: string;
    code: string;
    use?: boolean;
    arguments?: string[];
  };
}

export interface Dilution {
  dilutionFactor: number;
  dilutionType: DilutionTypeEnum;
}

export interface Result {
  assay: Assay;
  value: string;
  notes?: Comment[];
}

export interface Assay {
  name: string;
}

export interface Group {
  delay: number;
  groupType: GroupType;
  results: Result[];
}

export enum ResultSetType {
  Normal = "normal",
  Partial = "partial",
}

export enum GroupType {
  Final = "final",
  Partial = "partial",
}

export enum SampleType {
  SERUM_PLASMA = "SERUMPLASMA",
  PLASMA = "PLASMA",
  SERUM = "SERUM",
  WHOLE_BLOOD = "WHOLEBLOOD",
  FECAL = "FECAL",
  URINE = "URINE",
  QUALITY_CONTROL = "QUALITYCONTROL",
  ABDOMINAL = "ABDOMINAL",
  SYNOVIAL = "SYNOVIAL",
  CEREBROSPINAL = "CEREBROSPINAL",
  THORACIC = "THORACIC",
  OTHER = "OTHER",
  UNKNOWN = "UNKNOWN",
  CSF = "CSF",
  EAR_SWAB = "EAR_SWAB",
  FNA = "FNA",
  BLOOD = "BLOOD",
}
