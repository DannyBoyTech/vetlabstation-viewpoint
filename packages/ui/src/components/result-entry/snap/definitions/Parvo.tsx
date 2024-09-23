import { SnapResultTypeEnum } from "@viewpoint/api";
import {
  SNAPResultEntryType,
  SNAPSpotDeviceDefinition,
} from "./definition-constants";

export const ParvoDefinition: SNAPSpotDeviceDefinition<"Parvo"> = {
  type: SNAPResultEntryType.SpotPicker,
  dots: [
    {
      dotId: "control",
      position: "TopCenter",
      control: true,
      label: "resultsEntry.snap.labels.control",
    },
    {
      dotId: "Parvo",
      position: "MiddleRight",
      label: "assays.snap.Parvo",
    },
  ],
  defaultResult: SnapResultTypeEnum.CANINE_PARVO_NEGATIVE,
  resultMap: {
    CANINE_PARVO_NEGATIVE: {
      Parvo: false,
    },
    CANINE_PARVO_POSITIVE: {
      Parvo: true,
    },
  },
};
