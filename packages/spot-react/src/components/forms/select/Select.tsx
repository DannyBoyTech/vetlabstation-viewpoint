import React, { OptionHTMLAttributes, SelectHTMLAttributes } from "react";
import classNames from "classnames";
import { SpotIcon } from "@viewpoint/spot-icons";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  focus?: boolean;
  error?: boolean;
  hover?: boolean;
}

export const Select = ({
  className,
  focus,
  error,
  hover,
  ...props
}: SelectProps) => {
  const wrapperClasses = classNames(
    {
      "spot-form__select": true,
      "spot-form__select--focus": focus,
      "spot-form__select--hover": hover,
      "spot-form__select--disabled": props.disabled,
    },
    className
  );

  const select = (
    <div className={wrapperClasses}>
      <select className="spot-form__select-input" {...props}>
        {props.children}
      </select>
      <div className="spot-form__select-inner" />
      <span className="spot-form__select-open-indicator">
        <SpotIcon className="spot-form__select-open-icon" name="caret-down" />
      </span>
    </div>
  );
  return error ? (
    <div className="spot-form__field-group spot-form--error">{select}</div>
  ) : (
    select
  );
};

export interface OptionProps extends OptionHTMLAttributes<HTMLOptionElement> {}
const Option = ({ className, ...props }: OptionProps) => {
  const optionClasses = classNames(
    {
      "spot-form__select-option": true,
    },
    className
  );

  return (
    <option className={optionClasses} {...props}>
      {props.children}
    </option>
  );
};

Select.Option = Option;

export default Select;
