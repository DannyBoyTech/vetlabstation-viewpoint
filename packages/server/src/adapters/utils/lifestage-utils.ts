import { PatientGender, ReferenceClassType, SpeciesType } from "@viewpoint/api";

export const SpeciesLifestageMapping = {
  [SpeciesType.Canine]: {
    Puppy: {
      low: 0,
      high: 180,
    },
    "Adult Canine": {
      low: 180,
      high: 8 * 365,
    },
    "Geriatric Canine": {
      low: 8 * 365,
      high: Number.MAX_SAFE_INTEGER,
    },
  },
  [SpeciesType.Feline]: {
    Kitten: {
      low: 0,
      high: 180,
    },
    "Adult Feline": {
      low: 180,
      high: 8 * 365,
    },
    "Geriatric Feline": {
      low: 8 * 365,
      high: Number.MAX_SAFE_INTEGER,
    },
  },
  [SpeciesType.Equine]: {
    Foal: {
      low: 0,
      high: 365,
    },
    Yearling: {
      low: 365,
      high: 2 * 365,
    },
    "Adult Equine": {
      low: 2 * 365,
      high: Number.MAX_SAFE_INTEGER,
    },
  },
} as Record<string, Record<string, { low: number; high: number }>>;

export const calculateLifestage = (
  speciesType: SpeciesType,
  ageInDays: number,
  gender?: PatientGender
): string | undefined => {
  if (speciesType === SpeciesType.Bovine) {
    // Special case based on gender
    if (gender === PatientGender.FEMALE_SPAYED || gender === PatientGender.FEMALE_INTACT) {
      return "Dairy Cow";
    } else {
      return "Beef Cattle";
    }
  }
  return Object.keys(SpeciesLifestageMapping[speciesType] ?? {}).find((lifestage) => {
    const mapping = SpeciesLifestageMapping[speciesType]?.[lifestage];
    return mapping && ageInDays >= mapping.low && ageInDays < mapping.high;
  });
};

const LifeStageSpecies = [SpeciesType.Canine, SpeciesType.Feline, SpeciesType.Equine];

const TypeSpecies = [SpeciesType.Bovine, SpeciesType.Avian];

export const getRefClassType = (speciesType: SpeciesType): ReferenceClassType => {
  if (LifeStageSpecies.includes(speciesType)) {
    return ReferenceClassType.LifeStage;
  } else if (TypeSpecies.includes(speciesType)) {
    return ReferenceClassType.Type;
  } else {
    return ReferenceClassType.Other;
  }
};
