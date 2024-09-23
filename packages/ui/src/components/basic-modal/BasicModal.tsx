import { ReactNode } from "react";
import { Modal } from "@viewpoint/spot-react";
import classNames from "classnames";

interface BasicModalProps {
  className?: string;

  open: boolean;
  onClose: () => void;

  // If true, will allow user to dismiss the modal by either tapping outside of
  // the modal (on the backdrop) or via the X close button in the header
  dismissable?: boolean;
  // Alongside dismissable === true, will ignore dismissal via backdrop clicks.
  // Used to allow user to continue dismissing through the header, but not allow
  // dismissal when clicking outside of the modal
  ignoreBackdropDismissal?: boolean;
  // Hide the X close button in the header. Used to allow user to close by tapping
  // outside of the modal, but not providing an X button to close.
  hideHeaderCloseButton?: boolean;

  bodyContent: ReactNode;
  headerContent?: ReactNode;
  footerContent: ReactNode;

  "data-testid"?: string;
}

const BasicModal = (props: BasicModalProps) => {
  const classes = classNames("basic-modal", props.className);
  return (
    <Modal
      data-testid={props["data-testid"] ?? "modal"}
      className={classes}
      visible={props.open}
      dismissable={props.dismissable && !props.ignoreBackdropDismissal}
      onClose={props.onClose}
    >
      {props.headerContent != null && (
        <Modal.Header
          onClose={props.onClose}
          dismissable={props.dismissable && !props.hideHeaderCloseButton}
        >
          {props.headerContent}
        </Modal.Header>
      )}
      <Modal.Body>{props.bodyContent}</Modal.Body>
      <Modal.Footer>{props.footerContent}</Modal.Footer>
    </Modal>
  );
};

export type { BasicModalProps };

export { BasicModal };
