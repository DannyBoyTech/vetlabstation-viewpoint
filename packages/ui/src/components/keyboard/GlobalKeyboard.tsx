import { ViewpointKeyboard } from "./ViewpointKeyboard";
import { useContext } from "react";
import { ViewpointInputContext } from "../../context/InputContext";

export const TestId = {
  Keyboard: "keyboard",
} as const;

// Primary keyboard used throughout the application. Gets its props and values
// from the ViewpointInputContext, which is usually configured via the InputAware
// wrapper component.
export function GlobalKeyboard() {
  const inputContext = useContext(ViewpointInputContext);
  return (
    <ViewpointKeyboard
      data-testid={TestId.Keyboard}
      keyboardType={inputContext.layout ?? "alphanumeric"}
      {...inputContext.keyboardProps}
    />
  );
}
