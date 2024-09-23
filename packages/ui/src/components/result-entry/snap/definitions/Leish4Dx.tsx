import { SnapResultTypeEnum } from "@viewpoint/api";
import {
  SNAPResultEntryType,
  SNAPSpotDeviceDefinition,
} from "./definition-constants";

export const Leish4DxDefinition: SNAPSpotDeviceDefinition<
  "AP_spp" | "EC-EE" | "HW" | "CanL"
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
      dotId: "CanL",
      position: "FIveDot_BottomCenter",
      label: "assays.snap.CanL",
    },
  ],
  defaultResult: SnapResultTypeEnum.CANINE_LEISH_4DX_NEGATIVE,
  resultMap: {
    CANINE_LEISH_4DX_NEGATIVE: {
      AP_spp: false,
      "EC-EE": false,
      HW: false,
      CanL: false,
    },
    CANINE_LEISH_4DX_ANAPL_LEISHMANIA_POSITIVE: {
      AP_spp: true,
      "EC-EE": false,
      HW: false,
      CanL: true,
    },
    CANINE_LEISH_4DX_ANAPL_EHRLI_LEISHMANIA_POSITIVE: {
      AP_spp: true,
      "EC-EE": true,
      HW: false,
      CanL: true,
    },
    CANINE_LEISH_4DX_ANAPL_EHRLI_HEARTWORM_LEISHMANIA_POSITIVE: {
      AP_spp: true,
      "EC-EE": true,
      HW: true,
      CanL: true,
    },
    CANINE_LEISH_4DX_ANAPL_EHRLI_HEARTWORM_POSITIVE: {
      AP_spp: true,
      "EC-EE": true,
      HW: true,
      CanL: false,
    },
    CANINE_LEISH_4DX_ANAPL_EHRLI_POSITIVE: {
      AP_spp: true,
      "EC-EE": true,
      HW: false,
      CanL: false,
    },
    CANINE_LEISH_4DX_ANAPL_HEARTWORM_LEISHMANIA_POSITIVE: {
      AP_spp: true,
      "EC-EE": false,
      HW: true,
      CanL: true,
    },
    CANINE_LEISH_4DX_ANAPL_HEARTWORM_POSITIVE: {
      AP_spp: true,
      "EC-EE": false,
      HW: true,
      CanL: false,
    },
    CANINE_LEISH_4DX_ANAPL_POSITIVE: {
      AP_spp: true,
      "EC-EE": false,
      HW: false,
      CanL: false,
    },
    CANINE_LEISH_4DX_LEISHMANIA_POSITIVE: {
      AP_spp: false,
      "EC-EE": false,
      HW: false,
      CanL: true,
    },
    CANINE_LEISH_4DX_EHRLI_LEISHMANIA_POSITIVE: {
      AP_spp: false,
      "EC-EE": true,
      HW: false,
      CanL: true,
    },
    CANINE_LEISH_4DX_EHRLI_HEARTWORM_LEISHMANIA_POSITIVE: {
      AP_spp: false,
      "EC-EE": true,
      HW: true,
      CanL: true,
    },
    CANINE_LEISH_4DX_EHRLI_HEARTWORM_POSITIVE: {
      AP_spp: false,
      "EC-EE": true,
      HW: true,
      CanL: false,
    },
    CANINE_LEISH_4DX_EHRLI_POSITIVE: {
      AP_spp: false,
      "EC-EE": true,
      HW: false,
      CanL: false,
    },
    CANINE_LEISH_4DX_HEARTWORM_LEISHMANIA_POSITIVE: {
      AP_spp: false,
      "EC-EE": false,
      HW: true,
      CanL: true,
    },
    CANINE_LEISH_4DX_HEARTWORM_POSITIVE: {
      AP_spp: false,
      "EC-EE": false,
      HW: true,
      CanL: false,
    },
  },
};
