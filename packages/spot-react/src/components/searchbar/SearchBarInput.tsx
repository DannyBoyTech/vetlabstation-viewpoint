import classnames from "classnames";
import React, { forwardRef, InputHTMLAttributes } from "react";

export interface SearchBarInputProps
  extends InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export const SearchBarInput = forwardRef<HTMLInputElement, SearchBarInputProps>(
  ({ className, ...props }, ref) => {
    const classes = classnames(
      className,
      "spot-form__input",
      "spot-search-bar__input"
    );

    return <input className={classes} {...props} ref={ref} />;
  }
);
