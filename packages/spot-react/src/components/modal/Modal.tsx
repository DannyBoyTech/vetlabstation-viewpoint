import React, {
  ButtonHTMLAttributes,
  forwardRef,
  HTMLAttributes,
  MouseEventHandler,
  PropsWithChildren,
  useCallback,
  useRef,
} from "react";
import classNames from "classnames";
import { SpotIcon } from "@viewpoint/spot-icons";

export interface ModalProps extends HTMLAttributes<HTMLDivElement> {
  dismissable?: boolean;
  visible: boolean;
  onClose: () => void;
}

const Modal = ({
  visible,
  onClose,
  dismissable = true,
  children,
  ...props
}: ModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);

  return (
    <ModalOverlay
      visible={visible}
      dismissable={dismissable}
      onClose={onClose}
      modalRef={modalRef}
    >
      <ModalPopup {...props} ref={modalRef}>
        {children}
      </ModalPopup>
    </ModalOverlay>
  );
};

const ModalPopup = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    const modalClasses = classNames(className, "spot-modal");

    return (
      <div {...props} className={modalClasses} ref={ref}>
        {children}
      </div>
    );
  }
);

interface ModalOverlayProps extends PropsWithChildren {
  visible: boolean;
  onClose: () => void;
  dismissable?: boolean;
  modalRef?: React.RefObject<HTMLDivElement>;
}

const ModalOverlay = ({
  visible,
  dismissable,
  onClose,
  modalRef,
  children,
}: ModalOverlayProps) => {
  const overlayClasses = classNames({
    "spot-modal__overlay": true,
    "spot-modal__overlay--visible": visible,
  });
  // Note - this component assumes that the overlay will fill the viewport
  // and be on top of any other components aside from the actual modal
  // content displayed.
  const onOverlayClick: MouseEventHandler<HTMLDivElement> = useCallback(
    (event) => {
      if (
        dismissable &&
        modalRef?.current != null &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    },
    [dismissable, modalRef, onClose]
  );

  return (
    <div className={overlayClasses} onMouseDown={onOverlayClick}>
      {children}
    </div>
  );
};

export interface HeaderProps extends HTMLAttributes<HTMLDivElement> {
  dismissable?: boolean;
  onClose: () => void;
}

export const TestId = {
  SpotModalCancelButton: "spot-modal-cancel-button",
};

const Header = ({
  dismissable = true,
  children,
  className,
  onClose,
  ...props
}: HeaderProps) => {
  return (
    <div className={classNames("spot-modal__header", className)} {...props}>
      <div className="spot-modal__titles">{children}</div>
      {dismissable ? (
        <button
          data-testid={TestId.SpotModalCancelButton}
          className="spot-modal__header-cancel-button"
          onClick={() => onClose()}
        >
          <SpotIcon
            name="cancel"
            className="spot-modal__header-cancel-button-icon"
          />
        </button>
      ) : null}
    </div>
  );
};

const Body = ({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={classNames("spot-modal__content", className)} {...props}>
      <div className="spot-modal__content-scroll-shadow-mask spot-modal__content-scroll-shadow-mask--top" />
      <div className="spot-modal__content-wrapper">
        <div className="spot-modal__copy">{children}</div>
      </div>
      <div className="spot-modal__content-scroll-shadow-mask spot-modal__content-scroll-shadow-mask--bottom" />
    </div>
  );
};

const Footer = ({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={classNames("spot-modal__footer", className)} {...props}>
      {children}
    </div>
  );
};

const FooterCancelButton = ({
  children,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) => {
  return (
    <button
      className={classNames("spot-modal__footer-cancel-button", className)}
      {...props}
    >
      {children}
    </button>
  );
};

Modal.Overlay = ModalOverlay;
Modal.Popup = ModalPopup;
Modal.Header = Header;
Modal.Body = Body;
Modal.Footer = Footer;
Modal.FooterCancelButton = FooterCancelButton;

export default Modal;
