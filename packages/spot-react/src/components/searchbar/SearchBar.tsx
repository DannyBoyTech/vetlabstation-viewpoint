import classnames from "classnames";
import React, { FormHTMLAttributes } from "react";

export interface SearchBarProps
  extends React.PropsWithChildren,
    FormHTMLAttributes<HTMLFormElement> {
  className?: string;
  lowPriority?: boolean;
  error?: boolean;
}

export const SearchBar = ({
  className,
  children,
  lowPriority = false,
  error = false,
  ...props
}: SearchBarProps) => {
  const classes = classnames(className, "spot-form", "spot-search-bar", {
    "spot-search-bar--low-priority": lowPriority,
    "spot-search-bar--error": error,
  });

  return (
    <form className={classes} {...props}>
      {children}
    </form>
  );
};
