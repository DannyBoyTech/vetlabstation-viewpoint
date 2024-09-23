import { KeyboardReactInterface } from "react-simple-keyboard/build/interfaces";
import { TFunction } from "react-i18next";
import Close from "../../assets/Close_keyboard_icon.svg";
import { I18nNs } from "../../i18n/config";

export type KeyboardType =
  | "alphanumeric"
  | "extendedAlphanumeric"
  | "numpad"
  | "clearableNumpad"
  | "gtLtNumpad";

type KeyBoardOptionsFn = (t: TFunction) => KeyboardReactInterface["options"];

function getNumPadOptions(): KeyboardReactInterface["options"] {
  return {
    theme: "vp-keyboard-theme hg-theme-default hg-layout-default vp-numpad",
    layout: {
      default: [
        "{numpad7} {numpad8} {numpad9}",
        "{numpad4} {numpad5} {numpad6}",
        "{numpad1} {numpad2} {numpad3}",
        "{numpaddecimal} {numpad0} {backspace}",
      ],
    },
    display: {
      "{backspace}": "⌫",
    },
  };
}

function getClearableNumPadOptions(
  t: TFunction<"translation" | "formats">
): KeyboardReactInterface["options"] {
  return {
    theme: "vp-keyboard-theme hg-theme-default hg-layout-default vp-numpad",
    layout: {
      default: [
        "{numpad7} {numpad8} {numpad9}",
        "{numpad4} {numpad5} {numpad6}",
        "{numpad1} {numpad2} {numpad3}",
        "{clear} {numpad0} {gt}",
      ],
    },
    display: {
      "{clear}": t("general.buttons.clear"),
      "{gt}": t("qualifiers.GREATER_THAN", { ns: I18nNs.Formats }),
    },
  };
}

function getGtLtNumpadOptions(
  t: TFunction<"translation" | "formats">
): KeyboardReactInterface["options"] {
  return {
    theme: "vp-keyboard-theme hg-theme-default hg-layout-default vp-numpad",
    layout: {
      default: [
        "{numpad7} {numpad8} {numpad9}",
        "{numpad4} {numpad5} {numpad6}",
        "{numpad1} {numpad2} {numpad3}",
        "{lt} {numpad0} {gt}",
      ],
      withDecimal: [
        "{numpad7} {numpad8} {numpad9}",
        "{numpad4} {numpad5} {numpad6}",
        "{numpad1} {numpad2} {numpad3}",
        "{numpaddecimal} {numpad0} {backspace}",
        "{lt} {gt}",
      ],
    },
    display: {
      "{backspace}": "⌫",
      "{clear}": t("general.buttons.clear"),
      "{gt}": t("qualifiers.GREATER_THAN", { ns: I18nNs.Formats }),
      "{lt}": t("qualifiers.LESS_THAN", { ns: I18nNs.Formats }),
    },
  };
}

function getDefaultAlphaNumericKeyboard(
  t: TFunction
): KeyboardReactInterface["options"] {
  return {
    theme: "vp-keyboard-theme hg-theme-default hg-layout-default",
    layout: {
      default: [
        "1 2 3 4 5 6 7 8 9 0 - {backspace}",
        "q w e r t y u i o p",
        "{lock} a s d f g h j k l '",
        "{close} {shift} z x c v b n m , . {space}",
      ],
      shift: [
        "1 2 3 4 5 6 7 8 9 0 - {backspace}",
        "Q W E R T Y U I O P",
        "{lock} A S D F G H J K L '",
        "{close} {shift} Z X C V B N M , . {space}",
      ],
    },
    display: {
      "{space}": t("general.keys.space"),
      "{backspace}": t("general.keys.backspace"),
      "{lock}": t("general.keys.capsLock"),
      "{shift}": t("general.keys.shift"),
      "{close}": `<img src="${Close}" alt="${t("general.keys.close")}" />`,
    },
  };
}

function getExtendedAlphaNumericKeyboard(
  t: TFunction
): KeyboardReactInterface["options"] {
  return {
    theme: "vp-keyboard-theme vp-small-keys hg-theme-default hg-layout-default",
    layout: {
      default: [
        "` 1 2 3 4 5 6 7 8 9 0 - = {backspace}",
        "q w e r t y u i o p [ ] \\",
        "{lock} a s d f g h j k l ; '",
        "{close} {shift} z x c v b n m , . / {space}",
      ],
      shift: [
        "~ ! @ # $ % ^ & * ( ) _ + {backspace}",
        "Q W E R T Y U I O P { } |",
        '{lock} A S D F G H J K L : "',
        "{close} {shift} Z X C V B N M < > ? {space}",
      ],
    },
    display: {
      "{space}": t("general.keys.space"),
      "{backspace}": t("general.keys.backspace"),
      "{lock}": t("general.keys.capsLock"),
      "{shift}": t("general.keys.shift"),
      "{close}": `<img src="${Close}" alt="${t("general.keys.close")}" />`,
    },
  };
}

const Keyboards: Record<KeyboardType, KeyBoardOptionsFn> = {
  alphanumeric: getDefaultAlphaNumericKeyboard,
  numpad: getNumPadOptions,
  clearableNumpad: getClearableNumPadOptions,
  gtLtNumpad: getGtLtNumpadOptions,
  extendedAlphanumeric: getExtendedAlphaNumericKeyboard,
};

export function getKeyboardOptions(
  type: KeyboardType | undefined,
  t: TFunction
) {
  return type == null ? undefined : Keyboards[type](t);
}
