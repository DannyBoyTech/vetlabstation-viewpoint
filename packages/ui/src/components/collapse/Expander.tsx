import { MouseEventHandler } from "react";
import styled from "styled-components";
import classnames from "classnames";

export interface ExpanderProps {
  className?: string;
  expanded?: boolean;
  expandDuration?: number;
  size?: number;
  sizeUnit?: string /* rem, em, px */;
  onClick?: MouseEventHandler;
  disabled?: boolean;
}

interface ContainerProps {
  $size: number;
  $sizeUnit: string;
  $expandDuration: number;
  $disabled?: boolean;
}

const Container = styled.span<ContainerProps>`
  display: inline-block;
  vertical-align: top;
  position: relative;
  height: ${(p) => p.$size}${(p) => p.$sizeUnit};
  width: ${(p) => p.$size}${(p) => p.$sizeUnit};

  :hover {
    cursor: pointer;
  }

  .chevron {
    box-sizing: border-box;

    /* factor is 1/sqrt(2) to fit inner square diagonally */
    height: 70.7%;
    width: 70.7%;

    border-width: ${(p) => 0.21 * p.$size}${(p) => p.$sizeUnit} ${(p) =>
        0.21 * p.$size}${(p) => p.$sizeUnit} 0px 0px;
    border-color: ${(p) =>
      p.$disabled
        ? p.theme.colors?.text?.disabled
        : p.theme.colors?.interactive?.focus};
    border-style: solid;

    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(45deg);
    transition: transform ${(p) => p.$expandDuration}ms ease-in-out;
  }

  .chevron.expanded {
    transform: translate(-50%, -50%) rotate(135deg);
  }
`;

export const Expander = (props: ExpanderProps) => {
  const rootClasses = classnames("expander", props.className);
  const chevronClasses = classnames("chevron", { expanded: props.expanded });
  const defaultProps = {
    $size: 1.5,
    $sizeUnit: "em",
    $expandDuration: 100,
  };

  return (
    <Container
      {...defaultProps}
      {...props}
      className={rootClasses}
      onClick={props.onClick}
      $disabled={props.disabled}
    >
      <span className={chevronClasses} />
    </Container>
  );
};
