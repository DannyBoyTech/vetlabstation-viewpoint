import { CSSProperties } from "react";

export const DotPosition = {
  // "Normal" 2, 3 and 4 Dot SNAP tests
  TopCenter: "TopCenter",
  MiddleLeft: "MiddleLeft",
  MiddleRight: "MiddleRight",
  BottomCenter: "BottomCenter",

  // SNAP tests with 5 dots (ex. 4Dx Plus, Leish 4Dx)
  FiveDot_TopLeft: "FiveDot_TopLeft",
  FiveDot_MiddleCenter: "FiveDot_MiddleCenter",
  FiveDot_MiddleLeft: "FiveDot_MiddleLeft",
  FiveDot_MiddleRight: "FiveDot_MiddleRight",
  FIveDot_BottomCenter: "FIveDot_BottomCenter",

  // Special 2 Dot SNAP tests (ex. fPL, cPL, etc.)
  TwoDot_TopLeft: "TwoDot_TopLeft",
  TwoDot_TopRight: "TwoDot_TopRight",

  // Special "inverted" 3 Dot SNAP tests (ex. Foal IgG)
  ThreeDot_TopLeft: "ThreeDot_TopLeft",
  ThreeDot_TopRight: "ThreeDot_TopRight",
  ThreeDot_MiddleCenter: "ThreeDot_MiddleCenter",

  // for when positioning is handled manually (e.g. angio detect)
  None: "None",
} as const;
export type DotPosition = (typeof DotPosition)[keyof typeof DotPosition];

// Ratio of selectable dot's height to the parent background height
export const DOT_IMAGE_RATIO = 0.2;
export const DotLayoutValues: Record<
  DotPosition,
  {
    dotStyles: CSSProperties;
    labelPosition: "left" | "right";
  }
> = {
  [DotPosition.TopCenter]: {
    dotStyles: {
      top: "5%",
      left: "50%",
      transform: "translate(-50%, 0)",
    },
    labelPosition: "left",
  },
  [DotPosition.MiddleLeft]: {
    dotStyles: {
      top: "30%",
      left: `8%`,
    },
    labelPosition: "left",
  },
  [DotPosition.MiddleRight]: {
    dotStyles: {
      top: "30%",
      right: `8%`,
    },
    labelPosition: "right",
  },
  [DotPosition.BottomCenter]: {
    dotStyles: {
      top: "57%",
      left: "50%",
      transform: "translate(-50%, 0)",
    },
    labelPosition: "right",
  },
  [DotPosition.FiveDot_TopLeft]: {
    dotStyles: {
      top: "5%",
      left: `5%`,
    },
    labelPosition: "left",
  },
  [DotPosition.FiveDot_MiddleCenter]: {
    dotStyles: {
      top: "28%",
      left: "50%",
      transform: "translate(-50%, 0)",
    },
    labelPosition: "left",
  },
  [DotPosition.FiveDot_MiddleLeft]: {
    dotStyles: {
      top: "49%",
      left: `5%`,
    },
    labelPosition: "left",
  },
  [DotPosition.FiveDot_MiddleRight]: {
    dotStyles: {
      top: "49%",
      right: `5%`,
    },
    labelPosition: "right",
  },
  [DotPosition.FIveDot_BottomCenter]: {
    dotStyles: {
      top: "74%",
      left: "50%",
      transform: "translate(-50%, 0)",
    },
    labelPosition: "right",
  },

  [DotPosition.TwoDot_TopLeft]: {
    dotStyles: {
      top: "10%",
      left: "10%",
    },
    labelPosition: "left",
  },
  [DotPosition.TwoDot_TopRight]: {
    dotStyles: {
      top: "10%",
      right: "10%",
    },
    labelPosition: "right",
  },

  [DotPosition.ThreeDot_TopLeft]: {
    dotStyles: {
      top: "15%",
      left: "10%",
    },
    labelPosition: "left",
  },
  [DotPosition.ThreeDot_TopRight]: {
    dotStyles: {
      top: "15%",
      right: "10%",
    },
    labelPosition: "right",
  },
  [DotPosition.ThreeDot_MiddleCenter]: {
    dotStyles: {
      top: "50%",
      left: "50%",
      transform: "translate(-50%, 0)",
    },
    labelPosition: "right",
  },
  [DotPosition.None]: {
    dotStyles: {},
    labelPosition: "right",
  },
};
