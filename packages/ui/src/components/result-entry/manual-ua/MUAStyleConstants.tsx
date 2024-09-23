import {
  ChemistryResult,
  ChemistryTypes,
  Clarity,
  CollectionMethod,
  Color,
  PHValues,
} from "@viewpoint/api";

export type ChemistryResultDisplayConfig = {
  [key in ChemistryResult]?: { color: string };
};

export const ChemistryResultDisplayConfigs: {
  [key in ChemistryTypes]: ChemistryResultDisplayConfig;
} = {
  [ChemistryTypes.HGB]: {
    [ChemistryResult.PlusOne]: {
      color: "#d0d641",
    },
    [ChemistryResult.PlusTwo]: {
      color: "#76ac50",
    },
    [ChemistryResult.PlusThree]: {
      color: "#448646",
    },
    [ChemistryResult.PlusFour]: {
      color: "#146f60",
    },
  },
  [ChemistryTypes.BLD]: {
    [ChemistryResult.Negative]: {
      color: "#fbe43b",
    },
    [ChemistryResult.PlusOne]: {
      color: "#e3d33e",
    },
    [ChemistryResult.PlusTwo]: {
      color: "#c9c744",
    },
    [ChemistryResult.PlusThree]: {
      color: "#358c46",
    },
    [ChemistryResult.PlusFour]: {
      color: "#198474",
    },
  },
  [ChemistryTypes.BIL]: {
    [ChemistryResult.Negative]: {
      color: "#fae196",
    },
    [ChemistryResult.PlusOne]: {
      color: "#f7e2bc",
    },
    [ChemistryResult.PlusTwo]: {
      color: "#ebac8a",
    },
    [ChemistryResult.PlusThree]: {
      color: "#e58f85",
    },
  },
  [ChemistryTypes.UBG]: {
    [ChemistryResult.Normal]: {
      color: "#f3d9c7",
    },
    [ChemistryResult.PlusOne]: {
      color: "#edada8",
    },
    [ChemistryResult.PlusTwo]: {
      color: "#e6958f",
    },
    [ChemistryResult.PlusThree]: {
      color: "#da6c6f",
    },
    [ChemistryResult.PlusFour]: {
      color: "#da595c",
    },
  },
  [ChemistryTypes.KET]: {
    [ChemistryResult.Negative]: {
      color: "#fbdb96",
    },
    [ChemistryResult.PlusOne]: {
      color: "#e09da1",
    },
    [ChemistryResult.PlusTwo]: {
      color: "#923972",
    },
    [ChemistryResult.PlusThree]: {
      color: "#843668",
    },
  },
  [ChemistryTypes.GLU]: {
    [ChemistryResult.Negative]: {
      color: "#f8e76c",
    },
    [ChemistryResult.PlusOne]: {
      color: "#8abf46",
    },
    [ChemistryResult.PlusTwo]: {
      color: "#7eb14e",
    },
    [ChemistryResult.PlusThree]: {
      color: "#92b892",
    },
    [ChemistryResult.PlusFour]: {
      color: "#37627c",
    },
  },
  [ChemistryTypes.PRO]: {
    [ChemistryResult.Negative]: {
      color: "#dbe87e",
    },
    [ChemistryResult.Trace]: {
      color: "#bad273",
    },
    [ChemistryResult.PlusOne]: {
      color: "#a6c07a",
    },
    [ChemistryResult.PlusTwo]: {
      color: "#92b892",
    },
    [ChemistryResult.PlusThree]: {
      color: "#71af9a",
    },
  },
  [ChemistryTypes.LEU]: {
    [ChemistryResult.Negative]: {
      color: "#d7d3b7",
    },
    [ChemistryResult.PlusOne]: {
      color: "#bab5a2",
    },
    [ChemistryResult.PlusTwo]: {
      color: "#bab5a2",
    },
    [ChemistryResult.PlusThree]: {
      color: "#816991",
    },
  },
};

export const PHColors = {
  [PHValues["5"]]: "#eca452",
  [PHValues["6"]]: "#dcc053",
  [PHValues["6.5"]]: "#68c359",
  [PHValues["7"]]: "#81a54d",
  [PHValues["8"]]: "#4e9c6d",
  [PHValues["9"]]: "#1c7a7c",
};

export const ConstantColors = {
  CollectionMethod: "#E5F6F7",
};

const assetsPath = "/results/mua/100x100";
export const getClarityImagePath = (clarity: Clarity) =>
  `${assetsPath}/Clarity_${clarity}.png`;
export const getColorImagePath = (color: Color) =>
  `${assetsPath}/Color_Testtube${color}.png`;
export const getCollectionMethodImagePath = (
  collectionMethod: CollectionMethod
) => `${assetsPath}/CollectionMethod_${collectionMethod}.png`;

export const BloodImages: { [key in ChemistryResult]?: string } = {
  [ChemistryResult.PlusOne]: `${assetsPath}/BLD_1+.png`,
  [ChemistryResult.PlusTwo]: `${assetsPath}/BLD_2+.png`,
  [ChemistryResult.PlusThree]: `${assetsPath}/BLD_3+.png`,
  [ChemistryResult.PlusFour]: `${assetsPath}/BLD_4+.png`,
};
