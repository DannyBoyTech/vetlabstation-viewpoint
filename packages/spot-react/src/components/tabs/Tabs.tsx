import React, { HTMLAttributes, MutableRefObject, useCallback } from "react";
import { SpotIcon } from "@viewpoint/spot-icons";
import classNames from "classnames";
import { SpotIconName } from "@viewpoint/spot-icons/src/components/spot-icon/SpotIcon";

import "./Tabs.css";

export interface TabProps extends HTMLAttributes<HTMLDivElement> {
  active?: boolean;
  iconName?: SpotIconName;
  innerRef?: MutableRefObject<HTMLDivElement>;
  alwaysHover?: boolean;
}

const Tab = ({
  active,
  className,
  innerRef,
  iconName,
  alwaysHover,
  ...props
}: TabProps) => {
  const divClassnames = classNames(
    {
      "spot-tabs__link": true,
      "spot-tabs__link--with-icon": typeof iconName !== "undefined",
      "spot-tabs__link--active": active,
    },
    className
  );

  const liClassNames = classNames({
    "spot-tabs__tab": true,
    "spot-tabs__tab--hover": !active && alwaysHover,
  });

  return (
    <li className={liClassNames} style={{ cursor: "pointer" }}>
      <div className={divClassnames} {...props} ref={innerRef}>
        {iconName && <SpotIcon name={iconName} className="spot-tabs__icon" />}
        <span className="spot-tabs__link-text">{props.children}</span>
      </div>
    </li>
  );
};

export interface TabBarProps extends HTMLAttributes<HTMLDivElement> {
  scrollable?: boolean;
}

// TODO - this doesn't exactly match the scrolling provided by the Spot JS library, which will scroll only as far as the next visible block
const TabBar = ({ scrollable, className, ...props }: TabBarProps) => {
  const scrollerRef = React.useRef<HTMLUListElement>(null);

  const [showPrev, setShowPrev] = React.useState(false);
  const [showNext, setShowNext] = React.useState(false);

  const checkScrollState = useCallback(() => {
    if (scrollerRef.current) {
      const size = scrollerRef.current.getBoundingClientRect();

      // If there's no scrollability, don't show either
      // Give it a buffer of 2 pixels, sometimes in flex box scenarios the width of the container is a fraction
      // of a pixel smaller than the scrollWidth for some reason
      if (size.width + 2 >= scrollerRef.current.scrollWidth) {
        setShowPrev(false);
        setShowNext(false);
      }
      // if we're at scrollLeft === 0, don't show prev
      else if (scrollerRef.current.scrollLeft === 0) {
        setShowPrev(false);
        setShowNext(true);
        // If we're scrolled all the way to the right, just show prev, no next
      } else if (
        size.width + 2 + scrollerRef.current.scrollLeft >=
        scrollerRef.current.scrollWidth
      ) {
        setShowPrev(true);
        setShowNext(false);
        // We're somewhere in between - show both
      } else {
        setShowPrev(true);
        setShowNext(true);
      }
    }
  }, [scrollerRef]);

  // Check scroll state when scroller ref changes
  React.useEffect(checkScrollState, [checkScrollState]);

  // Check scroll state when window is resized
  React.useEffect(() => {
    window.addEventListener("resize", checkScrollState);
    return () => window.removeEventListener("resize", checkScrollState);
  }, [checkScrollState]);

  const tabBarClasses = classNames(className, "spot-tabs__list-wrap");

  return (
    <div className={tabBarClasses}>
      {scrollable && showPrev && (
        <button
          className="spot-tabs__scroll-button spot-tabs__scroll-button--previous"
          onClick={() =>
            scrollerRef.current?.scrollBy({
              behavior: "smooth",
              left: -(scrollerRef.current.clientWidth / 2),
            })
          }
        >
          <SpotIcon name="previous" className="spot-tabs__scroll-button-icon" />
        </button>
      )}
      <ul
        className="spot-tabs__list"
        onScroll={checkScrollState}
        ref={scrollerRef}
      >
        {props.children}
      </ul>
      {scrollable && showNext && (
        <button
          className="spot-tabs__scroll-button spot-tabs__scroll-button--next"
          onClick={() =>
            scrollerRef.current?.scrollBy({
              behavior: "smooth",
              left: scrollerRef.current.clientWidth / 2,
            })
          }
        >
          <SpotIcon name="next" className="spot-tabs__scroll-button-icon" />
        </button>
      )}
    </div>
  );
};

export interface TabWrapperProps extends HTMLAttributes<HTMLDivElement> {
  iconOnly?: boolean;
  scrollable?: boolean;
  scrollableContent?: boolean;
}

const Tabs = ({
  className,
  iconOnly,
  scrollable,
  scrollableContent,
  ...props
}: TabWrapperProps) => {
  const wrapperClasses = classNames(
    {
      "spot-tabs": true,
      "spot-tabs--responsive": true,
      "spot-tabs--icon-only": iconOnly,
      "spot-tabs--scrollable": scrollable,
      "spot-tabs--scrollable-content": scrollableContent,
    },
    className
  );

  return (
    <div className={wrapperClasses} {...props}>
      {props.children}
    </div>
  );
};

export interface TabContentProps extends HTMLAttributes<HTMLDivElement> {}

const TabContent = ({ className, ...props }: TabContentProps) => {
  const contentClasses = classNames(
    {
      "spot-tabs__content": true,
    },
    className
  );
  return (
    <div className={contentClasses} {...props}>
      {props.children}
    </div>
  );
};

Tabs.Tab = Tab;
Tabs.Content = TabContent;
Tabs.TabBar = TabBar;

export default Tabs;
