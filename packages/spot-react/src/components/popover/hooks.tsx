import { MutableRefObject, useEffect, useState } from "react";

export interface OutOfViewTrackerProps {
  // Disable tracking
  disabled?: boolean;
  // The element to track. When it goes out of view with respect to the root element,
  // the onOutOfView callback will be invoked.
  trackedElementRef?: MutableRefObject<HTMLElement | null>;
  // The root to use. When the other elements move out of view of this element,
  // the callback(s) will be invoked. If not supplied, the viewport is used.
  rootElementRef?: MutableRefObject<HTMLElement | null>;
  // Callback for when one of the elements moves out of view in relation to the root element
  onOutOfView: (intersectedPosition: "top" | "bottom") => void;
  // Margin offset to apply to the top of the element's tracking bounds
  elementTopOffset?: string;
  // Margin offset to apply to the bottom of the element's tracking bounds
  elementBottomOffset?: string;
}

/**
 * Track when an element begins to stop intersecting with another element.
 * Can be used to determine whether a Popover's "popFrom" prop should change
 * due to the popover changing position.
 *
 * eg. if the user scrolls while a popover is open and that popover will start to
 * leave the viewport, this utility can be used to change the "popFrom" value
 * so that it can remain in the viewport.
 */
export function useOutOfViewTracker(props: OutOfViewTrackerProps) {
  const {
    disabled,
    trackedElementRef,
    rootElementRef,
    onOutOfView,
    elementBottomOffset,
    elementTopOffset,
  } = props;

  useEffect(() => {
    if (!disabled) {
      // Create an intersection observer with a top offset equal to the -height
      // of the element being tracked. This will notify with isIntersecting = false
      // as soon as the top of the element stops intersecting with the root.
      const topObserver = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) {
            // No need to call back if the top goes out of view while the bottom is already out of view --
            // just means that the entire object is now out of view, implying that the
            // caller didn't do anything to rectify the bottom going out of view (or maybe there
            // is nothing that can be done since the entire target is out of view)
            const bottomIsAlreadyOut =
              (trackedElementRef?.current?.getBoundingClientRect().bottom ??
                0) > (entry.rootBounds?.bottom ?? 0);
            if (!bottomIsAlreadyOut) {
              onOutOfView?.("top");
            }
          }
        },
        {
          root: rootElementRef?.current,
          rootMargin: elementTopOffset,
          threshold: 1,
        }
      );

      if (trackedElementRef?.current != null) {
        topObserver.observe(trackedElementRef.current);
      }

      // Create an intersection observer with a bottom offset equal to the -height
      // of the element being tracked. This will notify with isIntersecting = false
      // as soon as the bottom of the element stops intersecting with the root.
      const bottomObserver = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) {
            const topIsAlreadyOut =
              (trackedElementRef?.current?.getBoundingClientRect().top ?? 0) <
              (entry.rootBounds?.top ?? 0);
            if (!topIsAlreadyOut) {
              onOutOfView?.("bottom");
            }
          }
        },
        {
          root: rootElementRef?.current,
          rootMargin: elementBottomOffset,
          threshold: 1,
        }
      );

      if (trackedElementRef?.current != null) {
        bottomObserver.observe(trackedElementRef.current);
      }

      return () => {
        topObserver.disconnect();
        bottomObserver.disconnect();
      };
    }
  }, [
    disabled,
    elementBottomOffset,
    elementTopOffset,
    onOutOfView,
    rootElementRef,
    trackedElementRef,
  ]);
}
