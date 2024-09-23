import React, { InputHTMLAttributes, Ref } from "react";
import classNames from "classnames";

export interface TextAreaProps
  extends InputHTMLAttributes<HTMLTextAreaElement> {
  focus?: boolean;
  error?: boolean;
  hover?: boolean;
  innerRef?: Ref<HTMLTextAreaElement>;
}

const TextArea = ({
  className,
  focus,
  error,
  hover,
  innerRef,
  ...props
}: TextAreaProps) => {
  const textAreaClasses = classNames(
    {
      "spot-form__textarea": true,
      "spot-form__textarea--focus": focus,
      "spot-form__textarea--hover": hover,
      "spot-form__textarea--readonly": props.readOnly,
      "spot-form__textarea--disabled": props.disabled,
    },
    className
  );
  const input = (
    <textarea ref={innerRef} className={textAreaClasses} {...props} />
  );

  return error ? (
    <div className="spot-form__field-group spot-form--error">{input}</div>
  ) : (
    input
  );
};

export default TextArea;
