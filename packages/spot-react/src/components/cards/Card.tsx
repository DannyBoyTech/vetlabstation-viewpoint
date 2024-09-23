import React, { ElementType, useCallback, useEffect, useState } from "react";
import { forwardRefWithAs } from "../../polymorphic";
import classNames from "classnames";
import { SpotIcon } from "@viewpoint/spot-icons";

export const ALIGNMENT_OPTIONS = [
  "top-left",
  "top-center",
  "top-right",
  "center-left",
  "center-center",
  "center-right",
  "bottom-left",
  "bottom-center",
  "bottom-right",
] as const;

function getAlignmentClass(alignment?: (typeof ALIGNMENT_OPTIONS)[number]) {
  return alignment ? `align--${alignment}` : "";
}

export interface CardProps {
  variant?: "primary" | "secondary";
  isInteractive?: boolean;
  dismissible?: boolean;
  onDismiss?: () => void;
}

export const Card = forwardRefWithAs<"div", CardProps>(
  (
    {
      as,
      className,
      children,
      variant = "primary",
      dismissible = false,
      onDismiss,
      isInteractive = false,
      ...props
    },
    ref
  ) => {
    const [cardState, setCardState] = useState<
      "show" | "dismissing" | "dismissed"
    >("show");

    const dismissCard = useCallback(async () => {
      setCardState("dismissing");
    }, []);

    useEffect(() => {
      if (cardState === "dismissing") {
        setTimeout(() => {
          setCardState("dismissed");
          onDismiss?.();
        }, 750);
      }
    }, [cardState, onDismiss]);

    const Component: ElementType = as ?? "div";
    return cardState !== "dismissed" ? (
      <Component
        ref={ref}
        className={classNames(`spot-card--${variant}`, className, {
          "is-interactive": isInteractive,
          "animated fadeOut": cardState === "dismissing",
        })}
        {...props}
      >
        {children}

        {dismissible ? (
          <button onClick={dismissCard}>
            <span className="dismiss">
              <SpotIcon name="cancel" />
            </span>
          </button>
        ) : null}
      </Component>
    ) : null;
  }
);

export interface CardBodyProps {
  alignment?: (typeof ALIGNMENT_OPTIONS)[number];
}

export const CardBody = forwardRefWithAs<"div", CardBodyProps>(
  ({ as, className, alignment, ...props }, ref) => {
    const Component: ElementType = as ?? "div";
    return (
      <Component
        ref={ref}
        className={classNames("spot-card--body", className, {
          [getAlignmentClass(alignment)]: alignment,
        })}
        {...props}
      />
    );
  }
);

export interface CardImageProps {
  src: string;
  alt: string;
  hasFrame?: boolean;
  alignment?: (typeof ALIGNMENT_OPTIONS)[number];
}

export const CardImage = forwardRefWithAs<"figure", CardImageProps>(
  (
    {
      as,
      className,
      children,
      src,
      alt,
      hasFrame = false,
      alignment,
      ...props
    },
    ref
  ) => {
    const Component: ElementType = as ?? "figure";
    return (
      <Component
        ref={ref}
        className={classNames("spot-card--img", className, {
          "has-frame": hasFrame,
        })}
        {...props}
      >
        {children ? (
          <div
            className={classNames("spot-card--img_caption", {
              [getAlignmentClass(alignment)]: alignment,
            })}
          >
            {children}
          </div>
        ) : null}
        <img src={src} alt={alt} />
      </Component>
    );
  }
);

export interface CardHeaderProps {
  addContrast?: boolean;
  noBorder?: boolean;
  alignment?: (typeof ALIGNMENT_OPTIONS)[number];
}

export const CardHeader = forwardRefWithAs<"header", CardHeaderProps>(
  (
    {
      as,
      className,
      children,
      addContrast = false,
      noBorder = false,
      alignment,
      ...props
    },
    ref
  ) => {
    const Component: ElementType = as ?? "header";
    return (
      <Component
        ref={ref}
        className={classNames("spot-card--header", className, {
          "add-contrast": addContrast,
          "no-border": noBorder,
          [getAlignmentClass(alignment)]: alignment,
        })}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

export interface CardFooterProps {
  addContrast?: boolean;
  noBorder?: boolean;
  alignment?: (typeof ALIGNMENT_OPTIONS)[number];
}

export const CardFooter = forwardRefWithAs<"footer", CardFooterProps>(
  (
    {
      as,
      className,
      children,
      addContrast = false,
      noBorder = false,
      alignment,
      ...props
    },
    ref
  ) => {
    const Component: ElementType = as ?? "footer";
    return (
      <Component
        ref={ref}
        className={classNames("spot-card--footer", className, {
          "add-contrast": addContrast,
          "no-border": noBorder,
          [getAlignmentClass(alignment)]: alignment,
        })}
        {...props}
      >
        {children}
      </Component>
    );
  }
);
