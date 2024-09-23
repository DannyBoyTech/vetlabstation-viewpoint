import React, { ButtonHTMLAttributes, ReactNode, Ref } from "react";
import classNames from "classnames";
import { SpotIconName } from "@viewpoint/spot-icons/src/components/spot-icon/SpotIcon";
import { SpotIcon } from "@viewpoint/spot-icons";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  buttonType?: "primary" | "secondary" | "link";
  buttonSize?: "large" | "small" | "default";
  focused?: boolean;
  active?: boolean;
  leftIcon?: SpotIconName | ReactNode;
  rightIcon?: SpotIconName | ReactNode;
  iconOnly?: boolean;
  iconColor?: string;
  spinIcon?: boolean;
  innerRef?: Ref<HTMLButtonElement>;
}

const Button = ({
  className,
  buttonType,
  buttonSize,
  leftIcon,
  rightIcon,
  iconOnly,
  iconColor,
  spinIcon,
  innerRef,
  focused,
  active,
  ...props
}: ButtonProps) => {
  const buttonTypeClass = `spot-button--${buttonType || "primary"}`;
  const buttonSizeClass = `spot-button--${buttonSize || "default"}`;

  const btnClasses = classNames(
    {
      "spot-button": true,
      [buttonTypeClass]: true,
      [buttonSizeClass]: true,
      "spot-button--with-icon":
        typeof leftIcon !== "undefined" || typeof rightIcon !== "undefined",
      "spot-button--icon-only ": iconOnly,
      "spot-button--focus": focused,
      "spot-button--active": active,
    },
    className
  );

  const leftIconClasses = classNames({
    "spot-button__icon": true,
    "spot-button__icon--left": true,
    "spot-loading-spinner": spinIcon,
  });

  const rightIconClasses = classNames({
    "spot-button__icon": true,
    "spot-button__icon--right": true,
    "spot-loading-spinner": spinIcon,
  });

  return (
    <button className={btnClasses} {...props} ref={innerRef}>
      {leftIcon && (
        <>
          {typeof leftIcon === "string" ? (
            <SpotIcon
              name={leftIcon as SpotIconName}
              className={leftIconClasses}
              style={{ fill: `${iconColor}` }}
            />
          ) : (
            leftIcon
          )}
        </>
      )}
      {!iconOnly && <span className="spot-button__text">{props.children}</span>}
      {rightIcon && (
        <>
          {typeof rightIcon === "string" ? (
            <SpotIcon
              name={rightIcon as SpotIconName}
              className={rightIconClasses}
              style={{ fill: `${iconColor}` }}
            />
          ) : (
            rightIcon
          )}
        </>
      )}
    </button>
  );
};

export default Button;
