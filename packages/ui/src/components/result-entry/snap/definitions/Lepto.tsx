import { SnapResultTypeEnum } from "@viewpoint/api";
import {
  SNAPResultEntryType,
  SNAPSpotDeviceDefinition,
} from "./definition-constants";

export const LeptoDefinition: SNAPSpotDeviceDefinition<"Lepto"> = {
  type: SNAPResultEntryType.SpotPicker,
  dots: [
    {
      dotId: "control",
      position: "TopCenter",
      control: true,
      label: "resultsEntry.snap.labels.control",
    },
    {
      dotId: "Lepto",
      position: "MiddleRight",
      label: "assays.snap.Lepto",
    },
  ],
  defaultResult: SnapResultTypeEnum.CANINE_LEPTO_NEGATIVE,
  resultMap: {
    CANINE_LEPTO_NEGATIVE: {
      Lepto: false,
    },
    CANINE_LEPTO_POSITIVE: {
      Lepto: true,
    },
  },
};
