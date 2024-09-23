import React, { useContext, useRef, useState } from "react";

import styled from "styled-components";
import { ViewpointThemeContext } from "../../context/ThemeContext";
import { SpotPopover } from "../popover/Popover";
import { useFormatDate } from "../../utils/hooks/datetime";
import { createPortal } from "react-dom";
import { getInstrumentDisplayImage } from "../../utils/instrument-utils";
import { SpotText } from "@viewpoint/spot-react";
import { DarkTheme } from "../../utils/StyleConstants";

export type DotSize = "normal" | "large";

export interface DotProps {
  value?: number;
  cx?: number;
  cy?: number;
  refLow: number;
  refHigh: number;
  payload?: any;
  size?: DotSize;
  hideRefRange?: boolean;
  outOfRangeHighColor?: string;
  outOfRangeLowColor?: string;
  portalTarget?: HTMLElement;
  disableClick?: boolean;
}

const Circle = styled.circle<{ $fillColor?: string }>`
    .${DarkTheme.primaryContainerClass} & {
        fill: ${DarkTheme.colors?.text?.primary};
    }

    &&& {
        ${(p) => (p.$fillColor == null ? "" : `fill: ${p.$fillColor};`)}
    }
}
`;

export const ActiveDot = () => {
  return null;
};

interface RenderDotProps {
  x: number | undefined;
  y: number | undefined;
  outOfRefRange: boolean | number | undefined;
  onClick?: (e: React.MouseEvent) => void;
  dotSize?: "normal" | "large";
  open: boolean;
  outOfRangeColor?: string;
}

const RenderDot = React.forwardRef<SVGSVGElement, RenderDotProps>(
  (props, ref) => {
    const { theme } = useContext(ViewpointThemeContext);
    const { dotSize = "normal" } = props;

    const dimension = dotSize === "normal" ? 10 : 16;
    const radius = dimension / 2;

    if (props.outOfRefRange && !props.open) {
      return (
        <svg
          onClick={(e) => props.onClick?.(e)}
          ref={ref}
          x={props.x}
          y={props.y}
          height={dimension}
          width={dimension}
        >
          <Circle
            cx={radius}
            cy={radius}
            r={radius}
            $fillColor={
              !!props.outOfRefRange ? props.outOfRangeColor : undefined
            }
          />
        </svg>
      );
    }

    return (
      <svg
        onClick={(e) => props.onClick?.(e)}
        ref={ref}
        x={props.x}
        y={props.y}
        height={dimension}
        width={dimension}
      >
        <Circle
          cx={radius}
          cy={radius}
          r={radius}
          $fillColor={!!props.outOfRefRange ? props.outOfRangeColor : undefined}
        />
      </svg>
    );
  }
);

const TooltipContent = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;

  & p {
    margin: 0;
    line-height: 20px;
  }

  & img {
    width: 30px;
    padding-right: 10px;
  }
`;

const TextWithColor = styled(SpotText)<{ $color?: string }>`
  text-wrap: nowrap;
  && {
    ${(p) => (p.$color == null ? "" : `color: ${p.$color};`)}
  }
`;

const StyledPopover = styled(SpotPopover)`
  .${DarkTheme.primaryContainerClass} & {
    > .spot-popover,
    > .spot-popover::before {
      background-color: ${DarkTheme.colors?.background?.secondary};
    }
  }
`;

export const CustomDot = (props: DotProps) => {
  const {
    cx,
    cy,
    value,
    refLow,
    refHigh,
    payload,
    outOfRangeHighColor,
    outOfRangeLowColor,
    size = "normal",
    hideRefRange = false,
    portalTarget = document.body,
  } = props;

  const formatDate = useFormatDate();
  const [popoverOpen, setPopoverOpen] = useState(false);
  const renderAnchor = useRef<SVGSVGElement | null>(null);

  const data = cx && cy;
  const outOfReferenceRange =
    value && !hideRefRange && (value > refHigh || value < refLow);

  const fillColor =
    outOfReferenceRange && value > refHigh
      ? outOfRangeHighColor
      : outOfReferenceRange && value < refLow
      ? outOfRangeLowColor
      : undefined;

  const dotSize = size === "normal" ? 5 : 8;

  if (data) {
    return (
      <>
        <RenderDot
          dotSize={size}
          x={cx ? cx - dotSize : 0}
          y={cy ? cy - dotSize : 0}
          outOfRefRange={outOfReferenceRange}
          open={popoverOpen}
          outOfRangeColor={fillColor}
          onClick={
            props.disableClick
              ? undefined
              : (ev) => {
                  renderAnchor.current =
                    renderAnchor.current == null
                      ? (ev.target as SVGSVGElement)
                      : null;
                  setPopoverOpen(!popoverOpen);
                }
          }
        />
        {createPortal(
          <StyledPopover
            strategy={"absolute"}
            anchor={renderAnchor.current}
            open={true}
            onClickAway={() => {
              renderAnchor.current = null;
              setPopoverOpen(false);
            }}
            popFrom={"top"}
            offsetTo="center"
          >
            <TooltipContent>
              <div>
                <img
                  src={getInstrumentDisplayImage(payload.source)}
                  alt={payload.source}
                />
              </div>
              <div>
                <SpotText level="tertiary">{formatDate(payload.date)}</SpotText>
                <TextWithColor level="secondary" bold $color={fillColor}>
                  {payload.label}
                </TextWithColor>
              </div>
            </TooltipContent>
          </StyledPopover>,
          portalTarget
        )}
      </>
    );
  } else {
    return null;
  }
};
