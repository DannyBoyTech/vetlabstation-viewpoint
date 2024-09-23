import { SnapResultTypeEnum } from "@viewpoint/api";
import {
  SNAPResultEntryType,
  SNAPSpotDeviceDefinition,
} from "./definition-constants";

export const FelineComboDefinition: SNAPSpotDeviceDefinition<"FIV" | "FeLV"> = {
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
  ],
  defaultResult: SnapResultTypeEnum.FELINE_COMBO_NEGATIVE,
  resultMap: {
    [SnapResultTypeEnum.FELINE_COMBO_NEGATIVE]: {
      FIV: false,
      FeLV: false,
    },
    [SnapResultTypeEnum.FELINE_COMBO_FELV_POSITIVE]: {
      FIV: false,
      FeLV: true,
    },
    [SnapResultTypeEnum.FELINE_COMBO_FIV_POSITIVE]: {
      FIV: true,
      FeLV: false,
    },
    [SnapResultTypeEnum.FELINE_COMBO_FIV_FELV_POSITIVE]: {
      FIV: true,
      FeLV: true,
    },
  },
};
