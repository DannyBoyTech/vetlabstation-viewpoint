import React, {
  MutableRefObject,
  PropsWithChildren,
  Ref,
  useCallback,
  useRef,
  useState,
} from "react";
import { SimpleKeyboard } from "react-simple-keyboard";
import { KeyboardReactInterface } from "react-simple-keyboard/build/interfaces";
import { KeyboardType } from "../components/keyboard/Keyboards";
import { useTranslation } from "react-i18next";

export interface InputContext {
  keyboardRef: MutableRefObject<SimpleKeyboard | undefined>;
  inputOpen: boolean;
  inputDisabled: boolean;
  shift: boolean;
  setShift: (b: boolean) => void;
  capsLock: boolean;
  setCapsLock: (b: boolean) => void;
  showInput: () => void;
  hideInput: () => void;
  disableInput: () => void;
  enableInput: () => void;
  currentActiveInputId: string | undefined;
  // Used to keep track of the current active input ID without having to deal
  // with scope issues in the InputAware component
  currentActiveInputIdRef: MutableRefObject<string | undefined>;
  setCurrentActiveInputId: (str: string | undefined) => void;
  layout?: KeyboardType;
  setLayout: (layout: KeyboardType | undefined) => void;
  keyboardProps?: KeyboardReactInterface["options"];
  setKeyboardProps: (props: KeyboardReactInterface["options"]) => void;
}

export const ViewpointInputContext = React.createContext<InputContext>(
  undefined as unknown as InputContext
);

const ViewpointInputProvider = (props: PropsWithChildren) => {
  const [inputOpen, setInputOpen] = useState(false);
  const [inputDisabled, setInputDisabled] = useState(false);
  const [targetInput, setTargetInputState] = useState<string>();
  const [shift, setShift] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const [layout, setLayout] = useState<KeyboardType>();
  const [keyboardProps, setKeyboardProps] =
    useState<KeyboardReactInterface["options"]>();

  const targetInputRef = useRef<string>();

  const keyboardRef = useRef<SimpleKeyboard>();

  const showInput = useCallback(() => setInputOpen(true), []);
  const hideInput = useCallback(() => setInputOpen(false), []);
  const disableInput = useCallback(() => setInputDisabled(true), []);
  const enableInput = useCallback(() => setInputDisabled(false), []);
  const setTargetInput = useCallback((target: string | undefined) => {
    targetInputRef.current = target;
    setTargetInputState(target);
  }, []);

  const { i18n } = useTranslation();

  return (
    <ViewpointInputContext.Provider
      value={{
        inputOpen,
        inputDisabled: inputDisabled || oskDisabledForLanguage(i18n.language),
        keyboardRef,
        currentActiveInputId: targetInput,
        currentActiveInputIdRef: targetInputRef,
        setCurrentActiveInputId: setTargetInput,
        showInput,
        hideInput,
        disableInput,
        enableInput,
        shift,
        setShift,
        capsLock,
        setCapsLock,
        layout,
        setLayout,
        keyboardProps,
        setKeyboardProps,
      }}
    >
      {props.children}
    </ViewpointInputContext.Provider>
  );
};

function oskDisabledForLanguage(language: string) {
  return language === "ja";
}

export default ViewpointInputProvider;
