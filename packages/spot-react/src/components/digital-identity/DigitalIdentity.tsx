import { SpotIcon } from "@viewpoint/spot-icons";
import classnames from "classnames";
import React from "react";

export interface DigitalIdentityProps {
  className?: string;
  name: string;
  location?: string;
  onClick?: (e: React.MouseEvent) => void;
  onMouseEnter?: (e: React.MouseEvent) => void;
  onMouseLeave?: (e: React.MouseEvent) => void;
}

export const DigitalIdentity = React.forwardRef<
  HTMLDivElement,
  DigitalIdentityProps
>((props, ref) => {
  const { name, location, onClick, onMouseEnter, onMouseLeave, className } =
    props;
  const classes = classnames(className, "spot-di");

  return (
    <div className={classes}>
      <div
        className="spot-di__header spot-di__header--lightteal"
        ref={ref}
        onClick={(e: React.MouseEvent) => onClick?.(e)}
        onMouseEnter={(e: React.MouseEvent) => onMouseEnter?.(e)}
        onMouseLeave={(e: React.MouseEvent) => onMouseLeave?.(e)}
      >
        <a className="spot-di__header-userinfo">
          <span className="spot-link--bold">{name}</span>
          {location && (
            <span className="spot-link--small spot-link--ellipsis">
              {location}
            </span>
          )}
        </a>
        <div className="spot-di__header-icon">
          <SpotIcon name="caret-down" />
        </div>
      </div>
    </div>
  );
});
