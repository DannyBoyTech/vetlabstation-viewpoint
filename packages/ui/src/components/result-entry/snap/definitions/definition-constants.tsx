import { SNAPSpotDefinition } from "../../../snap/SNAPSpotPicker";
import { TFuncKey } from "react-i18next";
import { SnapResultTypeEnum } from "@viewpoint/api";
import { SNAPRowSelectionRow } from "../../../snap/SNAPRowSelection";

export const SNAPResultEntryType = {
  AngioDetect: "AngioDetect",
  SpotPicker: "SpotPicker",
  RowSelection: "RowSelection",
  ColumnSelection: "ColumnSelection",
} as const;
export type SNAPResultEntryType =
  (typeof SNAPResultEntryType)[keyof typeof SNAPResultEntryType];

export interface SNAPDeviceDefinition {
  type: SNAPResultEntryType;
  defaultResult?: SnapResultTypeEnum;
}

export interface LocalizedSNAPSpotDefinition<T extends string>
  extends Omit<SNAPSpotDefinition, "selected"> {
  label?: TFuncKey;
  dotId: T | "control";
}

export interface SNAPSpotDeviceDefinition<T extends string = string>
  extends SNAPDeviceDefinition {
  dots: LocalizedSNAPSpotDefinition<T>[];
  // Map used to identify the proper IVLS SnapResultTypeEnum to pass to the API
  // based on the currently selected SNAP dots
  resultMap: { [key in SnapResultTypeEnum]?: Record<T, boolean> };
  // The default result type
  defaultResult: SnapResultTypeEnum;
}

export interface LocalizedSNAPRow
  extends Omit<
    SNAPRowSelectionRow,
    "referenceImages" | "resultLabel" | "resultDescription"
  > {
  // Result enum we have to provide to the IVLS API
  result: SnapResultTypeEnum;
  // Result text we get back from the IVLS API (usually Normal/Abnormal)
  ivlsResult: string;
  resultLabel: TFuncKey;
  resultDescription?: TFuncKey;

  referenceImages: {
    dots: LocalizedSNAPSpotDefinition<string>[];
  }[];
}

export interface SNAPRowSelectionDeviceDefinition extends SNAPDeviceDefinition {
  // Assay identify name from IVLS
  ivlsAssay: string;
  // Row definitions
  rows: LocalizedSNAPRow[];
  example: {
    dots: LocalizedSNAPSpotDefinition<string>[];
    instructions?: TFuncKey;
  };
}

export interface SNAPColumnSelectionDeviceDefinition
  extends SNAPDeviceDefinition {
  ivlsAssay: string;
  //maps from result value to enum
  resultMap: Record<string, SnapResultTypeEnum>;
}
