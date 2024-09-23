import { HTMLAttributes, useState } from "react";
import classNames from "classnames";
import styled from "styled-components";
import { ValidationError } from "@viewpoint/spot-react";

const Root = styled.div`
  .spot-form__field-error {
    margin: 0px;
  }
`;

export interface RequiredInputProps extends HTMLAttributes<HTMLDivElement> {
  errorText?: string;
  error?: boolean;
}

export function RequiredInput({
  children,
  error,
  errorText,
  ...props
}: RequiredInputProps) {
  const [blurred, setBlurred] = useState(false);
  const wrapperClasses = classNames({
    "spot-form--error": error && blurred,
  });

  return (
    <Root
      className={wrapperClasses}
      onBlur={() => setBlurred(true)}
      onFocus={() => setBlurred(false)}
      {...props}
    >
      {children}
      {error && blurred && errorText && (
        <ValidationError>{errorText}</ValidationError>
      )}
    </Root>
  );
}
