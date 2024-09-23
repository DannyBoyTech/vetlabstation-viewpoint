import React from "react";
import classNames from "classnames";

export type LinkSize = "small" | "medium" | "large";

export interface LinkProps {
  size?: LinkSize;
  ellipsis?: boolean;
  iconLeft?: React.ReactElement;
  iconRight?: React.ReactElement;
  className?: string;
  children?: React.ReactNode;
  href?: string;
  disabled?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  "data-testid"?: string;
}

export const Link = (props: LinkProps) => {
  const {
    children,
    href,
    className,
    size,
    ellipsis,
    iconRight,
    iconLeft,
    disabled,
    onClick,
  } = props;

  const linkClassNames = React.useMemo(
    () =>
      classNames(className, {
        "spot-link": true,
        "spot-link--small": size === "small",
        "spot-link--large": size === "large",
        "spot-link--ellipsis": ellipsis,
        "spot-link--disabled": disabled,
      }),
    [className, ellipsis, size, disabled]
  );

  const clonedIconRight = React.useMemo(() => {
    const iconClassnames = classNames(
      "spot-icon",
      "spot-link__icon",
      "spot-link__icon--right"
    );

    return (
      iconRight && React.cloneElement(iconRight, { className: iconClassnames })
    );
  }, [iconRight]);

  const clonedIconLeft = React.useMemo(() => {
    const iconClassnames = classNames(
      "spot-icon",
      "spot-link__icon",
      "spot-link__icon--left"
    );

    return (
      iconLeft && React.cloneElement(iconLeft, { className: iconClassnames })
    );
  }, [iconLeft]);

  return (
    <a
      href={href}
      className={linkClassNames}
      onClick={onClick}
      data-testid={props["data-testid"]}
    >
      {clonedIconLeft && <>{clonedIconLeft}</>}
      {children}
      {clonedIconRight && <>{clonedIconRight}</>}
    </a>
  );
};
