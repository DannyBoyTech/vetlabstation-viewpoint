import { SnapResultTypeEnum } from "@viewpoint/api";
import {
  SNAPResultEntryType,
  SNAPSpotDeviceDefinition,
} from "./definition-constants";

export const Leish2SpotDefinition: SNAPSpotDeviceDefinition<"CanL"> = {
  type: SNAPResultEntryType.SpotPicker,
  dots: [
    {
      dotId: "control",
      position: "TopCenter",
      control: true,
      label: "resultsEntry.snap.labels.control",
    },
    {
      dotId: "CanL",
      position: "MiddleRight",
      label: "assays.snap.CanL",
    },
  ],
  defaultResult: SnapResultTypeEnum.CANINE_LEISHMANIA2SPOT_NEGATIVE,
  resultMap: {
    CANINE_LEISHMANIA2SPOT_NEGATIVE: {
      CanL: false,
    },
    CANINE_LEISHMANIA2SPOT_POSITIVE: {
      CanL: true,
    },
  },
};
