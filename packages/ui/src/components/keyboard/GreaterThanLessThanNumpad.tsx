import {
  GreaterThan,
  LessThan,
  ViewpointKeyboard,
  ViewpointKeyboardProps,
} from "./ViewpointKeyboard";

export interface ClearableNumPadProps {
  onGreaterThanPressed: () => void;
  greaterThanEnabled: boolean;
  onLessThanPressed: () => void;
  lessThanEnabled: boolean;
  keyboardProps?: Partial<ViewpointKeyboardProps>;
}

// Numpad keyboard that contains a greater than and less than button. Used
// currently in the inVue FNA run config workflow.
export function GreaterThanLessThanNumpad(props: ClearableNumPadProps) {
  const buttonThemes = [];
  if (props.greaterThanEnabled) {
    buttonThemes.push({
      buttons: GreaterThan,
      // For some reason, applying the library's built-in active class
      // "hg-activeButton" doesn't work here -- the class is not applied.
      // Use a custom class instead.
      class: "highlighted",
    });
  }
  if (props.lessThanEnabled) {
    buttonThemes.push({
      buttons: LessThan,
      // For some reason, applying the library's built-in active class
      // "hg-activeButton" doesn't work here -- the class is not applied.
      // Use a custom class instead.
      class: "highlighted",
    });
  }
  return (
    <ViewpointKeyboard
      alwaysVisible
      keyboardType="gtLtNumpad"
      beforeSendInput={(key) => {
        if (key === GreaterThan) {
          props.onGreaterThanPressed();
        } else if (key === LessThan) {
          props.onLessThanPressed();
        } else {
          return key;
        }
      }}
      {...props.keyboardProps}
      additionalKeyboardOptions={{
        buttonTheme: buttonThemes,
        ...props.keyboardProps?.additionalKeyboardOptions,
      }}
    />
  );
}
