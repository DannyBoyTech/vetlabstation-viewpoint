import {
  InstrumentResultDto,
  InstrumentType,
  LabRequestRecordDto,
  QualifierTypeEnum,
  ResultColor,
  SampleTypeEnum,
  ServiceCategory,
} from "@viewpoint/api";
import CancelledIcon from "../../assets/service-categories/Cancelled.png";
import ChemistryIcon from "../../assets/service-categories/Chemistry.png";
import EndocrinologyIcon from "../../assets/service-categories/Endocrinology.png";
import HematologyIcon from "../../assets/service-categories/Hematology.png";
import ImmunologyIcon from "../../assets/service-categories/Immunology.png";
import MicrobiologyIcon from "../../assets/service-categories/Microbiology.png";
import MolecularDiagnosticsIcon from "../../assets/service-categories/MolecularDiagnostics.png";
import OtherIcon from "../../assets/service-categories/Other.png";
import ParasitologyIcon from "../../assets/service-categories/Parasitology.png";
import PathologyIcon from "../../assets/service-categories/Pathology.png";
import RadiologyIcon from "../../assets/service-categories/Radiology.png";
import SerologyIcon from "../../assets/service-categories/Serology.png";
import TherapeuticsToxicologyIcon from "../../assets/service-categories/TherapeuticsToxicology.png";
import UrinalysisIcon from "../../assets/service-categories/Urinalysis.png";

import CancelledSvg from "../../assets/service-categories/Cancelled.svg?react";
import ChemistrySvg from "../../assets/service-categories/Chemistry.svg?react";
import EndocrinologySvg from "../../assets/service-categories/Endocrinology.svg?react";
import HematologySvg from "../../assets/service-categories/Hematology.svg?react";
import ImmunologySvg from "../../assets/service-categories/Immunology.svg?react";
import MicrobiologySvg from "../../assets/service-categories/Microbiology.svg?react";
import MolecularDiagnosticsSvg from "../../assets/service-categories/MolecularDiagnostics.svg?react";
import OtherSvg from "../../assets/service-categories/Other.svg?react";
import ParasitologySvg from "../../assets/service-categories/Parasitology.svg?react";
import PathologySvg from "../../assets/service-categories/Pathology.svg?react";
import RadiologySvg from "../../assets/service-categories/Radiology.svg?react";
import SerologySvg from "../../assets/service-categories/Serology.svg?react";
import TherapeuticsToxicologySvg from "../../assets/service-categories/TherapeuticsToxicology.svg?react";
import UrinalysisSvg from "../../assets/service-categories/Urinalysis.svg?react";

import { TFunction } from "react-i18next";
import { FunctionComponent, SVGProps } from "react";
import { SpotTokens } from "../../utils/StyleConstants";
import type { ResultColorSelections } from "../../context/ResultsPageContext";

import { TestOrderResultIdentifier } from "./common-components/result-table-components";

export const ServiceCategoryColors: Record<ServiceCategory, number[]> = {
  [ServiceCategory.Hematology]: [175, 41, 46],
  [ServiceCategory.Chemistry]: [110, 117, 68],
  [ServiceCategory.Urinalysis]: [243, 176, 12],
  [ServiceCategory.Endocrinology]: [244, 145, 30],
  [ServiceCategory.Serology]: [0, 176, 8],
  [ServiceCategory.SNAP]: [28, 113, 161],
  [ServiceCategory.TherapeuticsToxicology]: [110, 217, 242],
  [ServiceCategory.Microbiology]: [87, 100, 153],
  [ServiceCategory.Parasitology]: [130, 36, 84],
  [ServiceCategory.MolecularDiagnostics]: [255, 133, 213],
  [ServiceCategory.Pathology]: [132, 146, 129],
  [ServiceCategory.Radiology]: [51, 51, 51],
  [ServiceCategory.Other]: [121, 122, 124],
  [ServiceCategory.Cancelled]: [30, 31, 31],
};

export const ServiceCategoryImages: Record<ServiceCategory, string> = {
  [ServiceCategory.Cancelled]: CancelledIcon,
  [ServiceCategory.Chemistry]: ChemistryIcon,
  [ServiceCategory.Endocrinology]: EndocrinologyIcon,
  [ServiceCategory.Hematology]: HematologyIcon,
  [ServiceCategory.SNAP]: ImmunologyIcon,
  [ServiceCategory.Microbiology]: MicrobiologyIcon,
  [ServiceCategory.MolecularDiagnostics]: MolecularDiagnosticsIcon,
  [ServiceCategory.Other]: OtherIcon,
  [ServiceCategory.Parasitology]: ParasitologyIcon,
  [ServiceCategory.Pathology]: PathologyIcon,
  [ServiceCategory.Radiology]: RadiologyIcon,
  [ServiceCategory.Serology]: SerologyIcon,
  [ServiceCategory.TherapeuticsToxicology]: TherapeuticsToxicologyIcon,
  [ServiceCategory.Urinalysis]: UrinalysisIcon,
};

export const ServiceCategorySvgs: Record<
  ServiceCategory,
  FunctionComponent<SVGProps<SVGSVGElement>>
> = {
  [ServiceCategory.Cancelled]: CancelledSvg,
  [ServiceCategory.Chemistry]: ChemistrySvg,
  [ServiceCategory.Endocrinology]: EndocrinologySvg,
  [ServiceCategory.Hematology]: HematologySvg,
  [ServiceCategory.SNAP]: ImmunologySvg,
  [ServiceCategory.Microbiology]: MicrobiologySvg,
  [ServiceCategory.MolecularDiagnostics]: MolecularDiagnosticsSvg,
  [ServiceCategory.Other]: OtherSvg,
  [ServiceCategory.Parasitology]: ParasitologySvg,
  [ServiceCategory.Pathology]: PathologySvg,
  [ServiceCategory.Radiology]: RadiologySvg,
  [ServiceCategory.Serology]: SerologySvg,
  [ServiceCategory.TherapeuticsToxicology]: TherapeuticsToxicologySvg,
  [ServiceCategory.Urinalysis]: UrinalysisSvg,
};

export const ServiceCategorySortOrder: Record<ServiceCategory, number> = {
  [ServiceCategory.Hematology]: 0,
  [ServiceCategory.Chemistry]: 1,
  [ServiceCategory.Urinalysis]: 2,
  [ServiceCategory.Endocrinology]: 3,
  [ServiceCategory.Serology]: 4,
  [ServiceCategory.SNAP]: 5,
  [ServiceCategory.TherapeuticsToxicology]: 6,
  [ServiceCategory.Microbiology]: 7,
  [ServiceCategory.Parasitology]: 8,
  [ServiceCategory.MolecularDiagnostics]: 9,
  [ServiceCategory.Pathology]: 10,
  [ServiceCategory.Radiology]: 11,
  [ServiceCategory.Other]: 12,
  [ServiceCategory.Cancelled]: 13,
};

// TODO -- Check for this in the adapter and just set these to undefined
export const MagicLow = -9999999;
export const MagicHigh = 9999999;

export function hasSpeedBar(result: InstrumentResultDto): boolean {
  return (
    !isNaN(parseFloat(result.result!)) &&
    result.referenceLow !== MagicLow &&
    result.referenceHigh !== MagicHigh &&
    result.qualifierType !== QualifierTypeEnum.NOTCALCULATED
  );
}

export const LightModeResultColors: { [key in ResultColor]: string } = {
  [ResultColor.RED]: SpotTokens.color.red["500"],
  [ResultColor.BLUE]: SpotTokens.color.blue["500"],
  [ResultColor.GREEN]: SpotTokens.color.green["500"],
  [ResultColor.BLACK]: SpotTokens.color.neutral["900"],
};

export const DarkModeResultColors: { [key in ResultColor]: string } = {
  [ResultColor.RED]: SpotTokens.color.red["400"],
  [ResultColor.BLUE]: SpotTokens.color.theme.primary["300"],
  [ResultColor.GREEN]: SpotTokens.color.green["300"],
  [ResultColor.BLACK]: SpotTokens.color.white,
};

export function getOutOfRangeColor(
  result: InstrumentResultDto,
  colors: ResultColorSelections
) {
  if (result.abnormal) {
    return colors.abnormal;
  } else if (result.outOfRangeLow) {
    return colors.low;
  } else if (result.outOfRangeHigh) {
    return colors.high;
  } else {
    return colors.normal;
  }
}

export function getLocalizedAssayName(
  t: TFunction,
  assayIdentityName: string,
  fallback?: string
) {
  return t(
    `Assay.extended.${assayIdentityName}` as any,
    t(`Assay.${assayIdentityName}` as any, fallback)
  );
}

export function shouldDisplayCategory(
  result: InstrumentResultDto,
  assayCategoryResultMappings: Record<string, TestOrderResultIdentifier[]>
): boolean {
  return (
    !!result.displayCategory &&
    result.category != null &&
    assayCategoryResultMappings?.[result.category]?.some(
      (item) =>
        item.testOrderId === result.testOrderId && item.resultId === result.id
    )
  );
}

const NON_GRAPHING_INSTRUMENTS = [
  InstrumentType.SediVueDx,
  InstrumentType.Theia,
  InstrumentType.SNAP,
  InstrumentType.SNAPPro,
  InstrumentType.UAAnalyzer,
  InstrumentType.ManualCRP,
  InstrumentType.UriSysDx,
];

export function isResultGraphable(
  result: InstrumentResultDto,
  record: LabRequestRecordDto
): boolean {
  return (
    !NON_GRAPHING_INSTRUMENTS.includes(result.instrumentType) &&
    !!record.deviceUsageMap[result.instrumentType]?.assays?.some(
      (assay) => assay.assayIdentityName === result.assayIdentityName
    )
  );
}

export function getGraphKey(result: InstrumentResultDto): string {
  const parts = [result.instrumentType, result.assayIdentityName];
  if (result.sampleType != null) {
    parts.push(result.sampleType);
  }

  return parts.join("|");
}

export function getGraphKeyParts(
  key: string
): [InstrumentType, string, SampleTypeEnum | undefined] {
  const parts = key.split("|");
  return [parts[0] as InstrumentType, parts[1], parts[2] as SampleTypeEnum];
}
