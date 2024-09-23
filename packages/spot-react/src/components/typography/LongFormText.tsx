import React from "react";
import classNames from "classnames";

export interface LongFormTextProps {
  children: React.ReactNode;
  className?: string;
}

export const LongFormText = (props: LongFormTextProps) => {
  const { children, className } = props;

  const textClasses = React.useMemo(
    () => classNames(className, "spot-long-form-text"),
    [className]
  );
  return <div className={textClasses}>{children}</div>;
};
