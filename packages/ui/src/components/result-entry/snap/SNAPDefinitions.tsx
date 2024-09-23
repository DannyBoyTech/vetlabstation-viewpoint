import { SNAPSpotDefinition } from "../../snap/SNAPSpotPicker";
import { InstrumentRunDto, SnapResultTypeEnum } from "@viewpoint/api";
import { LeptoDefinition } from "./definitions/Lepto";
import { FourDxPlusDefinition } from "./definitions/4DxPlus";
import { ParvoDefinition } from "./definitions/Parvo";
import { GiardiaDefinition } from "./definitions/Giardia";
import { Leish4DxDefinition } from "./definitions/Leish4Dx";
import { Leish2SpotDefinition } from "./definitions/Leish2Spot";
import { fPLDefinition } from "./definitions/fPL";
import {
  SNAPColumnSelectionDeviceDefinition,
  SNAPDeviceDefinition,
  SNAPResultEntryType,
  SNAPRowSelectionDeviceDefinition,
  SNAPSpotDeviceDefinition,
} from "./definitions/definition-constants";
import { FoalIgGDefinition } from "./definitions/FoalIgG";
import { FelineComboDefinition } from "./definitions/FelineCombo";
import { FelineTripleDefinition } from "./definitions/FelineTriple";
import { FelineFeLVDefinition } from "./definitions/FelineFeLV";
import { FelineProBNPDefinition } from "./definitions/FelineProBNP";
import { cPLDefinition } from "./definitions/cPL";
import { LeishmaniaDefinition } from "./definitions/Leishmania";
import { AngioDetectDefinition } from "./definitions/AngioDetect";
import {
  HeartwormDefinition,
  HeartwormRTDefinition,
} from "./definitions/Heartworm";

export const DEFINITION_MAP: Record<number, SNAPDeviceDefinition> = {
  1: HeartwormDefinition,
  4: LeishmaniaDefinition,
  5: ParvoDefinition,
  6: GiardiaDefinition,
  8: HeartwormRTDefinition,
  9: FelineComboDefinition,
  10: FelineComboDefinition,
  11: FelineFeLVDefinition,
  12: GiardiaDefinition,
  13: FoalIgGDefinition,
  14: cPLDefinition,
  15: FelineTripleDefinition,
  16: fPLDefinition,
  18: FelineProBNPDefinition,
  19: LeptoDefinition,
  17: FourDxPlusDefinition,
  22: AngioDetectDefinition,
  23: Leish4DxDefinition,
  24: Leish2SpotDefinition,
};

export function getDefinition(snapDeviceId: number) {
  const definition = DEFINITION_MAP[snapDeviceId];
  if (definition == null) {
    throw new Error(`Could not find SNAP defintion for ${snapDeviceId}`);
  }
  return definition;
}

export function getResultsEntryType(snapDeviceId: number): SNAPResultEntryType {
  return getDefinition(snapDeviceId).type;
}

export function getDefaultResultType(snapDeviceId: number): SnapResultTypeEnum {
  return getDefinition(snapDeviceId).defaultResult as SnapResultTypeEnum;
}

export function getSelectedSnapDots(
  snapDeviceId: number
): SNAPSpotDefinition[] {
  if (getDefinition(snapDeviceId).type !== SNAPResultEntryType.SpotPicker) {
    throw new Error(`Snap device ${snapDeviceId} is not of SPOT picker type`);
  }
  return (getDefinition(snapDeviceId) as SNAPSpotDeviceDefinition).dots.map(
    (dot) => ({
      ...dot,
      selected: false,
    })
  );
}

export function getSnapResultFromRunResults(run: InstrumentRunDto) {
  if (run.snapDeviceDto?.snapDeviceId != null) {
    const definition = getDefinition(run.snapDeviceDto?.snapDeviceId);
    if (definition.type === SNAPResultEntryType.SpotPicker) {
      return convertDotsToResultEnum(
        run.instrumentResultDtos.map((ir) => ({
          dotId: ir.assayIdentityName,
          control: false,
          selected: ir.resultText?.toLowerCase() === "positive",
        })),
        run.snapDeviceDto.snapDeviceId
      );
    } else if (definition.type === SNAPResultEntryType.RowSelection) {
      return getSnapResultForSingleAssay(
        definition as SNAPRowSelectionDeviceDefinition,
        run
      );
    } else if (definition.type === SNAPResultEntryType.ColumnSelection) {
      return getColumnResultFromRun(
        definition as SNAPColumnSelectionDeviceDefinition,
        run
      );
    } else if (definition.type === SNAPResultEntryType.AngioDetect) {
      return getAngioDetectResult(run);
    }
  }
}

export function getSnapResultForSingleAssay(
  definition: SNAPRowSelectionDeviceDefinition,
  run: InstrumentRunDto
): SnapResultTypeEnum | undefined {
  // Find the matching result for this definition's assay
  const result = run.instrumentResultDtos.find(
    (ir) => ir.assayIdentityName === definition.ivlsAssay
  );
  if (result != null) {
    // Find the row that matches the result text
    const matchingRow = definition.rows.find(
      (row) => row.ivlsResult === result.resultText
    );
    return matchingRow?.result;
  }
}

export function getColumnResultFromRun(
  definition: SNAPColumnSelectionDeviceDefinition,
  run: InstrumentRunDto
) {
  const result = run.instrumentResultDtos.find(
    (it) => it.assayIdentityName === definition.ivlsAssay
  );
  if (result != null && result.resultText != null) {
    return definition.resultMap[result.resultText];
  }
}

export function getAngioDetectResult(
  run: InstrumentRunDto
): SnapResultTypeEnum | undefined {
  return run.instrumentResultDtos
    .find((it) => it.assayIdentityName === "A_VASO")
    ?.resultText?.toLowerCase() === "positive"
    ? SnapResultTypeEnum.CANINE_ANGIO_DETECT_POSITIVE
    : SnapResultTypeEnum.CANINE_ANGIO_DETECT_NEGATIVE;
}

// IVLS API uses an enum that contains every possible SNAP result combination.
// We need to map the state of our assay dots to one of those enums, the mapping of which
// should be defined in the SNAP definition
export function convertDotsToResultEnum(
  dots: Pick<SNAPSpotDefinition, "dotId" | "control" | "selected">[],
  snapDeviceId: number
): SnapResultTypeEnum | undefined {
  if (getDefinition(snapDeviceId).type !== SNAPResultEntryType.SpotPicker) {
    throw new Error(`Snap device ${snapDeviceId} is not of SPOT picker type`);
  }
  const definition = getDefinition(snapDeviceId) as SNAPSpotDeviceDefinition;
  return (Object.keys(definition.resultMap) as SnapResultTypeEnum[]).find(
    (resultTypeEnum) =>
      dots.every(
        (dotState) =>
          dotState.control ||
          definition.resultMap[resultTypeEnum]?.[dotState.dotId] ===
            dotState.selected
      )
  );
}

export function selectDotsForResultEnum(
  dots: SNAPSpotDefinition[],
  resultEnum: SnapResultTypeEnum,
  snapDeviceId: number
): SNAPSpotDefinition[] {
  if (getDefinition(snapDeviceId).type !== SNAPResultEntryType.SpotPicker) {
    throw new Error(`Snap device ${snapDeviceId} is not of SPOT picker type`);
  }
  const definition = getDefinition(snapDeviceId) as SNAPSpotDeviceDefinition;
  return dots.map((dot) => ({
    ...dot,
    selected: !!definition.resultMap[resultEnum]?.[dot.dotId],
  }));
}
