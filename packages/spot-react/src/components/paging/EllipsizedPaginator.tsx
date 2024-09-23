import React, {
  ElementType,
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { PagingProps } from "./Paging";
import styled from "styled-components";
import { forwardRefWithAs } from "../../polymorphic";
import classNames from "classnames";
import { SpotIcon } from "@viewpoint/spot-icons";
import { useForkRef } from "@viewpoint/ui/src/utils/hooks/fork-ref";

const StyleRoot = styled.div`
  display: contents;

  > .spot-paging {
    width: 100%;
    justify-content: center;
  }
`;

export const EllipsizedPaginator = forwardRefWithAs<"nav", PagingProps>(
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
    // Maximum number of page buttons that can fit in the parent component.
    const [maxVisiblePages, setMaxVisiblePages] = useState<number>(count);
    // Offset to apply to the page buttons based on how many pages are visible and where in the list the selected item is
    const [offset, setOffset] = useState(0);

    const internalRef = useRef<HTMLElement | null>(null);
    const forkedRef = ref == null ? internalRef : useForkRef(internalRef, ref);

    const handleSelect = useCallback(
      (index: number) => {
        onPageChange?.(index);
      },
      [onPageChange]
    );

    // The maximum items that can be shown at a time
    const constrainedCount = Math.min(count, maxVisiblePages ?? count);
    // Maximum value for the offset -- should allow a buffer of the max items that can fit so that when it reaches the
    // ending portion of the pages, it will continue to show max items
    const maxIndexOffset = Math.max(0, count - constrainedCount);
    // Only need to show ellipsis if there are pages outside the max visible range
    const showEllipsis = offset < maxIndexOffset;
    // Minimum page that is show in the paginator
    const minVisiblePage = offset;
    // Maximum page that is shown in the paginator (not counting last page)
    // (-1 for last page, -1 for ellipse if present, and -1 for count to index conversion
    const maxVisiblePage = constrainedCount - (showEllipsis ? 3 : 2) + offset;

    useEffect(() => {
      const getConstrainedOffset = (offset: number) =>
        Math.min(Math.max(0, offset), maxIndexOffset);

      // If the selected index is outside the current visible range, adjust the offset.
      // Using an effect because currentPage is a prop and can be changed
      // by the parent of this component
      if (currentPage >= maxVisiblePage) {
        setOffset(getConstrainedOffset(currentPage - maxVisiblePages + 3));
      } else if (currentPage < minVisiblePage) {
        setOffset(getConstrainedOffset(currentPage));
      }
    }, [
      currentPage,
      maxIndexOffset,
      maxVisiblePages,
      maxVisiblePage,
      minVisiblePage,
    ]);

    useEffect(() => {
      if (internalRef.current != null) {
        const observer = new ResizeObserver(() => {
          if (internalRef.current != null) {
            // Calculate how many buttons can fit within the available width
            const pagingButton = internalRef.current.querySelector(
              ".spot-paging__button"
            );
            const availableWidth = internalRef.current.clientWidth;
            const buttonWidth =
              (pagingButton?.getBoundingClientRect()?.width ?? 45) + 8; // 8px for the gap between buttons
            const extraButtonCount = variant === "complex" ? 4 : 2;

            setMaxVisiblePages(
              Math.floor(availableWidth / buttonWidth) - extraButtonCount
            );
          }
        });

        observer.observe(internalRef.current);
        return () => {
          observer.disconnect();
        };
      }
    }, [internalRef, variant]);

    const Component: ElementType = as ?? "nav";
    return (
      <StyleRoot>
        <Component
          ref={forkedRef}
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
              ? Array.from({ length: count }).map((_, index) => {
                  const isSelected = currentPage === index;
                  // Show this page button if
                  const indexButtonVisible =
                    // It is in the min/max visible range
                    (index >= minVisiblePage && index <= maxVisiblePage) ||
                    // OR it is the last page
                    index === count - 1 ||
                    // OR it is the second to the last page and there is no ellipsis
                    (!showEllipsis && index === count - 2);

                  return (
                    <Fragment key={index}>
                      {indexButtonVisible && (
                        <>
                          <button
                            disabled={disabled}
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
                          {showEllipsis &&
                            // Place the ellipsis right after the last visible page
                            index === maxVisiblePage &&
                            // Don't show an ellipsis if there is only one page
                            // between this page and the last page
                            index < count - 1 && (
                              <button
                                className={classNames(
                                  "spot-paging__button",
                                  "spot-paging__button--more"
                                )}
                              />
                            )}
                        </>
                      )}
                    </Fragment>
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
      </StyleRoot>
    );
  }
);
