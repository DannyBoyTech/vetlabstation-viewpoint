import {
  InstrumentType,
  SampleTypeDto,
  ServiceCategory,
  DilutionTypeEnum,
  InstrumentRunConfigurationDto,
} from "./ivls/generated/ivls-api";

export type AvailableSampleTypes = Partial<
  Record<InstrumentType, InstrumentSampleTypes>
>;

export interface InstrumentSampleTypes extends Record<string, SampleTypeDto[]> {
  unknown: SampleTypeDto[];
}

export type DefaultRunConfigs = Record<
  string,
  InstrumentRunConfigurationDto | undefined
>;

export type ValidDilutionType = Extract<
  DilutionTypeEnum,
  | DilutionTypeEnum.AUTOMATIC
  | DilutionTypeEnum.MANUAL
  | DilutionTypeEnum.UPCAUTOMATIC
>;

export interface DilutionDisplayConfig {
  [DilutionTypeEnum.AUTOMATIC]?: number[];
  [DilutionTypeEnum.MANUAL]?: number[];
  [DilutionTypeEnum.UPCAUTOMATIC]?: number[];
  defaultType: ValidDilutionType;
}

export const ServiceCategoryMappings: {
  [key in InstrumentType]: ServiceCategory;
} = {
  [InstrumentType.ProCyteOne]: ServiceCategory.Hematology,
  [InstrumentType.AutoReader]: ServiceCategory.Hematology,
  [InstrumentType.CoagDx]: ServiceCategory.Hematology,
  [InstrumentType.ProCyteDx]: ServiceCategory.Hematology,
  [InstrumentType.LaserCyte]: ServiceCategory.Hematology,
  [InstrumentType.LaserCyteDx]: ServiceCategory.Hematology,
  [InstrumentType.Tensei]: ServiceCategory.Hematology,
  [InstrumentType.SNAP]: ServiceCategory.SNAP,
  [InstrumentType.SNAPPro]: ServiceCategory.SNAP,
  [InstrumentType.SnapReader]: ServiceCategory.SNAP,
  [InstrumentType.SNAPshotDx]: ServiceCategory.SNAP,
  [InstrumentType.ManualUA]: ServiceCategory.Urinalysis,
  [InstrumentType.UAAnalyzer]: ServiceCategory.Urinalysis,
  [InstrumentType.UriSysDx]: ServiceCategory.Urinalysis,
  [InstrumentType.SediVueDx]: ServiceCategory.Urinalysis,
  [InstrumentType.ManualCRP]: ServiceCategory.Chemistry,
  [InstrumentType.VetLyte]: ServiceCategory.Chemistry,
  [InstrumentType.VetStat]: ServiceCategory.Chemistry,
  [InstrumentType.VetTest]: ServiceCategory.Chemistry,
  [InstrumentType.CatalystOne]: ServiceCategory.Chemistry,
  [InstrumentType.CatalystDx]: ServiceCategory.Chemistry,
  [InstrumentType.InterlinkPims]: ServiceCategory.Other,
  [InstrumentType.SerialPims]: ServiceCategory.Other,
  [InstrumentType.Theia]: ServiceCategory.Hematology,
};
