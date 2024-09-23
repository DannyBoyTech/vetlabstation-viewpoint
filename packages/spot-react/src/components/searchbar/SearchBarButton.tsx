import { SpotIcon } from "@viewpoint/spot-icons";
import classnames from "classnames";
import React, { ButtonHTMLAttributes, forwardRef } from "react";

interface SearchButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
}

export const SearchBarButton = forwardRef<HTMLButtonElement, SearchButtonProps>(
  ({ className, ...props }, ref) => {
    const classes = classnames(className, "spot-search-bar__search-button");

    return (
      <button className={classes} {...props} ref={ref}>
        <SpotIcon className="spot-icon" name="search" />
      </button>
    );
  }
);
