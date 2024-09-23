import { describe, expect, it, vi } from "vitest";
import { hasSpeedBar, MagicHigh, MagicLow } from "./result-utils";
import { InstrumentResultDto, QualifierTypeEnum } from "@viewpoint/api";

describe("hasSpeedBar", () => {
  it("returns true for valid results with valid qualifier and reference ranges", () => {
    expect(
      hasSpeedBar({
        result: "1.401",
        referenceLow: 1,
        referenceHigh: 5,
        qualifierType: QualifierTypeEnum.EQUALITY,
      } as InstrumentResultDto)
    ).toBe(true);
  });

  it("returns false for invalid results", () => {
    expect(
      hasSpeedBar({
        result: "a1.401",
        referenceLow: 1,
        referenceHigh: 5,
        qualifierType: QualifierTypeEnum.EQUALITY,
      } as InstrumentResultDto)
    ).toBe(false);
  });

  it("returns false for NOT_CALCULATED qualifier", () => {
    expect(
      hasSpeedBar({
        result: "1.401",
        referenceLow: 1,
        referenceHigh: 5,
        qualifierType: QualifierTypeEnum.NOTCALCULATED,
      } as InstrumentResultDto)
    ).toBe(false);
  });

  it("returns false for missing reference ranges", () => {
    expect(
      hasSpeedBar({
        result: "1.401",
        referenceLow: MagicLow,
        referenceHigh: MagicHigh,
        qualifierType: QualifierTypeEnum.EQUALITY,
      } as InstrumentResultDto)
    ).toBe(false);
  });
});
