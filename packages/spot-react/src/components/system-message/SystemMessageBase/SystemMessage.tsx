import classNames from "classnames";
import React, { ElementType } from "react";
import { SpotIcon } from "@viewpoint/spot-icons";
import { forwardRefWithAs } from "../../../polymorphic";
import { SpotIconName } from "@viewpoint/spot-icons/src/components/spot-icon/SpotIcon";
import styled from "styled-components";

export interface SystemMessageProps {
  header?: string;
  size?: "default" | "large";
  icon?: SpotIconName;
  onDismiss?: () => void;
  alertLevel?: "success" | "danger" | "warning" | "default";
  progressRef?: React.RefObject<HTMLDivElement>;
}

const StyledButton = styled.button`
  background: transparent;
  border: none;
`;

export const SystemMessage = forwardRefWithAs<"div", SystemMessageProps>(
  (
    {
      as,
      size,
      children,
      onDismiss,
      alertLevel = "default",
      header,
      icon,
      className,
      progressRef,
      ...props
    },
    ref
  ) => {
    const Component: ElementType = as ?? "div";

    return (
      <Component
        ref={ref}
        className={classNames("spot-message", className, {
          dismissible: onDismiss,
          large: size === "large",
          [`spot-message--${alertLevel}`]: alertLevel !== "default",
          "spot-message--with-icon-tab": icon != null,
        })}
        {...props}
      >
        <div className={classNames("message--content")}>
          {header ? <div className="message--header">{header}</div> : null}
          {children}
        </div>
        {icon != null ? (
          <div className="icon-tab">
            <SpotIcon className="spot-icon" name={icon} />
          </div>
        ) : null}
        {progressRef ? (
          <div ref={progressRef} className="progress" style={{ width: 0 }} />
        ) : null}
        {onDismiss ? (
          <StyledButton onClick={() => onDismiss()} className="dismiss">
            <SpotIcon className="spot-icon" name="cancel" />
          </StyledButton>
        ) : null}
      </Component>
    );
  }
);

SystemMessage.displayName = "SystemMessage";
