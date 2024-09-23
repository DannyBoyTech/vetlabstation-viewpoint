import React, { ElementType, ReactNode } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import { forwardRefWithAs } from "../../polymorphic";

const BADGE_CLASS = "spot-badge";

export const BADGE_COLOR_LIST = [
  "primary",
  "secondary",
  "positive",
  "negative",
  "warning",
] as const;

export const BADGE_PLACEMENT_LIST = [
  "top-left",
  "top-right",
  "bottom-left",
  "bottom-right",
] as const;

export interface BadgeProps {
  children: ReactNode;
  badgeContent?: ReactNode;
  placement?: (typeof BADGE_PLACEMENT_LIST)[number];
  color?: (typeof BADGE_COLOR_LIST)[number];
  variant?: "dot" | "default";
  size?: "small" | "default" | "large";
  textSize?: "short" | "default";
  hideBadge?: boolean;
}

export const Badge = forwardRefWithAs<"span", BadgeProps>(
  (
    {
      as,
      children,
      className,
      badgeContent,
      placement,
      color = "primary",
      variant,
      size,
      textSize,
      hideBadge = false,
      ...rest
    },
    ref
  ) => {
    const Component: ElementType = as ?? "span";

    const isDot = variant === "dot";
    const isSmall = size === "small";
    const isLarge = size === "large";
    const isShortText = textSize === "short";
    return (
      <Component
        {...rest}
        className={classNames(`${BADGE_CLASS}-group`, className)}
        ref={ref}
      >
        {children}
        {!hideBadge ? (
          <span
            className={classNames(BADGE_CLASS, {
              [`${BADGE_CLASS}--${color}`]: color,
              [`${BADGE_CLASS}--dot`]: isDot,
              [`${BADGE_CLASS}--small`]: isSmall,
              [`${BADGE_CLASS}--large`]: isLarge,
              [`${BADGE_CLASS}--short-text`]: !isDot && isShortText,
              [`${BADGE_CLASS}--${placement}`]: placement,
            })}
          >
            {isDot ? (
              <span className="spot--screenreader-only">{badgeContent}</span>
            ) : (
              badgeContent
            )}
          </span>
        ) : null}
      </Component>
    );
  }
);

Badge.displayName = "Badge";

Badge.propTypes = {
  badgeContent: PropTypes.node,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  variant: PropTypes.oneOf(["dot", "default"]),
  size: PropTypes.oneOf(["small", "default", "large"]),
  textSize: PropTypes.oneOf(["short", "default"]),
  placement: PropTypes.oneOf(BADGE_PLACEMENT_LIST),
  hideBadge: PropTypes.bool,
  color: PropTypes.oneOf(BADGE_COLOR_LIST),
};
