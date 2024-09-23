import VetAutoReaderDisplay from "../assets/instruments/display/300x300/VetAutoReader.png";
import ProCyteOneDisplay from "../assets/instruments/display/300x300/AcadiaDx.png";
import CatalystDxDisplay from "../assets/instruments/display/300x300/CatalystDx.png";
import CatOneDisplay from "../assets/instruments/display/300x300/CatOne.png";
import CoagDxDisplay from "../assets/instruments/display/300x300/CoagDx.png";
import CrimsonDisplay from "../assets/instruments/display/300x300/Crimson.png";
import LaserCyteDisplay from "../assets/instruments/display/300x300/LaserCyte.png";
import LaserCyteDxDisplay from "../assets/instruments/display/300x300/LaserCyteDx.png";
import SNAPDisplay from "../assets/instruments/display/300x300/SNAP.png";
import SNAPProDisplay from "../assets/instruments/display/300x300/SNAPPro.png";
import SNAPshotDxDisplay from "../assets/instruments/display/300x300/SNAPshotDx.png";
import UriSedDisplay from "../assets/instruments/display/300x300/SediVueDx.png";
import UriSysDxDisplay from "../assets/instruments/display/300x300/UriSysDx.png";
import VetLabUADisplay from "../assets/instruments/display/300x300/UAAnalyzer.png";
import ManualUADisplay from "../assets/instruments/display/300x300/ManualUA.png";
import ManualCRPDisplay from "../assets/instruments/display/300x300/ManualCRP.png";
import VetLyteDisplay from "../assets/instruments/display/300x300/VetLyte.png";
import VetStatDisplay from "../assets/instruments/display/300x300/VetStat.png";
import VetTestDisplay from "../assets/instruments/display/300x300/VetTest.png";
import TheiaDisplay from "../assets/instruments/display/300x300/Theia.png";
import PimsDisplay from "../assets/instruments/display/300x300/PIMS.png";
import UnknownDisplay from "../assets/instruments/display/300x300/unknown.svg";
import SystemDisplay from "../assets/instruments/display/300x300/System.svg";

import { TFunction } from "react-i18next";
import {
  InstrumentStatus,
  InstrumentStatusDto,
  InstrumentType,
  SampleTypesMapping,
} from "@viewpoint/api";

export const InstrumentCategories: { [key: string]: InstrumentType[] } =
  Object.freeze({
    hematology: [
      InstrumentType.ProCyteOne,
      InstrumentType.ProCyteDx,
      InstrumentType.LaserCyte,
      InstrumentType.LaserCyteDx,
      InstrumentType.CoagDx,
      InstrumentType.AutoReader,
      InstrumentType.Tensei,
      InstrumentType.Theia,
    ],
    chemistry: [
      InstrumentType.CatalystOne,
      InstrumentType.CatalystDx,
      InstrumentType.VetTest,
      InstrumentType.VetLyte,
      InstrumentType.VetStat,
      InstrumentType.ManualCRP,
    ],
    immunoassay: [
      InstrumentType.SNAP,
      InstrumentType.SNAPPro,
      InstrumentType.SNAPshotDx,
      InstrumentType.SnapReader,
    ],
    urinalysis: [
      InstrumentType.UAAnalyzer,
      InstrumentType.UriSysDx,
      InstrumentType.ManualUA,
      InstrumentType.SediVueDx,
    ],
    pathology: [InstrumentType.Theia],
  });

export const getInstrumentCategory = (
  t: TFunction,
  type: InstrumentType,
  selectedSampleType: number
) => {
  if (type === InstrumentType.Theia) {
    if (selectedSampleType === SampleTypesMapping.BLOOD) {
      return t("instruments.categories.hematology" as any);
    } else if (
      selectedSampleType === SampleTypesMapping.EAR_SWAB ||
      selectedSampleType === SampleTypesMapping.FNA
    ) {
      return t("instruments.categories.pathology" as any);
    }
  } else {
    return Object.keys(InstrumentCategories)
      .filter((cat) => InstrumentCategories[cat].includes(type))
      .map((key) => t(`instruments.categories.${key}` as any))
      .join(", ");
  }
};

export const getInstrumentStatusDisplayName = (
  t: TFunction,
  status: InstrumentStatus
) => t(`instruments.status.${status}`);

export const instrumentNameForType = (
  t: TFunction,
  type: InstrumentType,
  short?: boolean
) =>
  t(
    `instruments.names.${type}` as any,
    short ? { context: "short" } : undefined
  );

export const numberedInstrumentName = (
  t: TFunction,
  type: InstrumentType,
  displayNumber?: number,
  short?: boolean
) => {
  const nameForType = instrumentNameForType(t, type, short);
  return displayNumber
    ? t("instruments.numberedName", {
        name: nameForType,
        number: displayNumber.toString(),
      })
    : nameForType;
};

export function instrumentTypesById(instrumentStatus?: InstrumentStatusDto[]) {
  return Object.fromEntries(
    instrumentStatus?.map((it) => [
      it.instrument.id,
      it.instrument.instrumentType,
    ]) ?? []
  );
}

export const getInstrumentDisplayImage = (type: InstrumentType) => {
  switch (type) {
    case InstrumentType.AutoReader:
      return VetAutoReaderDisplay;
    case InstrumentType.ProCyteOne:
      return ProCyteOneDisplay;
    case InstrumentType.CatalystDx:
      return CatalystDxDisplay;
    case InstrumentType.CatalystOne:
      return CatOneDisplay;
    case InstrumentType.CoagDx:
      return CoagDxDisplay;
    case InstrumentType.ProCyteDx:
    case InstrumentType.Tensei:
      return CrimsonDisplay;
    case InstrumentType.LaserCyte:
      return LaserCyteDisplay;
    case InstrumentType.LaserCyteDx:
      return LaserCyteDxDisplay;
    case InstrumentType.SNAP:
      return SNAPDisplay;
    case InstrumentType.SNAPPro:
      return SNAPProDisplay;
    case InstrumentType.SNAPshotDx:
      return SNAPshotDxDisplay;
    case InstrumentType.SediVueDx:
      return UriSedDisplay;
    case InstrumentType.UAAnalyzer:
      return VetLabUADisplay;
    case InstrumentType.UriSysDx:
      return UriSysDxDisplay;
    case InstrumentType.VetLyte:
      return VetLyteDisplay;
    case InstrumentType.VetStat:
      return VetStatDisplay;
    case InstrumentType.VetTest:
      return VetTestDisplay;
    case InstrumentType.ManualUA:
      return ManualUADisplay;
    case InstrumentType.ManualCRP:
      return ManualCRPDisplay;
    case InstrumentType.Theia:
      return TheiaDisplay;
    case InstrumentType.SerialPims:
    case InstrumentType.InterlinkPims:
      return PimsDisplay;
    default:
      return UnknownDisplay;
  }
};

export const getSystemDisplayImage = () => {
  return SystemDisplay;
};

export function supportsNonWholeBlood(instrumentType?: InstrumentType) {
  return instrumentType == null
    ? undefined
    : [
        InstrumentType.LaserCyte,
        InstrumentType.LaserCyteDx,
        InstrumentType.ProCyteDx,
      ].includes(instrumentType);
}
