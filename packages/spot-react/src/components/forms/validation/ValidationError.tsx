import { HTMLProps } from "react";
import classNames from "classnames";

export interface ValidationErrorProps extends HTMLProps<HTMLSpanElement> {}

function ValidationError({
  children,
  className,
  ...props
}: ValidationErrorProps) {
  const classes = classNames(className, "spot-form__field-error");
  return (
    <span className={classes} id="select-error-message" role="alert" {...props}>
      <span className="spot-form__field-error-text">{children}</span>
    </span>
  );
}

export default ValidationError;
