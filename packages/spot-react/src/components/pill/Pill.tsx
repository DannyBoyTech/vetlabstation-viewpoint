import React, { HTMLAttributes } from "react";
import classNames from "classnames";
import { SpotIconName } from "@viewpoint/spot-icons/src/components/spot-icon/SpotIcon";
import { SpotIcon } from "@viewpoint/spot-icons";

export interface PillProps extends HTMLAttributes<HTMLSpanElement> {
  className?: string;
  level?: "primary" | "secondary" | "positive" | "negative" | "warning";
  outline?: boolean;
  small?: boolean;
  leftIcon?: SpotIconName;
  rightIcon?: SpotIconName;
  interactive?: boolean;
}

const Pill = ({
  className,
  level,
  outline,
  small,
  leftIcon,
  rightIcon,
  children,
  interactive,
  ...props
}: PillProps) => {
  const pillClasses = classNames(
    {
      "spot-pill": true,
      "spot-pill--primary": level === "primary",
      "spot-pill--secondary": level === "secondary",
      "spot-pill--positive": level === "positive",
      "spot-pill--negative": level === "negative",
      "spot-pill--warning": level === "warning",
      "spot-pill--outline": outline,
      "spot-pill--small": small,
      "spot-pill--interactive": interactive,
    },
    className
  );
  return (
    <span className={pillClasses} {...props}>
      {leftIcon && (
        <SpotIcon
          name={leftIcon}
          className="spot-pill__icon spot-pill__icon--left"
        />
      )}
      {children}
      {rightIcon && (
        <SpotIcon
          name={rightIcon}
          className="spot-pill__icon spot-pill__icon--right"
        />
      )}
    </span>
  );
};

export default Pill;
