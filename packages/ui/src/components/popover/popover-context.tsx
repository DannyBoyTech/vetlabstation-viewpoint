import React, {
  cloneElement,
  PropsWithChildren,
  useCallback,
  useRef,
} from "react";

export interface PopoverContext {
  getPortalTarget: () => HTMLElement | null;
}

export const PopoverContext = React.createContext<PopoverContext>({
  getPortalTarget: () => null,
});

/**
 Optional context for popover component that allows user to specify a portal
 target for the popover. This can be helpful if the original position in the
 DOM hierarchy prevents the popover from displaying over other elements.
 */
const PopoverContextProvider = (props: PropsWithChildren) => {
  const targetRef = useRef<HTMLDivElement | null>(null);
  const getPortalTarget = useCallback(() => targetRef.current, []);

  return (
    <PopoverContext.Provider value={{ getPortalTarget }}>
      {React.isValidElement(props.children)
        ? cloneElement(props.children as React.ReactElement, { ref: targetRef })
        : props.children}
    </PopoverContext.Provider>
  );
};

export default PopoverContextProvider;
