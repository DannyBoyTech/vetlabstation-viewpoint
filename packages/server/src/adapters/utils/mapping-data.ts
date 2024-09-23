// Instruments that treat progress info as a countdown instead of a percentage
import {
  DilutionTypeEnum,
  InstrumentRunStatus,
  InstrumentType,
  QualifierTypeEnum,
  SampleTypeEnum,
  ServiceCategory,
  ServiceCategoryMappings,
} from "@viewpoint/api";

export const CountdownInstruments: InstrumentType[] = [
  InstrumentType.CatalystOne,
  InstrumentType.ProCyteOne,
  InstrumentType.SNAP,
  InstrumentType.UriSysDx,
  InstrumentType.Theia,
];
export const ManualEntryInstruments: InstrumentType[] = [
  InstrumentType.ManualUA,
  InstrumentType.ManualCRP,
  InstrumentType.SNAP,
];
export const CancelRunInstruments: InstrumentType[] = [
  InstrumentType.SNAP,
  InstrumentType.SNAPPro,
  InstrumentType.ProCyteOne,
  InstrumentType.SediVueDx,
  InstrumentType.ManualUA,
  InstrumentType.CatalystDx,
  InstrumentType.SNAPshotDx,
  InstrumentType.CatalystOne,
  InstrumentType.UriSysDx,
  InstrumentType.Theia,
];
export const ORDERED_INSTRUMENTS: InstrumentType[] = [
  InstrumentType.Theia,
  InstrumentType.Tensei,
  InstrumentType.ProCyteDx,
  InstrumentType.ProCyteOne,
  InstrumentType.LaserCyteDx,
  InstrumentType.LaserCyte,
  InstrumentType.AutoReader,
  InstrumentType.CatalystDx,
  InstrumentType.CatalystOne,
  InstrumentType.VetTest,
  InstrumentType.VetStat,
  InstrumentType.VetLyte,
  InstrumentType.SNAPshotDx,
  InstrumentType.SNAPPro,
  InstrumentType.SnapReader,
  InstrumentType.ManualUA,
  InstrumentType.UriSysDx,
  InstrumentType.UAAnalyzer,
  InstrumentType.SediVueDx,
  InstrumentType.CoagDx,
  InstrumentType.SNAP,
  InstrumentType.ManualCRP,
  InstrumentType.InterlinkPims,
];

export const WHOLE_BLOOD_INSTRUMENTS = [
  InstrumentType.ProCyteOne,
  InstrumentType.LaserCyte,
  InstrumentType.LaserCyteDx,
  InstrumentType.ProCyteDx,
  InstrumentType.Tensei,
];
export const UNRUNNABLE_INSTRUMENT_TYPES: InstrumentType[] = [InstrumentType.InterlinkPims];
export const RUNNABLE_INSTRUMENT_TYPES: InstrumentType[] = Object.values(InstrumentType).filter(
  (type) => !UNRUNNABLE_INSTRUMENT_TYPES.includes(type as InstrumentType)
);
export const MANUAL_ENTRY_INSTRUMENT_TYPES: InstrumentType[] = [
  InstrumentType.SNAP,
  InstrumentType.ManualUA,
  InstrumentType.ManualCRP,
];
export const EditableInstrumentTypes: InstrumentType[] = [InstrumentType.ManualUA, InstrumentType.ManualCRP];

export const INSTRUMENT_TYPE_DEVICE_IDS: Record<InstrumentType, number> = {
  [InstrumentType.LaserCyte]: 1,
  [InstrumentType.VetTest]: 2,
  [InstrumentType.AutoReader]: 3,
  [InstrumentType.SnapReader]: 4,
  [InstrumentType.VetLyte]: 5,
  [InstrumentType.SerialPims]: 6,
  [InstrumentType.VetStat]: 7,
  [InstrumentType.UAAnalyzer]: 8,
  [InstrumentType.SNAP]: 9,
  [InstrumentType.CatalystDx]: 10,
  [InstrumentType.SNAPshotDx]: 11,
  [InstrumentType.CoagDx]: 12,
  [InstrumentType.ProCyteDx]: 13,
  [InstrumentType.InterlinkPims]: 15,
  [InstrumentType.LaserCyteDx]: 16,
  [InstrumentType.SNAPPro]: 17,
  [InstrumentType.CatalystOne]: 18,
  [InstrumentType.SediVueDx]: 19,
  [InstrumentType.ManualUA]: 20,
  [InstrumentType.ManualCRP]: 21,
  [InstrumentType.ProCyteOne]: 22,
  [InstrumentType.UriSysDx]: 23,
  [InstrumentType.Theia]: 24,
  [InstrumentType.Tensei]: 25,
};
export const fetchServiceCategory: any = (instrumentType: InstrumentType, sampleType: SampleTypeEnum) => {
  if (InstrumentType.Theia === instrumentType) {
    return SampleTypeEnum.BLOOD === sampleType ? ServiceCategory.Hematology : ServiceCategory.Pathology;
  }
  return ServiceCategoryMappings[instrumentType];
};

// All instruments support cancel run when run is in pending status
export const CancelRunStatus: InstrumentRunStatus[] = [InstrumentRunStatus.Pending];
export const QualifierTypeMapping: Record<string, QualifierTypeEnum> = {
  ["!"]: QualifierTypeEnum.NONE,
  ["="]: QualifierTypeEnum.EQUALITY,
  [">"]: QualifierTypeEnum.GREATERTHAN,
  ["<"]: QualifierTypeEnum.LESSTHAN,
  ["-"]: QualifierTypeEnum.NOTCALCULATED,
  ["~"]: QualifierTypeEnum.APPROXIMATE,
  ["?"]: QualifierTypeEnum.NOTSET,
  ["*"]: QualifierTypeEnum.SUSPECT,
  ["#"]: QualifierTypeEnum.SUSPECTAUTOREADER,
  ["@"]: QualifierTypeEnum.PENDING,
};
export const DISPLAY_ORDER: Record<InstrumentType, number> = ORDERED_INSTRUMENTS.reduce(
  (prev, curr, index) => ({
    ...prev,
    [curr]: index,
  }),
  {} as Record<InstrumentType, number>
);

export const DILUTION_CONFIGS = {
  [InstrumentType.CatalystOne]: {
    [DilutionTypeEnum.AUTOMATIC]: [1, 3, 5, 9],
    [DilutionTypeEnum.MANUAL]: new Array(9).fill(1).map((_v, index) => index + 1),
    [DilutionTypeEnum.UPCAUTOMATIC]: [20],
    defaultType: DilutionTypeEnum.AUTOMATIC,
  },
  [InstrumentType.VetTest]: {
    [DilutionTypeEnum.MANUAL]: new Array(98).fill(1).map((_v, index) => index + 1),
    defaultType: DilutionTypeEnum.MANUAL,
  },
  [InstrumentType.SediVueDx]: {
    [DilutionTypeEnum.MANUAL]: new Array(19).fill(1).map((_v, index) => index + 1),
    defaultType: DilutionTypeEnum.MANUAL,
  },
};

export function getInstrumentTypeForDeviceId(deviceId: number): InstrumentType | undefined {
  return Object.entries(INSTRUMENT_TYPE_DEVICE_IDS).find(
    ([_type, id]) => id === deviceId
  )?.[0] as unknown as InstrumentType;
}
