import {
  EarSwabRunConfigurationDto,
  ExecuteInstrumentRunDto,
  InstrumentRunConfigurationDto,
  SampleTypesMapping,
  TheiaClinicalSigns,
  TheiaSampleLocation,
  TheiaSite,
  TheiaSubsite,
} from "@viewpoint/api";

function isEarSwabType(runConfig?: InstrumentRunConfigurationDto) {
  return SampleTypesMapping.EAR_SWAB === runConfig?.sampleTypeId;
}

export function createEarSwabRunConfig(
  sampleLocation: TheiaSampleLocation,
  isOtitisPresent: boolean
): EarSwabRunConfigurationDto {
  const clinicalSigns = isOtitisPresent ? [TheiaClinicalSigns.PRESENT] : [];
  return {
    theiaSite: TheiaSite.EAR,
    theiaSampleLocation: sampleLocation,
    theiaSubsite: TheiaSubsite.INDETERMINATE,
    theiaClinicalSigns: clinicalSigns,
  };
}

export function validEarSwabRun(run: ExecuteInstrumentRunDto) {
  return (
    run.instrumentRunConfigurations != null &&
    run.instrumentRunConfigurations.length > 0 &&
    run.instrumentRunConfigurations.every(isEarSwabType)
  );
}
