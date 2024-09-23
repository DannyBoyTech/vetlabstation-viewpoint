import React, { LiHTMLAttributes } from "react";
import classNames from "classnames";

export interface NavItemsProps extends React.PropsWithChildren {
  navType?: "links" | "country-flags" | "global-icons";
  className?: string;
  moveLeft?: boolean;
}

export const NavItems = ({ className, ...props }: NavItemsProps) => {
  const { navType = "links", moveLeft = false, ...rest } = props;

  const navClasses = classNames(className, "spot-header__nav-items", {
    "spot-header__optional-content__global-links": navType === "links",
    "spot-header__optional-content__country-flags": navType === "country-flags",
    "spot-header__optional-content__global-icons": navType === "global-icons",
    "spot-header__optional-content--move-left": moveLeft,
  });

  return <ul className={navClasses} {...rest} />;
};

export interface NavItemProps extends LiHTMLAttributes<HTMLLIElement> {}

export const NavItem = (props: NavItemProps) => {
  const { children, className, ...rest } = props;

  const classes = classNames(className, "spot-header__nav-item");

  return (
    <li className={classes} {...rest}>
      {children}
    </li>
  );
};
