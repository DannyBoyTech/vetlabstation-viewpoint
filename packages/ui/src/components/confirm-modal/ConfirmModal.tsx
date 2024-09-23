import { Button, Modal, SpotText } from "@viewpoint/spot-react";
import classNames from "classnames";
import { Fragment, ReactNode } from "react";
import { ResponsiveModalWrapper } from "../modal/ResponsiveModalWrapper";
import styled from "styled-components";

interface ConfirmModalProps {
  className?: string;

  open: boolean;
  onClose: () => void;
  onConfirm: () => void;

  dismissable?: boolean;
  confirmable?: boolean;

  bodyContent: ReactNode;
  cancelButtonContent?: ReactNode;
  confirmButtonContent: ReactNode;
  headerContent?: ReactNode;
  secondaryHeaderContent?: ReactNode;

  "data-testid"?: string;

  responsive?: boolean;
}

const CancelPlaceholder = styled.div`
  margin-right: auto;
`;

const ConfirmModal = (props: ConfirmModalProps) => {
  const classes = classNames("confirm-modal", props.className);

  const Wrapper = props.responsive ? ResponsiveModalWrapper : Fragment;

  return (
    <Wrapper>
      <Modal
        className={classes}
        onClose={props.onClose}
        visible={props.open}
        dismissable={props.dismissable}
        data-testid={props["data-testid"] ?? "confirm-modal"}
      >
        {(props.headerContent != null ||
          props.secondaryHeaderContent != null) && (
          <Modal.Header onClose={props.onClose} dismissable={props.dismissable}>
            {props.secondaryHeaderContent != null && (
              <SpotText level="h4" className="spot-modal__secondary-title">
                {props.secondaryHeaderContent}
              </SpotText>
            )}
            <SpotText level="h3" className="spot-modal__title">
              {props.headerContent}
            </SpotText>
          </Modal.Header>
        )}

        <Modal.Body>{props.bodyContent}</Modal.Body>
        <Modal.Footer>
          {props.cancelButtonContent ? (
            <Modal.FooterCancelButton
              data-testid="later-button"
              onClick={props.onClose}
            >
              {props.cancelButtonContent}
            </Modal.FooterCancelButton>
          ) : (
            <CancelPlaceholder />
          )}
          {typeof props.confirmButtonContent === "string" ? (
            <Button
              data-testid="done-button"
              disabled={!(props.confirmable ?? true)}
              onClick={props.onConfirm}
            >
              {props.confirmButtonContent}
            </Button>
          ) : (
            props.confirmButtonContent
          )}
        </Modal.Footer>
      </Modal>
    </Wrapper>
  );
};

export type { ConfirmModalProps };

export { ConfirmModal };
