import { SnapResultTypeEnum } from "@viewpoint/api";
import {
  SNAPResultEntryType,
  SNAPSpotDeviceDefinition,
} from "./definition-constants";

export const FelineTripleDefinition: SNAPSpotDeviceDefinition<
  "FIV" | "FeLV" | "HW"
> = {
  type: SNAPResultEntryType.SpotPicker,
  dots: [
    {
      dotId: "control",
      position: "TopCenter",
      control: true,
      label: "resultsEntry.snap.labels.control",
    },
    {
      dotId: "FIV",
      position: "MiddleLeft",
      label: "assays.snap.FIV",
    },
    {
      dotId: "FeLV",
      position: "MiddleRight",
      label: "assays.snap.FeLV",
    },
    {
      dotId: "HW",
      position: "BottomCenter",
      label: "assays.snap.HW",
    },
  ],
  defaultResult: SnapResultTypeEnum.FELINE_TRIPLE_NEGATIVE,
  resultMap: {
    [SnapResultTypeEnum.FELINE_TRIPLE_NEGATIVE]: {
      FIV: false,
      FeLV: false,
      HW: false,
    },
    [SnapResultTypeEnum.FELINE_TRIPLE_FELV_POSITIVE]: {
      FIV: false,
      FeLV: true,
      HW: false,
    },
    [SnapResultTypeEnum.FELINE_TRIPLE_FELV_FIV_POSITIVE]: {
      FIV: true,
      FeLV: true,
      HW: false,
    },
    [SnapResultTypeEnum.FELINE_TRIPLE_FELV_HEARTWORM_POSITIVE]: {
      FIV: false,
      FeLV: true,
      HW: true,
    },
    [SnapResultTypeEnum.FELINE_TRIPLE_FELV_FIV_HEARTWORM_POSITIVE]: {
      FIV: true,
      FeLV: true,
      HW: true,
    },
    [SnapResultTypeEnum.FELINE_TRIPLE_FIV_POSITIVE]: {
      FIV: true,
      FeLV: false,
      HW: false,
    },
    [SnapResultTypeEnum.FELINE_TRIPLE_FIV_HEARTWORM_POSITIVE]: {
      FIV: true,
      FeLV: false,
      HW: true,
    },
    [SnapResultTypeEnum.FELINE_TRIPLE_HEARTWORM_POSITIVE]: {
      FIV: false,
      FeLV: false,
      HW: true,
    },
  },
};
