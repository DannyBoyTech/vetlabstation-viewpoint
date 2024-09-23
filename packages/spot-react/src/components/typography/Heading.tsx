import React from "react";
import classNames from "classnames";

export type SizeType = 1 | 2 | 3 | 4 | 5;

export interface HeadingProps<C extends React.ElementType> {
  size?: SizeType;
  as?: C;
  children: React.ReactNode;
  className?: string;
}

export const Heading = <C extends React.ElementType = "div">(
  props: HeadingProps<C>
) => {
  const { as, children, className, size = 1 } = props;
  const Component = as || "div";

  const sizeClass = `spot-typography__heading--level-${size}`;
  const cmpClasses = classNames(className, sizeClass);

  return <Component className={cmpClasses}>{children}</Component>;
};
