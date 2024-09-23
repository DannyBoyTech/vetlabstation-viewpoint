import {
  AdditionalAssays,
  ChemistryResult,
  ChemistryTypes,
  Clarity,
  CollectionMethod,
  Color,
  InstrumentResultDto,
  InstrumentRunDto,
  ManualUAResults,
  PHValues,
} from "@viewpoint/api";

export function convertManualUaResults(
  ivlsRun: InstrumentRunDto
): ManualUAResults {
  const mappedResults =
    ivlsRun.instrumentResultDtos?.reduce((prev, curr) => {
      prev[curr.assayIdentityName] = curr;
      return prev;
    }, {} as Record<string, InstrumentResultDto>) ?? {};

  const clean = (resultStr: string | undefined) =>
    resultStr?.replaceAll("ManualUA.Results.", "");

  return {
    collectionMethod: mappedResults[
      AdditionalAssays.CollectionMethod
    ]?.resultText?.split(".")?.[2] as CollectionMethod,
    color: clean(mappedResults[AdditionalAssays.Color]?.resultText) as Color,
    clarity: clean(
      mappedResults[AdditionalAssays.Clarity]?.resultText
    ) as Clarity,
    specificGravity: mappedResults[AdditionalAssays.SpecificGravity]?.result
      ? parseFloat(mappedResults[AdditionalAssays.SpecificGravity]!.result!)
      : undefined,
    sgGreaterThan:
      mappedResults[AdditionalAssays.SpecificGravity]?.displayCharacter === ">",
    ph: mappedResults[AdditionalAssays.PH]?.resultValue
      ? (parseFloat(
          mappedResults[AdditionalAssays.PH]!.resultValue!
        ) as PHValues)
      : undefined,
    chemistries: (Object.values(ChemistryTypes) as ChemistryTypes[]).reduce(
      (reduced, chemistryType) => {
        reduced[chemistryType] = clean(
          mappedResults[chemistryType]?.resultText
        ) as ChemistryResult;
        return reduced;
      },
      {} as { [key in ChemistryTypes]?: ChemistryResult }
    ),
    comment: ivlsRun.userComment ?? "",
  };
}
