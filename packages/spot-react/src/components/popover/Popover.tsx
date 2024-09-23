import React, {
  MouseEventHandler,
  MutableRefObject,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
} from "react";
import styled from "styled-components";
import classnames from "classnames";
import { useOutOfViewTracker } from "./hooks";

const PopoverParent = styled.div`
  position: relative;
  display: inline-block;
  overflow: visible;
`;

const PopoverTarget = styled.div`
  display: inline-block;
`;

const PopoverContainer = styled.div`
  &.caret-hidden::before {
    content: none;
  }

  &.caret-hidden.spot-popover--top-center {
    transform: translateX(-50%) translateY(-3px);
  }

  /* vv remove space reserved for caret when hidden */

  &.caret-hidden.spot-popover--top-left {
    transform: translateX(-100%) translateX(23px) translateY(-3px);
  }

  &.caret-hidden.spot-popover--top-right {
    transform: translateX(100%) translateX(-23px) translateY(-3px);
  }

  &.caret-hidden.spot-popover--center-right,
  &.caret-hidden.spot-popover--right-center {
    transform: translateX(3px) translateY(-50%);
  }

  &.caret-hidden.spot-popover--bottom-center {
    transform: translateX(-50%) translateY(3px);
  }

  &.caret-hidden.spot-popover--bottom-left {
    transform: translateX(23px) translateY(3px);
  }

  &.caret-hidden.spot-popover--bottom-right {
    transform: translateX(-23px) translateY(3px);
  }

  &.caret-hidden.spot-popover--center-left,
  &.caret-hidden.spot-popover--left-center {
    transform: translateX(-100%) translateX(-3px) translateY(-50%);
  }

  /* ^^ remove space reserved for caret when hidden */
`;

export type PopoverFrom = "top" | "left" | "bottom" | "right";
export type PopoverOffsetTo = "left" | "center" | "right";
export type PopoverCaretAlign = "left" | "right";
export type PopoverInset = "small" | "medium" | "large" | "none";

interface PopoverProps {
  target: ReactNode;
  children?: ReactNode;
  open?: boolean;
  onClickTarget?: MouseEventHandler;
  onClickAway?: (ev: MouseEvent) => void;
  className?: string;
  popFrom?: PopoverFrom;
  offsetTo?: PopoverOffsetTo;
  caretAlign?: PopoverCaretAlign;
  inset?: PopoverInset;
  showCaret?: boolean;

  // Element to test on intersection -- if the popover passes this element (aka
  // scrolls out of view), it will trigger the onOutOfView callback. Omitting this
  // value will use the closest viewport as root.
  intersectionRootRef?: MutableRefObject<HTMLElement | null>;
  // Called when the popover moves out of view relative to the intersection root.
  // Can be useful for allowing caller to change the `popFrom` prop based on where
  // the popover has been scrolled to
  onOutOfView?: (position: "top" | "bottom") => void;
}

const classForInset: Record<PopoverInset, string> = {
  small: "spot-popover--small",
  medium: "",
  large: "spot-popover--large",
  none: "spot-popover--no-inset",
} as const;

function spotPopoverClasses(props: PopoverProps) {
  const popFrom = props.popFrom ?? "bottom";
  const offsetTo = props.offsetTo ?? "center";
  const validCombination =
    ["top", "bottom"].includes(popFrom) || offsetTo === "center";

  const caretAlign = props.caretAlign;
  const showCaret = props.showCaret ?? true;

  const classes = ["spot-popover", "spot-popover-container"];

  if (validCombination) {
    classes.push(`spot-popover--${popFrom}-${offsetTo}`);
  } else {
    classes.push(`spot-popover--${popFrom}-center`);
  }

  if (!showCaret) {
    classes.push("caret-hidden");
  }

  if (offsetTo !== "center" && caretAlign && caretAlign !== offsetTo) {
    classes.push(`spot-popover--align-${popFrom}-${caretAlign}`);
  }

  if (props.inset) {
    classes.push(classForInset[props.inset]);
  }

  return classnames(classes);
}

const Popover = (props: PopoverProps) => {
  const targetRef = useRef<any>(null);
  const popoverRef = useRef<any>(null);

  const { onClickAway } = props;
  const onDocumentClick = useCallback(
    (ev: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(ev.target) &&
        targetRef.current &&
        !targetRef.current.contains(ev.target)
      ) {
        onClickAway?.(ev);
      }
    },
    [onClickAway]
  );

  useEffect(() => {
    document.addEventListener("click", onDocumentClick);
    return () => document.removeEventListener("click", onDocumentClick);
  }, [onDocumentClick]);

  const classes = classnames(props.className, spotPopoverClasses(props), {
    ["spot-popover--shown"]: props.open,
  });

  useOutOfViewTracker({
    disabled: !props.open || props.onOutOfView == null,
    rootElementRef: props.intersectionRootRef,
    trackedElementRef: popoverRef,
    onOutOfView: props.onOutOfView == null ? () => {} : props.onOutOfView,
  });

  return (
    <PopoverParent className="spot-popover-wrapper">
      <PopoverTarget
        ref={targetRef}
        className="spot-popover-target"
        onClick={props.onClickTarget}
      >
        {props.target}
      </PopoverTarget>

      <PopoverContainer ref={popoverRef} className={classes}>
        {props.children}
      </PopoverContainer>
    </PopoverParent>
  );
};

export default Popover;

export { Popover };

export type { PopoverProps };
