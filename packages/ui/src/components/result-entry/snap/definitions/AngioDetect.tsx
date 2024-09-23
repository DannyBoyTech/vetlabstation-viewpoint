import {
  SNAPDeviceDefinition,
  SNAPResultEntryType,
} from "./definition-constants";
import { SnapResultTypeEnum } from "@viewpoint/api";

export const AngioDetectDefinition: SNAPDeviceDefinition = {
  type: SNAPResultEntryType.AngioDetect,
  defaultResult: SnapResultTypeEnum.CANINE_ANGIO_DETECT_NEGATIVE,
};
