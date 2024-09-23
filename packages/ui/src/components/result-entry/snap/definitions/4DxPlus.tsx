import { SnapResultTypeEnum } from "@viewpoint/api";
import {
  SNAPResultEntryType,
  SNAPSpotDeviceDefinition,
} from "./definition-constants";

export const FourDxPlusDefinition: SNAPSpotDeviceDefinition<
  "AP_spp" | "EC-EE" | "HW" | "Lyme"
> = {
  type: SNAPResultEntryType.SpotPicker,
  dots: [
    {
      dotId: "control",
      position: "FiveDot_TopLeft",
      control: true,
      label: "resultsEntry.snap.labels.control",
    },
    {
      dotId: "AP_spp",
      position: "FiveDot_MiddleCenter",
      label: "assays.snap.AP_spp",
    },
    {
      dotId: "EC-EE",
      position: "FiveDot_MiddleLeft",
      label: "assays.snap.EC-EE",
    },
    {
      dotId: "HW",
      position: "FiveDot_MiddleRight",
      label: "assays.snap.HW",
    },
    {
      dotId: "Lyme",
      position: "FIveDot_BottomCenter",
      label: "assays.snap.Lyme",
    },
  ],
  defaultResult: SnapResultTypeEnum.CANINE_4DX_PLUS_NEGATIVE,
  resultMap: {
    CANINE_4DX_PLUS_NEGATIVE: {
      AP_spp: false,
      "EC-EE": false,
      HW: false,
      Lyme: false,
    },
    CANINE_4DX_PLUS_ANAPL_BBURG_POSITIVE: {
      AP_spp: true,
      "EC-EE": false,
      HW: false,
      Lyme: true,
    },
    CANINE_4DX_PLUS_ANAPL_EHRLI_BBURG_POSITIVE: {
      AP_spp: true,
      "EC-EE": true,
      HW: false,
      Lyme: true,
    },
    CANINE_4DX_PLUS_ANAPL_EHRLI_HEARTWORM_BBURG_POSITIVE: {
      AP_spp: true,
      "EC-EE": true,
      HW: true,
      Lyme: true,
    },
    CANINE_4DX_PLUS_ANAPL_EHRLI_HEARTWORM_POSITIVE: {
      AP_spp: true,
      "EC-EE": true,
      HW: true,
      Lyme: false,
    },
    CANINE_4DX_PLUS_ANAPL_EHRLI_POSITIVE: {
      AP_spp: true,
      "EC-EE": true,
      HW: false,
      Lyme: false,
    },
    CANINE_4DX_PLUS_ANAPL_HEARTWORM_BBURG_POSITIVE: {
      AP_spp: true,
      "EC-EE": false,
      HW: true,
      Lyme: true,
    },
    CANINE_4DX_PLUS_ANAPL_HEARTWORM_POSITIVE: {
      AP_spp: true,
      "EC-EE": false,
      HW: true,
      Lyme: false,
    },
    CANINE_4DX_PLUS_ANAPL_POSITIVE: {
      AP_spp: true,
      "EC-EE": false,
      HW: false,
      Lyme: false,
    },
    CANINE_4DX_PLUS_BBURG_POSITIVE: {
      AP_spp: false,
      "EC-EE": false,
      HW: false,
      Lyme: true,
    },
    CANINE_4DX_PLUS_EHRLI_BBURG_POSITIVE: {
      AP_spp: false,
      "EC-EE": true,
      HW: false,
      Lyme: true,
    },
    CANINE_4DX_PLUS_EHRLI_HEARTWORM_BBURG_POSITIVE: {
      AP_spp: false,
      "EC-EE": true,
      HW: true,
      Lyme: true,
    },
    CANINE_4DX_PLUS_EHRLI_HEARTWORM_POSITIVE: {
      AP_spp: false,
      "EC-EE": true,
      HW: true,
      Lyme: false,
    },
    CANINE_4DX_PLUS_EHRLI_POSITIVE: {
      AP_spp: false,
      "EC-EE": true,
      HW: false,
      Lyme: false,
    },
    CANINE_4DX_PLUS_HEARTWORM_BBURG_POSITIVE: {
      AP_spp: false,
      "EC-EE": false,
      HW: true,
      Lyme: true,
    },
    CANINE_4DX_PLUS_HEARTWORM_POSITIVE: {
      AP_spp: false,
      "EC-EE": false,
      HW: true,
      Lyme: false,
    },
  },
};
