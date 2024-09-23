import { SnapResultTypeEnum } from "@viewpoint/api";
import {
  SNAPResultEntryType,
  SNAPSpotDeviceDefinition,
} from "./definition-constants";

export const GiardiaDefinition: SNAPSpotDeviceDefinition<"Giardia"> = {
  type: SNAPResultEntryType.SpotPicker,
  dots: [
    {
      dotId: "control",
      position: "TopCenter",
      control: true,
      label: "resultsEntry.snap.labels.control",
    },
    {
      dotId: "Giardia",
      position: "MiddleRight",
      label: "assays.snap.Giardia",
    },
  ],
  defaultResult: SnapResultTypeEnum.GIARDIA_NEGATIVE,
  resultMap: {
    GIARDIA_NEGATIVE: {
      Giardia: false,
    },
    GIARDIA_POSITIVE: {
      Giardia: true,
    },
  },
};
