import { PropsWithChildren, useEffect, useState } from "react";
import styled from "styled-components";

export interface SlideOutProps extends PropsWithChildren {
  side: "left" | "right";
  open: boolean;
  // Called when user taps outside of the slide-out. This will usually trigger
  // the parent to switch the "open" prop to false, but continue rendering
  // this component until it calls back with "onCloseTransitionEnd"
  onTapShade: () => void;
  // Called when the slide-out transition is complete. Once this is called, it is
  // safe to unmount this component.
  onCloseTransitionEnd?: () => void;
  transitionDelay?: string;
  openWidth?: string;
}

const AnimatedPanel = styled.div<
  Pick<SlideOutProps, "openWidth" | "side" | "transitionDelay">
>`
  width: ${(p) => p.openWidth ?? "50%"};
  position: fixed;
  top: 0;
  bottom: 0;
  ${(p) =>
    p.side === "left"
      ? `left: -${p.openWidth ?? "50%"};`
      : `right: -${p.openWidth ?? "50%"};`}

  transition: all ${(p) => p.transitionDelay ?? "0.3s"} ease-in-out;

  &.visible {
    ${(p) => (p.side === "left" ? "left: 0;" : "right: 0;")}
  }

  z-index: 100;
`;

const Shade = styled.div<Pick<SlideOutProps, "transitionDelay">>`
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1;
  opacity: 0.25;
  background-color: black;
`;

export function SlideOut({
  children,
  onCloseTransitionEnd,
  onTapShade,
  ...props
}: SlideOutProps) {
  // Use internal state synced with parent since the open transition is triggered
  // from going transitioning into the .visible CSS class -- callers will often
  // conditionally render this component using the "open" prop, so we need to
  // first render with no class then quickly add the "visible" class based on the prop
  const [openInternal, setOpenInternal] = useState(false);

  useEffect(() => {
    setOpenInternal(props.open);
  }, [props.open]);

  return (
    <>
      <AnimatedPanel
        onTransitionEnd={() => {
          if (!openInternal) {
            onCloseTransitionEnd?.();
          }
        }}
        className={openInternal ? "visible" : undefined}
        {...props}
      >
        {children}
      </AnimatedPanel>
      {openInternal && (
        <Shade
          className={openInternal ? "visible" : undefined}
          {...props}
          onClick={onTapShade}
        />
      )}
    </>
  );
}

// Syncs the provided "open" boolean with internal state, but provides a separate
// setter -- this is helpful as users of this component will likely need
// to continue rendering the SlideOut component when it has been "closed" up
// until ths SlideOut's close animation has completed, at which point it can
// be unmounted.
export function useOpenStateForSlideout(open: boolean) {
  const [closing, setClosing] = useState(false);

  // The effect is required since the caller needs a way to reset the "closing"
  // state to true when the primary "open" prop goes back to true
  useEffect(() => {
    setClosing(open);
  }, [open]);

  return [closing, setClosing] as const;
}
