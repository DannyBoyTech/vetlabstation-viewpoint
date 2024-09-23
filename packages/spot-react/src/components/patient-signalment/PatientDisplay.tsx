import classnames from "classnames";
import React from "react";

export interface PatientDisplayProps extends React.PropsWithChildren {
  className?: string;
  size?: "large" | "medium" | "small" | "xs";
}
export const PatientDisplay = ({
  className,
  size,
  children,
}: PatientDisplayProps) => {
  const classes = classnames(className, "spot-patient-display", {
    [`spot-patient-display--${size}`]: size,
  });
  return <div className={classes}>{children}</div>;
};
