import React, { ElementType } from "react";
import classNames from "classnames";

import { forwardRefWithAs } from "../../polymorphic";

export interface ButtonGroupProps {
  withLines?: boolean;
  disabled?: boolean;
  variant?: "default" | "toggle";
}

const ButtonGroup = forwardRefWithAs<"div", ButtonGroupProps>(
  (
    { as, className, withLines = false, variant, disabled = false, ...rest },
    ref
  ) => {
    const Component: ElementType = as ?? "div";

    return (
      <Component
        className={classNames("spot-button-group", className, {
          "with-lines": withLines,
          "spot-button-group--disabled": disabled,
          "spot-button-group-toggle": variant === "toggle",
        })}
        {...rest}
        ref={ref}
      />
    );
  }
);

export default ButtonGroup;

ButtonGroup.displayName = "ButtonGroup";
