import { forwardRef, HTMLAttributes } from "react";
import classNames from "classnames";

export interface SpotTextProps extends HTMLAttributes<HTMLDivElement> {
  level:
    | "h1"
    | "h2"
    | "h3"
    | "h4"
    | "h5"
    | "paragraph"
    | "secondary"
    | "tertiary";
  bold?: boolean;
  className?: string;
}

export const SpotText = forwardRef<HTMLDivElement, SpotTextProps>(
  ({ level, bold, className, ...props }, ref) => {
    const classes = classNames(className, {
      "spot-typography__heading--level-1": level === "h1",
      "spot-typography__heading--level-2": level === "h2",
      "spot-typography__heading--level-3": level === "h3",
      "spot-typography__heading--level-4": level === "h4",
      "spot-typography__heading--level-5": level === "h5",
      "spot-typography__text--body": level === "paragraph",
      "spot-typography__text--secondary": level === "secondary",
      "spot-typography__text--tertiary": level === "tertiary",
      "spot-typography__font-weight--bold": bold,
    });
    return <div className={classes} {...props} ref={ref} />;
  }
);
