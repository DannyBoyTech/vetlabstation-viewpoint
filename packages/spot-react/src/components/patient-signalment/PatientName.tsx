import classnames from "classnames";
import React, { MouseEventHandler } from "react";

export interface PatientNameProps extends React.PropsWithChildren {
  className?: string;
  onClick?: MouseEventHandler;
}

export const PatientName = ({
  className,
  onClick,
  children,
}: PatientNameProps) => {
  const classes = classnames(className, "spot-patient-display__pet-name", {
    clickable: onClick,
    "spot-link": onClick,
  });

  return (
    <span className={classes} onClick={onClick}>
      {children}
    </span>
  );
};
