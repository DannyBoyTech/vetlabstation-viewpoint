import React, { HTMLAttributes } from "react";
import classNames from "classnames";

export interface ProgressBarProps extends HTMLAttributes<HTMLDivElement> {
  progress?: number;
  indeterminate?: boolean;
  size?: "small" | "large";
  secondary?: boolean;
  success?: boolean;
}

const ProgressBar = ({
  size,
  className,
  progress,
  indeterminate,
  secondary,
  success,
  ...props
}: ProgressBarProps) => {
  const classes = classNames(
    {
      "spot-progress-bar": true,
      "spot-progress-bar--large": size === "large",
      "spot-progress-bar--small": size === "small",
      "spot-progress-bar--secondary": secondary,
      "spot-progress-bar--success": success,
      "spot-progress-bar--indeterminate": indeterminate,
    },
    className
  );
  return (
    <div className={classes} {...props}>
      <div
        className="spot-progress-bar__value"
        style={{ width: `${progress != null ? progress * 100 : "0"}%` }}
      ></div>
    </div>
  );
};

export default ProgressBar;
