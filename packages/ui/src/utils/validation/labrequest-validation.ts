import {
  ExecuteInstrumentRunDto,
  ExecuteLabRequestDto,
  InstrumentStatusDto,
  InstrumentType,
  RunConfiguration,
} from "@viewpoint/api";

export interface PartialExecuteLabRequestDto
  extends Omit<Partial<ExecuteLabRequestDto>, "instrumentRunDtos"> {
  instrumentRunDtos?: Partial<ExecuteInstrumentRunDto>[];
}

export function validateExecuteLabRequest(
  labRequest: PartialExecuteLabRequestDto,
  instruments: InstrumentStatusDto[],
  requireReqId?: boolean,
  addTest?: boolean,
  censusRequest?: boolean
): boolean {
  if (labRequest.refClassId == null) {
    return false;
  }
  if (
    labRequest.instrumentRunDtos == null ||
    labRequest.instrumentRunDtos.length === 0
  ) {
    return false;
  }
  if (
    !addTest &&
    !censusRequest &&
    requireReqId &&
    (labRequest.requisitionId == null || labRequest.requisitionId.length === 0)
  ) {
    return false;
  }
  for (const run of labRequest.instrumentRunDtos) {
    if (
      validateExecuteRunRequest(
        run,
        instruments.find((is) => is.instrument.id === run.instrumentId)
      ) !== RunValidationResult.Valid
    ) {
      return false;
    }
  }
  return true;
}

export function validateExecuteRunRequest(
  run: Partial<ExecuteInstrumentRunDto>,
  currentInstrumentStatus?: InstrumentStatusDto
): RunValidationResult {
  if (currentInstrumentStatus == null) {
    // Should we return false here? The instrument should exist, but if it doesn't should we let them submit and handle an error? Or prevent submitting?
    return RunValidationResult.NoInstrument;
  }
  if (
    currentInstrumentStatus.instrument.supportedRunConfigurations.includes(
      RunConfiguration.SAMPLE_TYPE
    ) &&
    (run.instrumentRunConfigurations == null ||
      run.instrumentRunConfigurations.every((rc) => rc.sampleTypeId == null))
  ) {
    return RunValidationResult.NoSampleType;
  }
  if (
    currentInstrumentStatus.instrument.instrumentType === InstrumentType.SNAP &&
    run.snapDeviceId == null
  ) {
    return RunValidationResult.NoSnapTests;
  }

  return RunValidationResult.Valid;
}

export const RunValidationResult = {
  Valid: "Valid",
  NoInstrument: "NoInstrument", // Can't find a matching current instrument -- this really should never happen
  NoSampleType: "NoSampleType", // Sample type is required, but doesn't exist in run config
  NoSnapTests: "NoSnapTests", // SNAP instrument is selected but has no snapDeviceId (indicating an actual SNAP test hasn't been chosen from the dropdown)
} as const;

type RunValidationResult =
  (typeof RunValidationResult)[keyof typeof RunValidationResult];
