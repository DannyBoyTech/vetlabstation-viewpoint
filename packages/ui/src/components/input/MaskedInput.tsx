import { IMaskMixin } from "react-imask";
import { MutableRefObject, useEffect, useState } from "react";
import { Input } from "@viewpoint/spot-react";
import { IMaskInputProps } from "react-imask/esm/mixin";
import { useLocaleData } from "../../context/AppStateContext";

export const CommonMasks = {
  DIGITS: /^\d*$/,
  DIGITS_ALPHA_ANYCASE: /^[\da-zA-Z]*$/,
} as const;

const MaskedSpotInput = IMaskMixin(({ inputRef, ...props }) => (
  <Input {...props} innerRef={inputRef as MutableRefObject<HTMLInputElement>} />
));

export interface MaskedInputProps {
  className?: string;
  "data-testid"?: string;

  error?: boolean;
  prefix?: string; // Use this to indicate what value to expect before user has entered anything. This is used to indicate if user has remove all their input since react-imask won't reset the value in that case
  onValidationErrorChanged?: (error: boolean) => void; // Will update with the current validation error state
}

export function MaskedInput({
  error,
  prefix,
  onValidationErrorChanged,
  ...props
}: IMaskInputProps & MaskedInputProps) {
  const [focused, setFocused] = useState(false);
  const [complete, setComplete] = useState(false);

  const { decimalSeparator } = useLocaleData();

  useEffect(() => {
    // If the user loses focus on the input, the input is not complete, and the value is not empty, callback with an error
    onValidationErrorChanged?.(
      !focused && !complete && (props.value?.length ?? 0) > 0
    );
  }, [complete, focused, onValidationErrorChanged, props.value]);
  return (
    <MaskedSpotInput
      radix={decimalSeparator}
      {...props}
      onBlur={(ev) => {
        setFocused(false);
        props.onBlur?.(ev);
      }}
      onFocus={(ev) => {
        setFocused(true);
        props.onFocus?.(ev);
      }}
      onComplete={() => setComplete(true)}
      onAccept={(value, maskRef, inputEvent) => {
        setComplete(false);
        if (value === prefix) {
          props.onAccept?.("", maskRef, inputEvent);
        } else {
          props.onAccept?.(value, maskRef, inputEvent);
        }
      }}
      // Display prefix characters as soon as user focuses on the input
      lazy={!focused}
      // @ts-ignore - IMaskMixin doesn't seem to properly handle the types of the component it's provided (or I'm not able to figure out how to specify)
      error={error}
    />
  );
}
