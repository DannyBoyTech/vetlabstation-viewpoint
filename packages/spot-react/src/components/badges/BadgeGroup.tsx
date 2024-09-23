import React from "react";
import classNames from "classnames";

export interface BadgeGroupProps extends React.PropsWithChildren {
  className?: string;
  badgeContent?: React.ReactNode;
  color?:
    | "primary"
    | "secondary"
    | "green"
    | "red"
    | "yellow"
    | "positive"
    | "negative";
  placement?: "top-right" | "bottom-right" | "bottom-left" | "top-left";
  size?: "default" | "small";
  type?: "short-text" | "dot";
  visible?: boolean;
}
export const BadgeGroup = (props: BadgeGroupProps) => {
  const {
    color = "primary",
    badgeContent,
    placement = "top-right",
    size = "default",
    type = "dot",
    visible,
    children,
  } = props;

  const rootClasses = classNames(props.className, "spot-badge-group");

  const badgeClasses = classNames("spot-badge", {
    "spot-badge--primary": color === "primary",
    "spot-badge--secondary": color === "secondary",
    "spot-badge--green": color === "green",
    "spot-badge--red": color === "red",
    "spot-badge--yellow": color === "yellow",
    "spot-badge--positive": color === "positive",
    "spot-badge--negative": color === "negative",
    "spot-badge--small": size === "small",
    "spot-badge--dot": type === "dot",
    "spot-badge--short-text": type === "short-text",
    "spot-badge--top-left": placement === "top-left",
    "spot-badge--top-right": placement === "top-right",
    "spot-badge--bottom-right": placement === "bottom-right",
    "spot-badge--bottom-left": placement === "bottom-left",
  });

  return (
    <span className={rootClasses}>
      {children}
      {visible ? <span className={badgeClasses}>{badgeContent}</span> : null}
    </span>
  );
};
