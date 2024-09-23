import Keyboard from "react-simple-keyboard";
import { useContext } from "react";
import {
  InputContext,
  ViewpointInputContext,
} from "../../context/InputContext";
import { KeyboardReactInterface } from "react-simple-keyboard/build/interfaces";
import "./ViewpointKeyboard.css";
import styled from "styled-components";
import { getKeyboardOptions, KeyboardType } from "./Keyboards";
import { useTranslation } from "react-i18next";

export const ShiftButtons = ["{shift}", "{shiftleft}", "{shiftright}"];
export const CapsLock = "{lock}";
export const Clear = "{clear}";
export const GreaterThan = "{gt}";
export const LessThan = "{lt}";
export const Close = "{close}";

// Translate from the on-screen keyboard's custom key codes to Electron-valid Accelerator codes:
// https://www.electronjs.org/docs/latest/api/accelerator
const Translations: Record<string, KeyCodeEvent[]> = {
  "{tab}": [{ keyCode: "Tab", sendChar: false }],
  "{bksp}": [{ keyCode: "Backspace", sendChar: false }],
  "{backspace}": [{ keyCode: "Backspace", sendChar: false }],
  "{enter}": [{ keyCode: "Return", sendChar: false }],
  "{space}": [{ keyCode: " ", sendChar: true }],
  "{close}": [{ keyCode: "Close", sendChar: false }],
  ".com": [
    { keyCode: ".", sendChar: true },
    { keyCode: "c", sendChar: true },
    {
      keyCode: "o",
      sendChar: true,
    },
    { keyCode: "m", sendChar: true },
  ],
  "{numpad0}": [{ keyCode: "0", sendChar: true }],
  "{numpad1}": [{ keyCode: "1", sendChar: true }],
  "{numpad2}": [{ keyCode: "2", sendChar: true }],
  "{numpad3}": [{ keyCode: "3", sendChar: true }],
  "{numpad4}": [{ keyCode: "4", sendChar: true }],
  "{numpad5}": [{ keyCode: "5", sendChar: true }],
  "{numpad6}": [{ keyCode: "6", sendChar: true }],
  "{numpad7}": [{ keyCode: "7", sendChar: true }],
  "{numpad8}": [{ keyCode: "8", sendChar: true }],
  "{numpad9}": [{ keyCode: "9", sendChar: true }],
  "{numpaddecimal}": [{ keyCode: ".", sendChar: true }],
};

interface KeyCodeEvent {
  keyCode: string;
  sendChar: boolean;
}

export function sendKbInput(kbInput: string, inputContext: InputContext) {
  // Don't send shift/caps lock events to main process -- they only modify the OSK's layout, no need to generate
  // an actual input for them
  if (
    ShiftButtons.includes(kbInput) ||
    kbInput === CapsLock ||
    kbInput === Close
  ) {
    if (ShiftButtons.includes(kbInput)) {
      inputContext.setShift(!inputContext.shift);
    }
    if (kbInput === CapsLock) {
      inputContext.setShift(false);
      inputContext.setCapsLock(!inputContext.capsLock);
    }
    if (kbInput === Close) {
      inputContext.hideInput();
    }
  } else {
    if (inputContext.shift) {
      inputContext.setShift(false);
    }
    // Send keycode info back to Electron main process so that it can send a true input event
    const args: KeyCodeEvent[] = Translations[kbInput] ?? [
      { keyCode: kbInput, sendChar: true },
    ];
    // Support mapping to multiple input events
    args.forEach((arg) => window.main?.send("kb-input", arg));
  }
}

const KeyboardRoot = styled.div<{ hidden: boolean; zIndex?: number }>`
  z-index: ${(p) => p.zIndex ?? 9999};
  display: ${(p) => (p.hidden ? "none" : "flex")};
  justify-content: center;
`;

export interface ViewpointKeyboardProps {
  className?: string;
  "data-testid"?: string;

  keyboardType: KeyboardType;
  // Intercept input transmission -- return undefined to prevent sending input
  // to the Electron process for this key press
  beforeSendInput?: (input: string) => string | undefined;
  alwaysVisible?: boolean;
  zIndex?: number;
  additionalKeyboardOptions?: KeyboardReactInterface["options"];
}

export function ViewpointKeyboard({
  className,
  "data-testid": testId,
  alwaysVisible,
  zIndex,
  keyboardType,
  beforeSendInput,
  additionalKeyboardOptions,
}: ViewpointKeyboardProps) {
  const inputContext = useContext(ViewpointInputContext);
  const { t } = useTranslation();

  const options = getKeyboardOptions(keyboardType, t);

  return (
    <KeyboardRoot
      className={className}
      data-testid={testId}
      hidden={alwaysVisible ? false : !inputContext.inputOpen}
      zIndex={zIndex}
    >
      <Keyboard
        keyboardRef={(r) => (inputContext.keyboardRef.current = r)}
        disableCaretPositioning={true} // The virtual keyboard doesn't need to track caret positioning since we're using real input events
        onChange={() => inputContext.keyboardRef.current?.clearInput()} // Don't store input in memory
        preventMouseDownDefault={true}
        onKeyPress={(input: string) => {
          const processedInput = (beforeSendInput ?? ((i) => i))(input);
          if (processedInput != null) {
            sendKbInput(input, inputContext);
          }
        }}
        layoutName={
          (inputContext.shift || inputContext.capsLock) &&
          options?.layout?.shift != null
            ? "shift"
            : "default"
        }
        mergeDisplay
        {...options}
        {...additionalKeyboardOptions}
      />
    </KeyboardRoot>
  );
}
