import React from "react";
import classNames from "classnames";

export type HeaderType = "sticky" | "fixed" | "normal";

export interface HeaderProps {
  className?: string;
  headerType?: HeaderType;
  leftContent?: React.ReactNode;
  centerContent?: React.ReactNode;
  optionalContent?: React.ReactNode;
  leftAligned?: boolean;
  fluid?: boolean;
  rightContent?: React.ReactNode;
}

export const Header = (props: HeaderProps): JSX.Element => {
  const {
    className,
    headerType = "normal",
    leftContent,
    centerContent,
    optionalContent,
    leftAligned = false,
    fluid = false,
    rightContent,
  } = props;

  const headerClasses = classNames("spot-header", className, {
    "spot-header--sticky-top": headerType === "sticky",
    "spot-header--fixed-top": headerType === "fixed",
    "spot-header--left-aligned": leftAligned,
    "spot-header--fluid": fluid,
  });

  return (
    <nav className={headerClasses}>
      <div className="spot-header__wrapper">
        {leftContent && (
          <div className="spot-header__left-content">{leftContent}</div>
        )}

        {centerContent && (
          <div
            data-testid="header-center"
            className="spot-header__center-content"
          >
            {centerContent}
          </div>
        )}

        {optionalContent && (
          <div
            data-testid="header-optional"
            className="spot-header__optional-content"
          >
            {optionalContent}
          </div>
        )}

        {rightContent && (
          <div
            data-testid="header-right"
            className="spot-header__right-content"
          >
            {rightContent}
          </div>
        )}
      </div>
    </nav>
  );
};
