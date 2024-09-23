import React, { LabelHTMLAttributes } from "react";
import classNames from "classnames";

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  focus?: boolean;
  disabled?: boolean;
}

const Label = ({ className, focus, disabled, ...props }: LabelProps) => {
  const labelClasses = classNames(
    {
      "spot-form__label": true,
      "spot-form__label--focus": focus,
      "spot-form__label--disabled": disabled,
    },
    className
  );
  return (
    <label className={labelClasses} {...props}>
      {props.children}
    </label>
  );
};

export default Label;
