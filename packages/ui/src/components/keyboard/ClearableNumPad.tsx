import { Clear, GreaterThan, ViewpointKeyboard } from "./ViewpointKeyboard";

export interface ClearableNumPadProps {
  className?: string;
  "data-testid"?: string;

  onClearPressed: () => void;
  onGreaterThanPressed: () => void;
  greaterThanEnabled: boolean;
}

// Numpad keyboard that contains a clear button and a greater-than button.
// Currently used primarily in Manual UA Specific Gravity entry workflow
export function ClearableNumPad(props: ClearableNumPadProps) {
  return (
    <ViewpointKeyboard
      className={props.className}
      data-testid={props["data-testid"]}
      keyboardType="clearableNumpad"
      alwaysVisible
      beforeSendInput={(key) => {
        if (key === Clear) {
          props.onClearPressed();
        } else if (key === "{gt}") {
          props.onGreaterThanPressed();
        } else {
          return key;
        }
      }}
      additionalKeyboardOptions={{
        buttonTheme: [
          {
            buttons: GreaterThan,
            // For some reason, applying the library's built-in active class
            // "hg-activeButton" doesn't work here -- the class is not applied.
            // Use a custom class instead.
            class: props.greaterThanEnabled ? "highlighted" : "",
          },
        ],
      }}
    />
  );
}
