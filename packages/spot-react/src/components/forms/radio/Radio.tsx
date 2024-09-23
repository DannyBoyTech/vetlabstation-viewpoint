import React, { InputHTMLAttributes, ReactNode } from "react";
import classNames from "classnames";

export interface RadioProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: ReactNode;
  small?: boolean;
}

const Radio = ({ className, label, small, ...props }: RadioProps) => {
  const outerLabelClasses = classNames(
    {
      "spot-form__radio": true,
      "spot-form__radio--small": small,
    },
    className
  );
  const inputClasses = classNames({
    "spot-form__radio-input": true,
  });
  const innerClasses = classNames({
    "spot-form__radio-inner": true,
  });
  const visualClasses = classNames({
    "spot-form__radio-visual": true,
  });
  const labelClasses = classNames({
    "spot-form__radio-label": true,
  });
  return (
    <>
      <label className={outerLabelClasses}>
        <input type="radio" className={inputClasses} {...props} />
        <span className={innerClasses}>
          <span className={visualClasses} />
          <span className={labelClasses}>{label}</span>
        </span>
      </label>
    </>
  );
};

export interface RadioGroupProps {
  legend?: ReactNode;
  children?: ReactNode;
  spacious?: boolean;
  horizontal?: boolean;
}

export const RadioGroup = ({
  spacious,
  legend,
  children,
  horizontal,
  ...props
}: RadioGroupProps) => {
  const fieldSetClassNames = classNames({
    "spot-form__radio-group": true,
    "spot-form__radio-group--expanded": spacious,
    "spot-form__field-group--horizontal": horizontal,
  });
  const legendClassNames = classNames({
    "spot-form__radio-group-label": true,
  });
  const innerClassNames = classNames({
    "spot-form__radio-group-inner": true,
  });

  return (
    <fieldset className={fieldSetClassNames} role="radiogroup" {...props}>
      {legend && <legend className={legendClassNames}>{legend}</legend>}
      <div className={innerClassNames}>{children}</div>
    </fieldset>
  );
};

export default Radio;
