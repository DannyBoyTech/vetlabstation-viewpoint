import { PatientGender, ReferenceClassType, SpeciesType } from "@viewpoint/api";
import { calculateLifestage, getRefClassType } from "./lifestage-utils";

describe("calculateLifestage", () => {
  it.each([
    {
      species: SpeciesType.Canine,
      age: 0,
      lifestage: "Puppy",
    },
    {
      species: SpeciesType.Canine,
      age: 179,
      lifestage: "Puppy",
    },
    {
      species: SpeciesType.Canine,
      age: 180,
      lifestage: "Adult Canine",
    },
    {
      species: SpeciesType.Canine,
      age: 2919,
      lifestage: "Adult Canine",
    },
    {
      species: SpeciesType.Canine,
      age: 2920,
      lifestage: "Geriatric Canine",
    },
    {
      species: SpeciesType.Canine,
      age: Number.MAX_SAFE_INTEGER - 1,
      lifestage: "Geriatric Canine",
    },
    {
      species: SpeciesType.Feline,
      age: 0,
      lifestage: "Kitten",
    },
    {
      species: SpeciesType.Feline,
      age: 179,
      lifestage: "Kitten",
    },
    {
      species: SpeciesType.Feline,
      age: 180,
      lifestage: "Adult Feline",
    },
    {
      species: SpeciesType.Feline,
      age: 2919,
      lifestage: "Adult Feline",
    },
    {
      species: SpeciesType.Feline,
      age: 2920,
      lifestage: "Geriatric Feline",
    },
    {
      species: SpeciesType.Feline,
      age: Number.MAX_SAFE_INTEGER - 1,
      lifestage: "Geriatric Feline",
    },
    {
      species: SpeciesType.Equine,
      age: 0,
      lifestage: "Foal",
    },
    {
      species: SpeciesType.Equine,
      age: 364,
      lifestage: "Foal",
    },
    {
      species: SpeciesType.Equine,
      age: 365,
      lifestage: "Yearling",
    },
    {
      species: SpeciesType.Equine,
      age: 729,
      lifestage: "Yearling",
    },
    {
      species: SpeciesType.Equine,
      age: 730,
      lifestage: "Adult Equine",
    },
    {
      species: SpeciesType.Equine,
      age: Number.MAX_SAFE_INTEGER - 1,
      lifestage: "Adult Equine",
    },
  ])(`species $species at age $age yields lifestage $lifestage`, (testCase) => {
    expect(calculateLifestage(testCase.species, testCase.age)).toEqual(testCase.lifestage);
  });

  it.each([
    {
      gender: PatientGender.FEMALE_SPAYED,
      lifestage: "Dairy Cow",
    },
    {
      gender: PatientGender.FEMALE_INTACT,
      lifestage: "Dairy Cow",
    },
    {
      gender: PatientGender.MALE_NEUTERED,
      lifestage: "Beef Cattle",
    },
    {
      gender: PatientGender.MALE_INTACT,
      lifestage: "Beef Cattle",
    },
  ])("species Bovine with gender $gender yields lifestage $lifestage", (testCase) => {
    expect(
      calculateLifestage(SpeciesType.Bovine, Math.floor(Math.random() * Number.MAX_SAFE_INTEGER), testCase.gender)
    ).toEqual(testCase.lifestage);
  });
});

describe("getRefClassType", () => {
  const otherTypes: SpeciesType[] = Object.values(SpeciesType).filter(
    (type) =>
      ![SpeciesType.Canine, SpeciesType.Feline, SpeciesType.Equine, SpeciesType.Bovine, SpeciesType.Avian].includes(
        type
      )
  );

  it.each([
    {
      species: SpeciesType.Canine,
      type: ReferenceClassType.LifeStage,
    },
    {
      species: SpeciesType.Feline,
      type: ReferenceClassType.LifeStage,
    },
    {
      species: SpeciesType.Equine,
      type: ReferenceClassType.LifeStage,
    },
    {
      species: SpeciesType.Bovine,
      type: ReferenceClassType.Type,
    },
    {
      species: SpeciesType.Avian,
      type: ReferenceClassType.Type,
    },
    ...otherTypes.map((species) => ({ species, type: ReferenceClassType.Other })),
  ])("species $species yields lifestage type $type", (testCase) => {
    expect(getRefClassType(testCase.species)).toEqual(testCase.type);
  });
});
