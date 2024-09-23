import {
  AdditionalAssays,
  ChemistryResult,
  ChemistryTypes,
  ManualUaResultDto,
  ManualUAResults,
  QualifierTypeEnum,
  ResultDto,
} from "@viewpoint/api";
import { ProxyError } from "./proxy-utils";

const muaStringResultPrefix = "ManualUA.Results.";

/**
 * Only some mUA chemistry result values are prefixed, this list reflect which are.
 */
const prefixedChemResults: ChemistryResult[] = [
  ChemistryResult.Negative,
  ChemistryResult.Normal,
  ChemistryResult.Trace,
];

/**
 * Converts a mUA @type {ChemistryResult} to a value accepted by the IVLS API.
 *
 * @param chemRes
 * @returns a mUA chemistry result compatible with the IVLS API
 */
function toApiChemResult(chemRes?: ChemistryResult) {
  if (chemRes != null && prefixedChemResults.includes(chemRes)) {
    return muaStringResultPrefix + chemRes;
  }

  return chemRes;
}

export function convertMuaResults(results: ManualUAResults | null): ManualUaResultDto {
  const resultMap: Record<string, ResultDto> = {};
  if (!results) {
    throw new ProxyError("No results provided", 400, "No results provided");
  }

  if (typeof results.ph !== "undefined") {
    resultMap[AdditionalAssays.PH] = {
      assay: AdditionalAssays.PH,
      value: results.ph?.toString(),
      qualifier: QualifierTypeEnum.EQUALITY,
    };
  }
  if (typeof results.specificGravity !== "undefined") {
    resultMap[AdditionalAssays.SpecificGravity] = {
      assay: AdditionalAssays.SpecificGravity,
      value: results.specificGravity?.toString(),
      qualifier: results.sgGreaterThan ? QualifierTypeEnum.GREATERTHAN : QualifierTypeEnum.EQUALITY,
    };
  }
  if (typeof results.color !== "undefined") {
    resultMap[AdditionalAssays.Color] = {
      assay: AdditionalAssays.Color,
      value: muaStringResultPrefix + results.color?.toString(),
      qualifier: QualifierTypeEnum.EQUALITY,
    };
  }
  if (typeof results.clarity !== "undefined") {
    resultMap[AdditionalAssays.Clarity] = {
      assay: AdditionalAssays.Clarity,
      value: muaStringResultPrefix + results.clarity?.toString(),
      qualifier: QualifierTypeEnum.EQUALITY,
    };
  }
  if (typeof results.collectionMethod !== "undefined") {
    resultMap[AdditionalAssays.CollectionMethod] = {
      assay: AdditionalAssays.CollectionMethod,
      value: muaStringResultPrefix + results.collectionMethod?.toString(),
      qualifier: QualifierTypeEnum.EQUALITY,
    };
  }
  for (const chemistry of Object.keys(results.chemistries ?? {}) as ChemistryTypes[]) {
    resultMap[chemistry] = {
      assay: chemistry,
      value: toApiChemResult(results.chemistries?.[chemistry]),
      qualifier: QualifierTypeEnum.EQUALITY,
    };
  }
  return {
    comment: results.comment,
    resultMap,
  };
}
