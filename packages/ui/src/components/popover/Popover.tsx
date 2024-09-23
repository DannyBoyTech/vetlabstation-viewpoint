import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { PropsWithSpotTheme } from "../../utils/StyleConstants";

import type {
  PopoverFrom,
  PopoverOffsetTo,
  PopoverProps as SpotPackageSpotPopoverProps,
} from "@viewpoint/spot-react/src/components/popover/Popover";
import classNames from "classnames";
import {
  useFloating,
  autoUpdate,
  Placement,
  Side,
  Alignment,
  offset,
  OffsetOptions,
} from "@floating-ui/react";

const PopoverContainer = styled.div<{ _maxWidth?: number }>`
  ${(p) => (p._maxWidth != null ? `max-width: ${p._maxWidth}px;` : "")}

  &.spot-popover--left-center {
    /** Leave space for the caret plus remove the transform used by SPOT to position the popover **/
    transform: translateX(-16px);
  }

  &.spot-popover--right-center {
    /** Leave space for the caret plus remove the transform used by SPOT to position the popover **/
    transform: translateX(16px);
    left: unset;
  }

  &.spot-popover--left-center,
  &.spot-popover--right-center {
    /** Use relative position instead of absolute here so that we can calculate the height of the content **/
    position: relative;
    width: fit-content;
  }
`;

export interface SpotPopoverProps extends PopoverProps {
  fitWidth?: boolean;
}

export const SpotPopover = ({
  offsetTo = "center",
  ...props
}: SpotPopoverProps) => {
  const [maxWidth, setMaxWidth] = useState<number | undefined>(
    props.anchor?.getBoundingClientRect?.().width
  );
  const popoverClasses = classNames({
    "spot-popover": true,
    "spot-popover--shown": true,
    "spot-popover--bottom-center":
      props.popFrom === "bottom" && offsetTo === "center",
    "spot-popover--bottom-left":
      props.popFrom === "bottom" && offsetTo === "left",
    "spot-popover--bottom-right":
      props.popFrom === "bottom" && offsetTo === "right",

    "spot-popover--top-center":
      props.popFrom === "top" && offsetTo === "center",
    "spot-popover--top-left": props.popFrom === "top" && offsetTo === "left",
    "spot-popover--top-right": props.popFrom === "top" && offsetTo === "right",

    "spot-popover--left-center": props.popFrom === "left",
    "spot-popover--right-center": props.popFrom === "right",

    "spot-popover--small": props.inset === "small",
    "spot-popover--large": props.inset === "large",
    "spot-popover--no-inset": props.inset === "none",
  });

  useEffect(() => {
    if (props.anchor != null && props.fitWidth) {
      const obs = new ResizeObserver(() => {
        if (props.fitWidth && props.anchor != null) {
          const width = props.anchor.getBoundingClientRect().width;
          setMaxWidth(width);
        }
      });
      obs.observe(props.anchor);

      return () => {
        obs.disconnect();
      };
    }
  }, [props.anchor, props.fitWidth]);

  return (
    <Popover {...props}>
      <PopoverContainer
        data-testid="popover"
        className={popoverClasses}
        _maxWidth={props.fitWidth ? maxWidth : undefined}
      >
        {props.children}
      </PopoverContainer>
    </Popover>
  );
};

const PopoverWrapper = styled.div`
  z-index: 600;
`;

export interface PopoverProps
  extends Omit<
    SpotPackageSpotPopoverProps,
    "target" | "showCaret" | "caretAlign"
  > {
  anchor?: Element | null;
  gap?: number;
  strategy?: "absolute" | "fixed";
}

export const Popover = ({
  popFrom = "bottom",
  offsetTo = "center",
  gap = 0,
  anchor,
  onClickAway,
  children,
  className,
  strategy = "fixed",
}: PopoverProps) => {
  const { refs, floatingStyles, context } = useFloating({
    open: true,
    whileElementsMounted: autoUpdate,
    placement: convertPlacement(popFrom, offsetTo),
    strategy,
    elements: {
      reference: anchor,
    },
    middleware: [offset(SPOT_POPOVER_TOP_VALUES[popFrom]), offset(gap)],
  });

  useEffect(() => {
    function handleClickOutside(event: any) {
      if (
        refs.floating.current != null &&
        !refs.floating.current?.contains(event.target) &&
        !anchor?.contains(event.target)
      ) {
        onClickAway?.(event);
      }
    }

    // Bind the event listener
    if (anchor != null) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [anchor, onClickAway, refs.floating]);

  return anchor != null ? (
    <PopoverWrapper
      ref={refs.setFloating}
      style={floatingStyles}
      className={className}
    >
      {children}
    </PopoverWrapper>
  ) : (
    <></>
  );
};

// SPOT popover class now defines top position values that change depending
// on the popover from value. These need to be accounted for when calculating
// the position of the popover.
const SPOT_POPOVER_TOP_VALUES: { [key in PopoverFrom]?: OffsetOptions } = {
  bottom: -30,
  left: {
    crossAxis: -16,
  },
  right: {
    crossAxis: -16,
  },
};

// Convert our API values to floating-ui values
function convertPlacement(
  popFrom: PopoverFrom,
  offsetTo: PopoverOffsetTo
): Placement {
  const side: Side = popFrom; // Same values
  const alignment: Alignment | undefined =
    offsetTo === "left" ? "start" : offsetTo === "right" ? "end" : undefined;

  return alignment == null ? side : (`${side}-${alignment}` as Placement);
}
