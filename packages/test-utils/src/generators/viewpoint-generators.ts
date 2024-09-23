import faker from "faker";
import {
  AcadiaQualityControlLotDto,
  AlertDto,
  AssayDto,
  CatalystQualityControlLotDto,
  ClientDto,
  DetailedInstrumentStatusDto,
  DoctorDto,
  EventIds,
  HealthCode,
  InstrumentAlertDto,
  InstrumentDto,
  InstrumentProgressEvent,
  InstrumentResultDto,
  InstrumentRunDto,
  InstrumentRunStatus,
  InstrumentStatus,
  InstrumentStatusDto,
  InstrumentType,
  InstrumentWaitingEvent,
  InstrumentWaitingReason,
  IvlsRouterDto,
  LabRequestDto,
  type LabRequestRecordDto,
  MostRecentResultEnum,
  PatientDto,
  PatientGender,
  PatientWeightUnitsEnum,
  PimsRequestDto,
  ProgressType,
  QcLotDto,
  QualifierTypeEnum,
  QualityControlBarcodeDto,
  QualityControlBarcodeInterpretationDto,
  QualityControlBarcodeSetDto,
  QualityControlBarcodeSetStatus,
  QualityControlBarcodeStatus,
  QualityControlDto,
  QualityControlFluidCode,
  QualityControlFluidType,
  QualityControlReferenceRangeDto,
  QualityControlRunRecordDto,
  RecentResultDto,
  RefClassDto,
  ReferenceClassType,
  RemovableDriveDto,
  RouterType,
  RunConfiguration,
  RunningInstrumentRunDto,
  RunningLabRequestDto,
  ServiceCategory,
  SnapProInstrumentStatusDto,
  SpeciesType,
  TestOrderDto,
  WanIpChoiceEnum,
} from "@viewpoint/api";
import dayjs from "dayjs";
import {
  randomArrayOf,
  randomFrom,
  randomInteger,
  randomNumericString,
} from "../random";

export const IHD_SERVICE_NAMES = [
  "Chem 10",
  "Chem 17",
  "NSAID",
  "CBC",
  "4Dx Plus",
  "Urinalysis",
  "Wellness Panel",
];

export const BREEDS: { [key: string]: string[] } = {
  Canine: [
    "Boxer",
    "Pug",
    "Mastiff",
    "Golden Retriever",
    "Poodle",
    "Huskey",
    "Pitbull",
  ],
  Feline: ["Maine Coon", "Persian", "Sphynx", "Bengal", "Birman"],
  Equine: ["Arabian", "Thoroughbred", "Appaloosa", "Friesian", "Clydesdale"],
};

export const UNRUNNABLE_INSTRUMENT_TYPES = [
  InstrumentType.InterlinkPims,
  InstrumentType.ManualCRP,
  InstrumentType.ManualUA,
  InstrumentType.SnapReader,
  InstrumentType.SerialPims,
  InstrumentType.LaserCyte,
  InstrumentType.LaserCyteDx,
] as const;
export type UnrunnableInstrumentType =
  (typeof UNRUNNABLE_INSTRUMENT_TYPES)[number];

export const RUNNABLE_INSTRUMENT_TYPES: InstrumentType[] = Object.values(
  InstrumentType
).filter(
  (type) =>
    !UNRUNNABLE_INSTRUMENT_TYPES.includes(type as UnrunnableInstrumentType)
);
export type RunnableInstrumentType = Exclude<
  InstrumentType,
  (typeof UNRUNNABLE_INSTRUMENT_TYPES)[number]
>;

export const randomInstrumentSerialNumber = () =>
  faker.datatype.uuid().split("-")[0] as string;

export const randomRunnableInstrumentTypeEnum = (): InstrumentType =>
  randomFrom(RUNNABLE_INSTRUMENT_TYPES);

export const randomPimsRequestDto = (
  provided?: Partial<PimsRequestDto>
): PimsRequestDto => {
  const patient = randomPatientDto();
  const client = randomClientDto();
  return {
    id: faker.datatype.number(500),
    requisitionId: faker.datatype.uuid(),
    pimsRequestUUID: faker.datatype.uuid(),
    patientName: patient.patientName,
    patientBreed: patient.breedDto,
    patientGender: patient.genderDto,
    patientSpecies: patient.speciesDto,
    patientDob: patient.birthDate,
    patientWeight: Number(patient.lastKnownWeight),
    patientWeightUnits: PatientWeightUnitsEnum.POUNDS,
    pimsPatientId: patient.pimsPatientId!,
    clientFirstName: client.firstName,
    clientLastName: client.lastName,
    pimsClientId: client.pimsClientId,
    pimsServiceRequests: randomServiceList().map((service) => ({
      profileName: service,
    })),
    dateRequestedUtc: Date.now(),
    ...provided,
  };
};

export const randomPatientDto = (
  provided: Partial<PatientDto> = {}
): PatientDto => {
  const speciesType = randomFrom(Object.values(SpeciesType));
  return {
    id: faker.datatype.number(100),
    patientName: faker.name.firstName(),
    pimsPatientId: faker.datatype.uuid(),
    birthDate: dayjs(faker.date.past(12)).format("YYYY-MM-DD"),
    genderDto: {
      id: faker.datatype.number(100),
      genderName: randomFrom(Object.values(PatientGender)),
    },
    speciesDto: {
      id: faker.datatype.number(100),
      speciesName: speciesType,
      speciesClass: randomFrom(Object.values(ReferenceClassType)),
    },
    clientDto: randomClientDto(),
    ...provided,
  };
};

export const randomRefClass = (
  provided: Partial<RefClassDto> = {}
): RefClassDto => ({
  id: 2,
  refClassName: "Adult Canine",
  refClassSubTypeCode: "L",
  ...provided,
});

export const randomDoctor = (): DoctorDto => ({
  id: faker.datatype.number(100),
  lastName: faker.name.lastName(),
  firstName: faker.name.firstName(),
  middleName: faker.name.middleName(),
  isSuppressed: false,
});

export const randomClientDto = (provided?: Partial<ClientDto>): ClientDto => ({
  lastName: faker.name.lastName(),
  firstName: faker.name.firstName(),
  pimsClientId: faker.datatype.uuid(),
  clientId: faker.datatype.uuid(),
  id: faker.datatype.number(100),
  ...provided,
});

export const randomService = (): string => randomFrom(IHD_SERVICE_NAMES);

export const randomInstrumentDto = (
  provided: Partial<InstrumentDto> = {}
): InstrumentDto => ({
  id: faker.datatype.number(100),
  instrumentType: randomFrom(Object.values(RUNNABLE_INSTRUMENT_TYPES)),
  instrumentSerialNumber: randomInstrumentSerialNumber(),
  supportedRunConfigurations: [randomFrom(Object.values(RunConfiguration))],
  runnable: true,
  displayOrder: faker.datatype.number(100),
  manualEntry: faker.datatype.boolean(),
  softwareVersion: faker.system.semver(),
  ipAddress: faker.internet.ip(),
  supportsInstrumentScreen: true,
  maxQueueableRuns: 2,
  ...provided,
});

export const randomInstrumentStatus = (
  provided?: Partial<InstrumentStatusDto>
): InstrumentStatusDto =>
  ({
    instrumentStatus: randomFrom(Object.values(InstrumentStatus)),
    connected: true,
    instrument: randomInstrumentDto(),
    ...provided,
  } as InstrumentStatusDto);

export const randomDetailedInstrumentStatus = (
  provided?: Partial<DetailedInstrumentStatusDto>
): DetailedInstrumentStatusDto => ({
  status: HealthCode.READY,
  instrument: randomInstrumentDto(),
  ...provided,
});

let lastLrId = 0;
export const randomLabRequest = (
  provided: Partial<LabRequestDto> = {}
): LabRequestDto => ({
  id: lastLrId++,
  patientDto: randomPatientDto(provided?.patientDto),
  instrumentRunDtos: new Array(Math.floor(Math.random() * 5) + 1)
    .fill({})
    .map(() => randomInstrumentRun()),
  requestDate: Date.now(),
  containsMergedRuns: faker.datatype.boolean(),
  containsManualUaResults: faker.datatype.boolean(),
  ...provided,
});

export const randomLabRequestRecord = (
  provided: Partial<LabRequestRecordDto> = {}
): LabRequestRecordDto => ({
  labRequestId: lastLrId++,
  labRequestDate: Date.now(),
  deviceUsageMap: {},
  ...provided,
});

export const randomRunningInstrumentRun = (
  provided: Partial<RunningInstrumentRunDto> = {}
): RunningInstrumentRunDto => ({
  id: lastRunId++,
  testDate: Date.now(),
  timeRemaining: randomFrom([undefined, Math.random() * 600 * 1000]),
  progress: randomFrom([undefined, Math.random()]),
  instrumentId: lastInstrumentId++,
  instrumentType: randomRunnableInstrumentTypeEnum(),
  serviceCategory: randomFrom(Object.values(ServiceCategory)),
  editable: false,
  hasDotPlots: false,
  status: randomFrom(Object.values(InstrumentRunStatus)),
  displayOrder: faker.datatype.number(20),
  ...provided,
});

export const randomRunningLabRequest = (
  provided: Partial<RunningLabRequestDto> = {}
): RunningLabRequestDto => ({
  id: lastLrId++,
  patientDto: randomPatientDto(provided?.patientDto),
  instrumentRunDtos: new Array(Math.floor(Math.random() * 5) + 1)
    .fill({})
    .map(() => randomRunningInstrumentRun()),
  requestDate: Date.now(),
  profileTests: randomServiceList(),
  ...provided,
});

let lastRunId = 0;
let lastInstrumentId = 0;
export const randomInstrumentRun = (
  provided: Partial<InstrumentRunDto> = {}
): InstrumentRunDto =>
  ({
    id: lastRunId++,
    testDate: Date.now(),
    timeRemaining: Math.random() * 600 * 1000,
    instrumentId: lastInstrumentId++,
    instrumentType: randomRunnableInstrumentTypeEnum(),
    serviceCategory: randomFrom(Object.values(ServiceCategory)),
    editable: false,
    status: randomFrom(Object.values(InstrumentRunStatus)),
    displayOrder: faker.datatype.number(20),
    instrumentResultDtos: new Array(faker.datatype.number(15))
      .fill(1)
      .map(randomInstrumentResult),
    ...provided,
  } as unknown as InstrumentRunDto);

export const randomServiceList = (): string[] =>
  Array.from(
    new Set(
      new Array(randomFrom([1, 2, 3, 4, 5])).fill({}).map(() => randomService())
    )
  );

const Assays = [
  "CREA",
  "GLU",
  "BUN",
  "ALKP",
  "ALB",
  "WBC",
  "RBC",
  "MCV",
  "RDW",
  "NEU",
  "LYM",
  "EOS",
  "BASO",
  "Clarity",
  "TP",
  "CHOL",
  "Na",
];

const Units = ["g/dL", "M/μL", "pg", "fL", "%"];

export const randomInstrumentResult = (
  provided: Partial<InstrumentResultDto> = {}
): InstrumentResultDto => {
  const assay = provided.assay ?? randomFrom(Assays);
  const refLow = provided.referenceLow ?? faker.datatype.number(20);
  const refHigh = provided.referenceHigh ?? faker.datatype.number(1000) + 20;
  const result = `${faker.datatype.number(100)}.${faker.datatype.number(100)}`;
  const resultParsed = parseFloat(result);

  return {
    id: faker.datatype.number(1000),
    testOrderId: faker.datatype.number(1000),
    resultText: "",
    result: result,
    speedBarMax: refHigh + faker.datatype.number(100),
    speedBarMin: Math.min(0, refLow - faker.datatype.number(10)),
    referenceHigh: refHigh,
    referenceLow: refLow,
    assayTypeId: faker.datatype.number(100),
    assayIdentityName: assay,
    assay: assay,
    sortOrderOrgan: faker.datatype.number(100),
    sortOrderAlpha: faker.datatype.number(100),
    assayUnits: randomFrom(Units),
    qualifierString: "OKAY",
    displayCharacter: "=",
    requiresUserInput: false,
    precision: 1,
    conversion: 1,
    resultValue: result,
    resultValueForDisplay: result,
    displayCategory: true,
    referenceRangeString: `${refLow} - ${refHigh}`,
    crimsonIndentedAssay: false,
    outOfRangeFlag: "LOW",
    outOfRangeHigh: resultParsed > refHigh,
    outOfRangeLow: resultParsed < refLow,
    abnormal: false,
    qualifierType: QualifierTypeEnum.EQUALITY,
    instrumentType: randomFrom(
      RUNNABLE_INSTRUMENT_TYPES.filter(
        (it) =>
          ![
            InstrumentType.SNAP,
            InstrumentType.SNAPPro,
            InstrumentType.SNAPshotDx,
          ].includes(it)
      )
    ),
    ...provided,
  };
};

export const randomQualityControlDto = (
  provided?: Partial<QualityControlDto>
): QualityControlDto => ({
  id: faker.datatype.number({ min: 0 }),
  instrumentType: randomRunnableInstrumentTypeEnum(),
  lotNumber: faker.datatype.string(6),
  enabled: faker.datatype.boolean(),
  canRun: faker.datatype.boolean(),
  qcReferenceRangeDtos: randomArrayOf({
    valueFn: () => randomQualityControlReferenceRangeDto(),
  }),
  mostRecentRunDate: faker.date.recent().getTime(),
  dateEntered: faker.date.recent().getTime(),
  dateExpires: faker.date.recent().getTime(),

  ...provided,
});

export const randomSnapProInstrumentStatus = (
  provided?: Partial<SnapProInstrumentStatusDto>
): SnapProInstrumentStatusDto =>
  ({
    patientName: faker.name.firstName() + " " + faker.name.lastName(),
    connected: faker.datatype.boolean(),
    instrument: randomInstrumentDto(),
    instrumentStatus: randomInstrumentStatus(),
    instrumentIconStyle: faker.random.alphaNumeric(10),
    instrumentStatusImageKey: faker.random.alphaNumeric(10),
    lastConnectedDate: faker.datatype.datetime(),
    softwareVersion: faker.system.semver(),
    ...provided,
  } as SnapProInstrumentStatusDto);

export const randomQcLotDto = (provided?: Partial<QcLotDto>): QcLotDto => ({
  id: faker.datatype.number({ min: 0 }),
  lotNumber: faker.datatype.string(6),
  level: `${faker.datatype.number({ max: 100 })}`,
  fluidType: faker.datatype.number({ max: 100 }),
  controlType: "",
  ...provided,
});

export const randomCatalystQualityControlDto = (
  provided?: Partial<CatalystQualityControlLotDto>
): CatalystQualityControlLotDto => ({
  ...randomQualityControlDto(),
  calibrationVersion: faker.datatype.float({ min: 0, max: 10 }).toString(),
  controlType: faker.datatype.string(),
  ...provided,
});

export const randomQualityControlReferenceRangeDto = (
  provided?: Partial<QualityControlReferenceRangeDto>
): QualityControlReferenceRangeDto => ({
  assayDto: randomAssayDto(),
  veryLow: faker.datatype.number().toString(),
  veryLowFloat: faker.datatype.float(),
  low: faker.datatype.number().toString(),
  lowFloat: faker.datatype.float(),
  high: faker.datatype.number().toString(),
  highFloat: faker.datatype.float(),
  veryHigh: faker.datatype.number().toString(),
  veryHighFloat: faker.datatype.float(),
  slideLotNumber: faker.datatype.number().toString(),
  target: faker.datatype.string(),

  ...provided,
});

export const randomAssayDto = (provided?: Partial<AssayDto>): AssayDto => ({
  id: faker.datatype.number({ min: 0 }),
  assayIdentityName: randomFrom(Assays),
  sampleTypeId: faker.datatype.number({ min: 0 }),
  associatedDeviceId: faker.datatype.number({ min: 0 }),
  assayOrderAlpha: faker.datatype.number({ min: 0 }),
  assayOrderOrgan: faker.datatype.number({ min: 0 }),
  conversionFactor: faker.datatype.number({ min: 0, max: 1 }),
  precision: faker.datatype.number({ min: 0, max: 1 }),
  ...provided,
});

export function randomInstrumentWaitingEvent(
  provided?: Partial<InstrumentWaitingEvent>
): InstrumentWaitingEvent {
  const random = {
    id: EventIds.InstrumentWaiting,
    instrument: randomInstrumentDto(),
    waitingReason: randomFrom(Object.values(InstrumentWaitingReason)),
  };
  return { ...random, ...provided };
}

export function randomInstrumentProgressEvent(
  provided?: Partial<InstrumentProgressEvent>
): InstrumentProgressEvent {
  const random = {
    id: EventIds.InstrumentProgress,
    instrumentId: faker.datatype.number({ min: 1, max: 100 }),
    progress: faker.datatype.number({ min: 0, max: 100 }),
    progressType: randomFrom(Object.values(ProgressType)),
  };
  return { ...random, ...provided };
}

export function randomQualityControlRunRecordDto(
  provided?: Partial<QualityControlRunRecordDto>
): QualityControlRunRecordDto {
  return {
    labRequestId: lastLrId++,
    testDate: faker.date.past(5).getTime(),
    qualityControl: randomQualityControlDto(),
    instrumentId: lastInstrumentId++,
    instrumentType: randomRunnableInstrumentTypeEnum(),
    instrumentSerialNumber: randomInstrumentSerialNumber(),
    ...provided,
  };
}

export const randomRemovableDriveDto = (
  provided?: Partial<RemovableDriveDto>
): RemovableDriveDto => ({
  id: faker.datatype.uuid(),
  label: `USB ${faker.datatype.number(100)}(${faker.random.alpha({
    count: 1,
    upcase: true,
  })}:)`,
  serialNumber: faker.datatype.uuid(),
  capacity: 34_359_738_368,
  freeSpace: 34_359_738_368,
  ...provided,
});

export const randomRecentResult = (
  provided?: Partial<RecentResultDto>
): RecentResultDto => ({
  labRequestId: lastLrId++,
  patientName: faker.name.firstName(),
  speciesName: randomFrom(Object.values(SpeciesType)),
  speciesId: 1,
  clientLastName: randomClientDto().lastName,
  clientFirstName: randomClientDto().firstName,
  clientId: randomClientDto().clientId,
  testTypes: [],
  instrumentTypes: [],
  dateRequested: Date.now(),
  mostRecentRunDate: dayjs().unix(),
  controlPatient: false,
  ...provided,
});

export const randomIvlsRouterDto = (
  provided?: Partial<IvlsRouterDto>
): IvlsRouterDto => ({
  defaultLocalIpAddress: faker.internet.ip(),
  gateway: faker.internet.ip(),
  ipAddress: faker.internet.ip(),
  localIpAddress: faker.internet.ip(),
  modelName: faker.random.alpha({ count: 15 }),
  primaryDnsServer: faker.internet.ip(),
  routerType: randomFrom(Object.values(RouterType)),
  smartServiceModelName: faker.random.alpha({ count: 15 }),
  subnetMask: faker.internet.ip(),
  wanIpChoice: randomFrom(Object.values(WanIpChoiceEnum)),
  wanIpChoices: Object.values(WanIpChoiceEnum),
  wireless: faker.datatype.boolean(),
  wirelessEnabled: faker.datatype.boolean(),
  wirelessPassphrase: faker.datatype.string(13),
  ...provided,
});

export const randomAcadiaQualityControlLotDto = (
  provided?: Partial<AcadiaQualityControlLotDto>
) => {
  let qcReferenceRangeDtos = provided?.qcReferenceRangeDtos;

  if (qcReferenceRangeDtos == null) {
    qcReferenceRangeDtos = [];

    const numRuns = faker.datatype.number({ min: 0, max: 4 });
    for (let i = 0; i < numRuns; i++) {
      qcReferenceRangeDtos.push(randomQualityControlReferenceRangeDto());
    }
  }

  return {
    "@c": ".AcadiaQualityControlLotDto",
    id: faker.datatype.number(100),
    instrumentType: InstrumentType.ProCyteOne,
    lotNumber: `SMARTQC${faker.datatype.number({ min: 100, max: 999 })}`,
    dateEntered: faker.datatype.datetime(),
    dateExpires: faker.datatype.datetime(),
    enabled: faker.datatype.boolean(),
    canRun: faker.datatype.boolean(),
    isExpired: faker.datatype.boolean(),
    qcReferenceRangeDtos,
    mostRecentRunDate: faker.datatype.datetime(),
    expirationOpenDate: faker.datatype.datetime(),
    mostRecentResult: randomFrom(Object.values(MostRecentResultEnum)),
    ...provided,
  };
};

export function randomQualityControlInterpretationDto(
  provided?: Partial<QualityControlBarcodeInterpretationDto>
): QualityControlBarcodeInterpretationDto {
  return {
    fluidType: randomFrom(Object.values(QualityControlFluidType)),
    fluidCode: randomFrom(Object.values(QualityControlFluidCode)),
    lotNumber: faker.datatype.number({ min: 1 }),
    expirationDate: faker.datatype.datetime().getDate(),
    rbcLow: faker.datatype.number({ min: 0, max: 49 }),
    rbcHigh: faker.datatype.number({ min: 50, max: 99 }),
    wbcLow: faker.datatype.number({ min: 0, max: 49 }),
    wbcHigh: faker.datatype.number({ min: 50, max: 99 }),
    checkDigit: faker.datatype.number({ min: 0, max: 9 }),

    fluidTypeValid: faker.datatype.boolean(),
    fluidCodeValid: faker.datatype.boolean(),
    lotNumberValid: faker.datatype.boolean(),
    expirationDateValid: faker.datatype.boolean(),
    rbcLowValid: faker.datatype.boolean(),
    rbcHighValid: faker.datatype.boolean(),
    wbcLowValid: faker.datatype.boolean(),
    wbcHighValid: faker.datatype.boolean(),
    checkDigitValid: faker.datatype.boolean(),

    ...provided,
  };
}

export function randomQualityControlBarcodeDto(
  provided?: Partial<QualityControlBarcodeDto>
): QualityControlBarcodeDto {
  return {
    barcode: randomNumericString(faker.datatype.number({ min: 0, max: 23 })),
    barcodeStatus: randomFrom(Object.values(QualityControlBarcodeStatus)),
    expired: faker.datatype.boolean(),
    sequenceNumber: faker.datatype.number({ min: 1 }),
    barcodeInterpretation: randomQualityControlInterpretationDto(),
    ...provided,
  };
}

export function randomQualityControlBarcodeSetDto(
  provided?: Partial<QualityControlBarcodeSetDto>
): QualityControlBarcodeSetDto {
  return {
    barcodes: [],
    barcodeSetStatus: randomFrom(Object.values(QualityControlBarcodeSetStatus)),
    ...provided,
  };
}

export function randomInstrumentAlertDto(
  provided?: Partial<InstrumentAlertDto>
): InstrumentAlertDto {
  return {
    alerts: randomArrayOf({
      valueFn: () => randomAlertDto(),
      length: randomInteger({ maxExcl: 10, minIncl: 1 }),
    }),
    instrumentId: faker.datatype.number(100),
    ...provided,
  };
}

export function randomAlertDto(provided?: Partial<AlertDto>): AlertDto {
  return {
    args: {},
    name: faker.datatype.uuid(),
    uniqueId: faker.datatype.uuid(),
    ...provided,
  };
}

export const randomTestOrders = (
  provided: Partial<TestOrderDto> = {}
): TestOrderDto =>
  ({
    id: lastRunId++,
    testOrderUuid: faker.datatype.uuid(),
    fnaRunConfigurationDto: null,
    bloodRunConfigurationDto: null,
    ...provided,
  } as unknown as TestOrderDto);
