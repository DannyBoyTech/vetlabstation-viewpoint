export interface ManualUAResults {
  collectionMethod?: CollectionMethod;
  color?: Color;
  clarity?: Clarity;
  specificGravity?: number;
  sgGreaterThan?: boolean;
  ph?: PHValues;
  chemistries?: { [key in ChemistryTypes]?: ChemistryResult };
  comment?: string;
}

export type PHValues = (typeof PHValues)[keyof typeof PHValues];
export const PHValues = {
  "5": 5.0,
  "6": 6.0,
  "6.5": 6.5,
  "7": 7.0,
  "8": 8.0,
  "9": 9.0,
} as const;

export type CollectionMethod =
  (typeof CollectionMethod)[keyof typeof CollectionMethod];
export const CollectionMethod = {
  Cystocentesis: "Cystocentesis",
  FreeCatch: "FreeCatch",
  TableTop: "TableTop",
  Catheterization: "Catheterization",
  Other: "Other",
  NotSpecified: "NotSpecified",
} as const;

export type Color = (typeof Color)[keyof typeof Color];
export const Color = {
  Colorless: "Colorless",
  Straw: "Straw",
  PaleYellow: "PaleYellow",
  DarkYellow: "DarkYellow",
  Amber: "Amber",
  Orange: "Orange",
  Pink: "Pink",
  Red: "Red",
  Brown: "Brown",
  Green: "Green",
  Other: "Other",
} as const;

export type Clarity = (typeof Clarity)[keyof typeof Clarity];
export const Clarity = {
  Clear: "Clear",
  SlightlyCloudy: "SlightlyCloudy",
  Cloudy: "Cloudy",
  VeryCloudy: "VeryCloudy",
  Opaque: "Opaque",
} as const;

export type ChemistryTypes =
  (typeof ChemistryTypes)[keyof typeof ChemistryTypes];
export const ChemistryTypes = {
  BLD: "mBLD",
  HGB: "mHGB",
  BIL: "mBIL",
  UBG: "mUBG",
  KET: "mKET",
  GLU: "mGLU",
  PRO: "mPRO",
  LEU: "mLEU",
} as const;

export type ChemistryResult =
  (typeof ChemistryResult)[keyof typeof ChemistryResult];
export const ChemistryResult = {
  Negative: "Negative",
  Normal: "Normal",
  Trace: "Trace",
  PlusOne: "1+",
  PlusTwo: "2+",
  PlusThree: "3+",
  PlusFour: "4+",
} as const;

export type AdditionalAssays =
  (typeof AdditionalAssays)[keyof typeof AdditionalAssays];
export const AdditionalAssays = {
  PH: "mpH",
  SpecificGravity: "mSG",
  Color: "Color",
  Clarity: "Clar",
  CollectionMethod: "Collec",
} as const;

export type ManualUAAssays = ChemistryTypes | AdditionalAssays;
