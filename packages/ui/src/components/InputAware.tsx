import {
  cloneElement,
  InputHTMLAttributes,
  ReactElement,
  FocusEvent,
  useContext,
  useState,
} from "react";
import { ViewpointInputContext } from "../context/InputContext";

import { KeyboardType } from "./keyboard/Keyboards";

export interface InputAwareProps {
  children: ReactElement<InputHTMLAttributes<any>>;
  layout?: KeyboardType;
}

export function InputAware(props: InputAwareProps) {
  const {
    inputDisabled,
    setCurrentActiveInputId,
    hideInput,
    showInput,
    setLayout,
    layout,
    currentActiveInputIdRef,
    setKeyboardProps,
    keyboardProps,
  } = useContext(ViewpointInputContext);
  // Unique ID for this component
  const [id] = useState(`input-aware-${crypto.randomUUID()}`);

  return inputDisabled
    ? props.children
    : cloneElement(props.children, {
        ...props.children.props,
        style: { scrollMarginBottom: "8px" },
        onBlur: (ev: FocusEvent) => {
          // If the current target is still this element
          if (currentActiveInputIdRef.current === id) {
            // Add a slight delay before hiding the input to allow clicks to other
            // elements to propagate, since hiding the keyboard will rearrange
            // the document layout
            setTimeout(() => {
              // If the target is still this element, hide the input. If it's not,
              // that means the user clicked on another input, so we don't want to
              // hide the input for that one.
              if (currentActiveInputIdRef.current === id) {
                setCurrentActiveInputId(undefined);
                hideInput();
              }
            }, 100);
          }
          props.children.props.onBlur?.(ev);
        },
        onFocus: (ev: FocusEvent) => {
          // Bring up the keyboard
          showInput();
          setCurrentActiveInputId(id);
          if (props.layout !== layout) {
            setLayout(props.layout);
          }
          if (keyboardProps?.maxLength !== props.children?.props?.maxLength) {
            setKeyboardProps({
              ...keyboardProps,
              maxLength: props.children?.props?.maxLength,
            });
          }
          setTimeout(() => {
            ev.target.scrollIntoView({
              behavior: "smooth",
              block: "nearest",
              inline: "nearest",
            });
          }, 100);

          props.children.props.onFocus?.(ev);
        },
        value: props.children.props.value,
      });
}
