import {
  ExecuteInstrumentRunDto,
  FnaRunConfigurationDto,
  SampleTypesMapping,
  TheiaSite,
  TheiaSubsite,
} from "@viewpoint/api";

export function isValidFnaRunConfig(
  config: Partial<FnaRunConfigurationDto>
): boolean {
  return (
    config.sampleSource != null &&
    hasValidSampleLocation(config) &&
    hasValidLesionAppearance(config)
  );
}

export function isFnaSampleType(run: ExecuteInstrumentRunDto) {
  return run.instrumentRunConfigurations.every(
    (irc) => irc.sampleTypeId === SampleTypesMapping.FNA
  );
}

export function hasValidSampleLocation(
  config: Partial<FnaRunConfigurationDto>
): boolean {
  return (
    config.theiaSampleLocation != null &&
    config.theiaSite != null &&
    config.theiaSubsite != null
  );
}

export function hasValidLesionAppearance(
  config: Partial<FnaRunConfigurationDto>
): boolean {
  return (
    config.circumference != null ||
    config.elevation != null ||
    config.softness != null ||
    config.surface != null ||
    config.hair != null ||
    config.color != null ||
    config.mobility != null ||
    config.other != null
  );
}

const MAPPED_SUBSITES: Record<TheiaSite, TheiaSubsite[]> = Object.keys(
  TheiaSubsite
).reduce((prev, curr) => {
  // Would be great if these were just broken out into distinct enums, but for now
  // just duplicating the existing IVLS data structure which has all the available
  // options in one enum
  const site: TheiaSite = Object.keys(TheiaSite).find((s) =>
    curr.includes(s)
  ) as TheiaSite;
  if (prev[site] == null) {
    prev[site] = [];
  }
  prev[site].push(curr as TheiaSubsite);
  return prev;
}, {} as Record<TheiaSite, TheiaSubsite[]>);

export function getSubsitesForSite(site: TheiaSite): TheiaSubsite[] {
  return MAPPED_SUBSITES[site] ?? [];
}

// Valid value types for the FnaRunConfigurationDto
export type ValidFnaConfigTypes =
  FnaRunConfigurationDto[keyof FnaRunConfigurationDto];
// Utility type for extracting the individual values of array types
export type IndividualElementType<T> = T extends Array<infer U> ? U : T;
// Individual types of the valid FNA config types. eg. since FNA config key
// "recentVaccination" has Area[] as a type, this will include the singular Area type.
export type IndividualFnaConfigTypes =
  IndividualElementType<ValidFnaConfigTypes>;

// Update a multi-element field on the FNA run configuration
export function updateMultiElementField(
  config: Partial<FnaRunConfigurationDto>,
  key: keyof FnaRunConfigurationDto,
  value: IndividualFnaConfigTypes,
  checked: boolean
): Partial<FnaRunConfigurationDto> {
  const updated = { ...config };
  if (checked) {
    (updated[key] as unknown) = [...((updated[key] as unknown[]) ?? []), value];
  } else {
    (updated[key] as unknown[]) = (updated[key] as unknown[]).filter(
      (v) => v !== value
    );
    if ((updated[key] as unknown[]).length === 0) {
      delete updated[key];
    }
  }
  return updated;
}
