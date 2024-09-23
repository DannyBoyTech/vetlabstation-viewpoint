import React, { InputHTMLAttributes } from "react";
import classNames from "classnames";
import { SpotIcon } from "@viewpoint/spot-icons";

let lastId = 0;

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  focus?: boolean;
  error?: boolean;
  hover?: boolean;
  label?: any;
  small?: boolean;
}

const Checkbox = ({
  className,
  focus,
  error,
  label,
  hover,
  small,
  ...props
}: CheckboxProps) => {
  const [id] = React.useState(lastId++);

  const checkboxClasses = classNames(
    {
      "spot-form__checkbox": true,
      "spot-form__checkbox--hover": hover,
      "spot-form__checkbox--focus": focus,
      "spot-form__checkbox--small": small,
      "spot-form__checkbox--disabled": props.disabled,
    },
    className
  );

  const checkbox = (
    <label className={checkboxClasses} htmlFor={`spot-checkbox-${id}`}>
      <input
        id={`spot-checkbox-${id}`}
        type="checkbox"
        className="spot-form__checkbox-input"
        {...props}
      />
      <span className="spot-form__checkbox-inner">
        <span className="spot-form__checkbox-visual">
          <SpotIcon
            name="checkmark"
            className="spot-form__checkbox-checked-icon"
          />
        </span>
        {typeof label === "string" ? (
          <span className="spot-form__checkbox-label">{label}</span>
        ) : (
          label
        )}
      </span>
    </label>
  );
  return error ? (
    <div className="spot-form__field-group spot-form--error">{checkbox}</div>
  ) : (
    checkbox
  );
};

export default Checkbox;
