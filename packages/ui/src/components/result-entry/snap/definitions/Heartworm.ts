import { SnapResultTypeEnum } from "@viewpoint/api";
import { SNAPResultEntryType } from "./definition-constants";

export const HeartwormDefinition = {
  ivlsAssay: "HW",
  resultMap: {
    Negative: SnapResultTypeEnum.HEARTWORM_NEGATIVE,
    WeakPositive: SnapResultTypeEnum.HEARTWORM_WEAK_POSITIVE,
    StrongPositive: SnapResultTypeEnum.HEARTWORM_STRONG_POSITIVE,
  },
  type: SNAPResultEntryType.ColumnSelection,
} as const;

export const HeartwormRTDefinition = HeartwormDefinition;
