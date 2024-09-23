import { spot } from "@idexx/spot/src/data/spot_tokens.json";

export const SpotTokens = spot;

export interface Theme {
  name: "Light" | "Dark";
  primaryContainerClass: string;
  secondaryContainerClass: string;
  colors?: {
    background?: {
      primary?: string;
      secondary?: string;
      disabled?: string;
    };
    text?: {
      primary?: string;
      secondary?: string;
      active?: string;
      disabled?: string;
      link?: string;
    };
    feedback?: {
      error?: string;
      success?: string;
      warning?: string;
      inRange?: string;
      info?: string;
      outOfRange?: string;
    };
    interactive?: {
      primary?: string;
      secondary?: string;
      hoverPrimary?: string;
      hoverSecondary?: string;
      focus?: string;
    };
    borders?: {
      primary?: string;
      secondary?: string;
      control?: string;
    };
  };
  borders?: {
    heavyPrimary?: string;
    heavySecondary?: string;
    lightPrimary?: string;
    lightSecondary?: string;
    extraLightPrimary?: string; // TODO - doesn't exist?
    extraLightSecondary?: string;
    control?: string;
    controlHover?: string;
    controlFocus?: string;
  };
  getOppositeTheme: () => Theme;
}

export interface PropsWithSpotTheme {
  theme?: Theme;
}

export const LightTheme: Theme = {
  name: "Light",
  primaryContainerClass: "spot-container--light-primary",
  secondaryContainerClass: "spot-container--light-secondary",
  getOppositeTheme: () => DarkTheme,
  colors: {
    background: SpotTokens["background-color"].light,
    text: {
      primary: SpotTokens["text-color"].primary["on-light"],
      secondary: SpotTokens["text-color"].secondary["on-light"],
      active: SpotTokens["text-color"].active["on-light"],
      disabled: SpotTokens["text-color"].disabled["on-light"],
      link: SpotTokens["text-color"].link["on-light"],
    },
    feedback: {
      error: SpotTokens["feedback-color"].error["on-light"],
      warning: SpotTokens["feedback-color"].warning["on-light"],
      success: SpotTokens["feedback-color"].success["on-light"],
      info: SpotTokens["feedback-color"].info["on-light"],
      inRange: SpotTokens["feedback-color"].results["in-range"],
      outOfRange: SpotTokens["feedback-color"].results["out-of-range"],
    },
    interactive: {
      primary: SpotTokens["interactive-color"]["on-light"],
      secondary: SpotTokens["interactive-color"]["on-light"],
      hoverPrimary: SpotTokens["interactive-color"].hover["on-light-primary"],
      hoverSecondary:
        SpotTokens["interactive-color"].hover["on-light-secondary"],
      focus: SpotTokens["interactive-color"].focus["on-light"],
    },
    borders: {
      primary: SpotTokens.border.light.color["on-light-primary"],
      secondary: SpotTokens.border.light.color["on-light-secondary"],
      control: SpotTokens.border.control.color["on-light"],
    },
  },
  borders: {
    lightPrimary: SpotTokens.border.light["on-light-primary"],
    lightSecondary: SpotTokens.border.light["on-light-secondary"],
    heavyPrimary: SpotTokens.border.heavy["on-light-primary"],
    heavySecondary: SpotTokens.border.heavy["on-light-secondary"],
    control: SpotTokens.border.control["on-light"],
    controlHover: SpotTokens.border.control.hover,
    controlFocus: `1px solid ${SpotTokens["interactive-color"]["on-light"]}`,
    extraLightPrimary: `1px solid #F4F6F7FF`,
    extraLightSecondary: `1px solid #E5E5E5`,
  },
};

export const DarkTheme: Theme = {
  name: "Dark",
  primaryContainerClass: "spot-container--dark-primary",
  secondaryContainerClass: "spot-container--dark-secondary",
  getOppositeTheme: () => LightTheme,
  colors: {
    background: SpotTokens["background-color"].dark,
    text: {
      primary: SpotTokens["text-color"].primary["on-dark"],
      secondary: SpotTokens["text-color"].secondary["on-dark"],
      active: SpotTokens["text-color"].active["on-dark"],
      disabled: SpotTokens["text-color"].disabled["on-dark"],
      link: SpotTokens["text-color"].link["on-dark"],
    },
    feedback: {
      error: SpotTokens["feedback-color"].error["on-dark"],
      warning: SpotTokens["feedback-color"].warning["on-dark"],
      success: SpotTokens["feedback-color"].success["on-dark"],
      info: SpotTokens["feedback-color"].info["on-dark"],
      inRange: SpotTokens["feedback-color"].results["in-range"],
      outOfRange: SpotTokens["feedback-color"].results["out-of-range"],
    },
    interactive: {
      primary: SpotTokens["interactive-color"]["on-dark"],
      secondary: SpotTokens["interactive-color"]["on-dark"], // TODO
      hoverPrimary: SpotTokens["interactive-color"].hover["on-dark-primary"],
      hoverSecondary:
        SpotTokens["interactive-color"].hover["on-dark-secondary"],
      focus: SpotTokens["interactive-color"].focus["on-dark"],
    },
    borders: {
      primary: SpotTokens.border.light.color["on-dark-primary"],
      secondary: SpotTokens.border.light.color["on-dark-secondary"],
      control: SpotTokens.border.control.color["on-dark"],
    },
  },
  borders: {
    lightPrimary: SpotTokens.border.light["on-dark-primary"],
    lightSecondary: SpotTokens.border.light["on-dark-secondary"],
    heavyPrimary: SpotTokens.border.heavy["on-dark-primary"],
    heavySecondary: SpotTokens.border.heavy["on-dark-secondary"],
    control: SpotTokens.border.control["on-dark"],
    controlHover: SpotTokens.border.control.hover,
    controlFocus: SpotTokens.border.control.hover, // TODO
    extraLightPrimary: SpotTokens.border.light["on-dark-primary"], // TODO
  },
};
