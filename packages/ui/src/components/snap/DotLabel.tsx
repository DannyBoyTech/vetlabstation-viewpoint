import styled from "styled-components";
import { forwardRef, ReactNode } from "react";

const LabelContainer = styled.div<{ _pxHeight: number; _pxWidth?: number }>`
  position: absolute;
  display: flex;

  height: ${(p) => p._pxHeight}px;
  ${(p) => (p._pxWidth == null ? "" : `width: ${p._pxWidth}px;`)}

  align-items: center;
  gap: 8px;
  user-select: none;
`;
const Line = styled.div`
  flex: auto;
  height: 1px;
  min-width: 20px;
  background-color: #97999b;
`;

const TextContainer = styled.div``;

interface DotLabelProps {
  pxHeight: number;
  pxWidth: number;
  labelPosition: "left" | "right";
  top?: string | number;
  left?: string | number;
  right?: string | number;
  label: ReactNode;
  "data-testid"?: string;
}

/**
 * Label that appears to the side of the selectable dot
 */
export const DotLabel = forwardRef<HTMLDivElement, DotLabelProps>(
  (props, forwardedRef) => (
    <LabelContainer
      data-testid={props["data-testid"]}
      ref={forwardedRef}
      _pxHeight={props.pxHeight}
      _pxWidth={props.pxWidth}
      style={{
        top: props.top,
        left: props.labelPosition === "left" ? 0 : props.left,
        right: props.labelPosition === "right" ? 0 : props.right,
      }}
    >
      {props.labelPosition === "right" && <Line />}

      <TextContainer>{props.label}</TextContainer>

      {props.labelPosition === "left" && <Line />}
    </LabelContainer>
  )
);
