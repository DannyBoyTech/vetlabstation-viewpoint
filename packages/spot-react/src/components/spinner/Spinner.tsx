import React from "react";
import { SpotIcon } from "@viewpoint/spot-icons";
import classNames from "classnames";

export interface SpinnerProps {
  size?: "small" | "medium" | "large";
  className?: string;
}

const Spinner = ({ size, className }: SpinnerProps) => {
  const classes = classNames(
    {
      "spot-loading-spinner": true,
      "spot-loading-spinner--large": size === "large",
      "spot-loading-spinner--small": size === "small",
    },
    className
  );
  return <SpotIcon name="spinner" className={classes} />;
};

export default Spinner;
