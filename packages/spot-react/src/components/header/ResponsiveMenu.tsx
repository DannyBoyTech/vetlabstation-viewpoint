import React from "react";

import { SpotIcon } from "@viewpoint/spot-icons";

export interface ResponsiveMenuProps {
  onClick?: (e: React.MouseEvent) => void;
  onMouseEnter?: (e: React.MouseEvent) => void;
  onMouseLeave?: (e: React.MouseEvent) => void;
}

export const ResponsiveMenu = React.forwardRef<
  HTMLAnchorElement,
  ResponsiveMenuProps
>((props, ref) => {
  const { onClick, onMouseEnter, onMouseLeave } = props;

  const handleClick = (e: React.MouseEvent) => {
    console.log("Handle Click....", onClick);

    onClick?.(e);
    e.preventDefault();
  };
  return (
    <a
      ref={ref}
      href="#"
      onClick={handleClick}
      onMouseEnter={(e: React.MouseEvent) => onMouseEnter?.(e)}
      onMouseLeave={(e: React.MouseEvent) => onMouseLeave?.(e)}
      className="spot-header__responsive-menu"
    >
      <span>
        <SpotIcon name="menu" className="spot-icon" />
      </span>
    </a>
  );
});
