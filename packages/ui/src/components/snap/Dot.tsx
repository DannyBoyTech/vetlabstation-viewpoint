import styled from "styled-components";
import { CSSProperties, forwardRef } from "react";
import { DotLayoutValues, DotPosition } from "./snap-constants";
import classnames from "classnames";

const Dot = styled.div<{ _dotHeight: number; _fillColor?: string }>`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;

  width: ${(p) => p._dotHeight}px;
  height: ${(p) => p._dotHeight}px;
  border-radius: 50%;

  outline: 3px dashed #306f93;

  &:active:not(.control) {
    opacity: 0.5;
  }

  &.dot-selected {
    background: ${(p) => p._fillColor ?? "#8bacca"};
    outline: unset;
  }

  &.control {
    background: ${(p) => p._fillColor ?? "#306f93"};
    outline: unset;
  }
`;
const InnerDot = styled.div<{ _dotHeight: number }>`
  width: ${(p) => p._dotHeight}px;
  height: ${(p) => p._dotHeight}px;

  border-radius: 50%;
  background: #e4e9ec;
`;

export interface SelectableDotProps {
  position: DotPosition;
  dotHeight: number;

  onClick?: () => void;
  selected?: boolean;
  control?: boolean;
  fillColor?: string;

  style?: CSSProperties;
  "data-testid"?: string;
}

export const SelectableDot = forwardRef<HTMLDivElement, SelectableDotProps>(
  (props, forwardedRef) => {
    const classes = classnames("selectable-dot", {
      "dot-selected": props.selected,
      control: props.control,
    });
    return (
      <Dot
        data-testid={props["data-testid"]}
        ref={forwardedRef}
        className={classes}
        onClick={props.onClick}
        style={props.style}
        _dotHeight={props.dotHeight}
        _fillColor={props.fillColor}
      >
        {!props.selected && !props.control && (
          <InnerDot _dotHeight={props.dotHeight * 0.7} />
        )}
      </Dot>
    );
  }
);
