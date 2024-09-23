import {
  SNAPResultEntryType,
  SNAPSpotDeviceDefinition,
} from "./definition-constants";
import { SnapResultTypeEnum } from "@viewpoint/api";

export const FelineFeLVDefinition: SNAPSpotDeviceDefinition<"FeLV"> = {
  type: SNAPResultEntryType.SpotPicker,
  dots: [
    {
      dotId: "control",
      position: "TopCenter",
      control: true,
      label: "resultsEntry.snap.labels.control",
    },
    {
      dotId: "FeLV",
      position: "MiddleRight",
      label: "assays.snap.FeLV",
    },
  ],
  defaultResult: SnapResultTypeEnum.FELINE_FELV_NEGATIVE,
  resultMap: {
    FELINE_FELV_NEGATIVE: {
      FeLV: false,
    },
    FELINE_FELV_POSITIVE: {
      FeLV: true,
    },
  },
};
