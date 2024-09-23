import React, { InputHTMLAttributes, Ref } from "react";
import classNames from "classnames";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  focus?: boolean;
  error?: boolean;
  hover?: boolean;
  innerRef?: Ref<HTMLInputElement>;
}

const Input = ({
  className,
  focus,
  error,
  hover,
  innerRef,
  ...props
}: InputProps) => {
  const inputClasses = classNames(
    {
      "spot-form__input": true,
      "spot-form__input--focus": focus,
      "spot-form__input--hover": hover,
      "spot-form__input--readonly": props.readOnly,
      "spot-form__input--disabled": props.disabled,
    },
    className
  );
  const wrapperClasses = classNames({
    "spot-form--error": error,
  });
  return (
    <div className={wrapperClasses}>
      <input ref={innerRef} className={inputClasses} {...props} />
    </div>
  );
};

export default Input;
