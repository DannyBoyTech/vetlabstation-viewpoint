import { SpotIcon } from "@viewpoint/spot-icons";
import classNames from "classnames";
import React, { ElementType, useCallback, useState } from "react";

import { forwardRefWithAs } from "../../polymorphic";

export interface PagingProps {
  variant?: "default" | "complex";
  size?: "small" | "default" | "large";
  count: number;
  defaultPage?: number;
  disabled?: boolean;
  onPageChange?: (index: number) => void;
  currentPage: number;
}

export const Paging = forwardRefWithAs<"nav", PagingProps>(
  (
    {
      as,
      size = "default",
      defaultPage = 0,
      count = 0,
      disabled = false,
      children,
      variant = "default",
      onPageChange,
      currentPage,
      ...props
    },
    ref
  ) => {
    const handleSelect = useCallback(
      (index: number) => {
        onPageChange?.(index);
      },
      [onPageChange]
    );

    const Component: ElementType = as ?? "nav";
    return (
      <Component
        ref={ref}
        className={classNames("spot-paging", {
          [`spot-paging--${size}`]: size !== "default",
          "spot-paging--disabled": disabled,
        })}
        role="navigation"
        aria-label="Pagination Navigation"
        {...props}
      >
        {variant === "complex" ? (
          <button
            disabled={disabled || currentPage === 0}
            onClick={() => handleSelect(0)}
            aria-label={`First page of ${count}`}
            className={classNames(
              "spot-paging__button spot-paging__button--first",
              {
                "spot-paging__button--disabled": currentPage === 0,
              }
            )}
            title="First"
          >
            <SpotIcon name="double-left" />
          </button>
        ) : null}
        <div className="spot-paging__group">
          <button
            disabled={disabled || currentPage === 0}
            onClick={() => handleSelect(Math.max(0, currentPage - 1))}
            aria-label={`Previous page of ${count}`}
            className={classNames(
              "spot-paging__button spot-paging__button--previous",
              {
                "spot-paging__button--disabled": currentPage === 0,
              }
            )}
            title="Previous"
          >
            <SpotIcon name="previous" />
          </button>
          {count > 0
            ? Array.from(Array(count).keys()).map((index) => {
                const isSelected = currentPage === index;
                return (
                  <button
                    disabled={disabled}
                    key={index}
                    aria-current={isSelected ? "page" : undefined}
                    aria-label={`Page ${index + 1} of ${count}${
                      isSelected ? " (current page)" : ""
                    }`}
                    onClick={() => handleSelect(index)}
                    className={classNames("spot-paging__button", {
                      "spot-paging__button--selected": isSelected,
                    })}
                  >
                    {index + 1}
                  </button>
                );
              })
            : null}

          <button
            disabled={disabled || currentPage === count - 1}
            onClick={() => handleSelect((currentPage + 1) % count)}
            className={classNames(
              "spot-paging__button spot-paging__button--next",
              {
                "spot-paging__button--disabled": currentPage === count - 1,
              }
            )}
            title="Next"
          >
            <SpotIcon name="next" />
          </button>
        </div>
        {variant === "complex" ? (
          <button
            disabled={disabled || currentPage === count - 1}
            onClick={() => handleSelect(count - 1)}
            aria-label={`Last page of ${count}`}
            className={classNames(
              "spot-paging__button spot-paging__button--last",
              {
                "spot-paging__button--disabled": currentPage === count - 1,
              }
            )}
            title="Last"
          >
            <SpotIcon name="double-right" />
          </button>
        ) : null}
        {children}
      </Component>
    );
  }
);
