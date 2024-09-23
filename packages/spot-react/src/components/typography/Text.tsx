import React from "react";
import styled from "styled-components";
import classNames from "classnames";
import { typography, TypographyProps } from "styled-system";

export type TextVariant = "body" | "secondary" | "tertiary";

export interface TextProps extends TypographyProps {
  children?: React.ReactNode;
  className?: string;
  as?: string | React.ComponentType<any>;
  fontWeight?: "light" | "normal" | "bold";
  variant?: TextVariant;
}

const StyledText = styled.span`
  ${typography};
`;

export const Text = (props: TextProps) => {
  const {
    children,
    className,
    as = "span",
    fontWeight = "normal",
    variant = "body",
    ...rest
  } = props;

  const styledTextProps = React.useMemo(
    () => ({
      ...rest,
      children,
      as,
      className: classNames(className, {
        "spot-typography__text--body": variant === "body",
        "spot-typography__text--secondary": variant === "secondary",
        "spot-typography__text--tertiary": variant === "tertiary",
        "spot-typography__font-weight--light": fontWeight === "light",
        "spot-typography__font-weight--normal": fontWeight === "normal",
        "spot-typography__font-weight--bold": fontWeight === "bold",
      }),
    }),
    [rest, children, as, className, variant, fontWeight]
  );
  return <StyledText {...styledTextProps} />;
};

Text.displayName = "Text";
