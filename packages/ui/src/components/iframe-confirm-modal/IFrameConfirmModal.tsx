import { Spinner } from "@viewpoint/spot-react";
import { forwardRef, ReactNode, useCallback, useEffect, useState } from "react";
import styled from "styled-components";
import { ConfirmModal } from "../confirm-modal/ConfirmModal";
import { fetch } from "../../utils/fetch-utils";
import { urlFragment } from "../../utils/url-utils";

const StyledConfirmModal = styled(ConfirmModal)`
  width: 90vw;
  max-width: 90vw;

  height: 90vh;
  max-height: 90vh;

  .spot-modal__header {
    flex: 0 0;
  }

  .spot-modal__title {
    padding: 5px 0;
  }

  .spot-modal__footer {
    flex: 0 0;
  }

  .spot-modal__content {
    flex: 1 1;

    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .spot-modal__content-wrapper {
    display: flex;
    flex-direction: column;
    flex: 1 1;
  }

  .spot-modal__copy {
    display: flex;
    flex: 1 1;
    gap: 20px;
  }

  .spot-modal__copy > * {
    flex: 1 1;
  }

  .spot-loading-spinner {
    position: absolute;
    top: calc(50% - 10px);
    left: calc(50% - 10px);
    transform: scale(10);
  }

  iframe {
    border: none;
  }
`;

interface IFrameConfirmModalProps {
  className?: string;
  "data-testid"?: string;

  open: boolean;
  error?: boolean;
  dismissable?: boolean;

  url?: string;
  srcDoc?: string;

  timeoutMillis?: number;

  headerContent: ReactNode;

  preContent?: ReactNode;
  postContent?: ReactNode;

  cancelButtonContent?: ReactNode;
  confirmButtonContent: ReactNode;

  errorContent?: ReactNode;

  onClose?: (objectUrl?: string) => void;
  onConfirm?: (objectUrl?: string) => void;
}

/**
 * A `ConfirmModal` that displays an iframe containing the url passed as a prop.
 * It detects and displays error content in the case where the content can't be loaded.
 */
const IFrameConfirmModal = forwardRef<
  HTMLIFrameElement,
  IFrameConfirmModalProps
>((props, ref) => {
  const [loaded, setLoaded] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<boolean>(false);
  const [objectUrl, setObjectUrl] = useState<string>();

  const { onClose, onConfirm } = props;

  const handleClose = useCallback(() => {
    onClose?.(objectUrl);
  }, [onClose, objectUrl]);

  const handleConfirm = useCallback(() => {
    onConfirm?.(objectUrl);
  }, [onConfirm, objectUrl]);

  const error = props.error || loadError;

  //we load the content at the URL outside the iframe so that we can observe loading success/failure
  useEffect(() => {
    setLoaded(false);
    setLoadError(false);
    setObjectUrl(undefined);

    let oUrl: string | undefined;

    (async () => {
      try {
        if (props.srcDoc) {
          setLoaded(true);
          setLoadError(false);
          setObjectUrl(undefined);
        } else if (props.url) {
          const res = await fetch(props.url, {
            timeoutMillis: props.timeoutMillis,
          });
          const data = await res.blob();
          oUrl = URL.createObjectURL(data);

          //we reapply any url hash (fragment) to allow for pdf viewer directives, etc.
          const frag = urlFragment(props.url);
          setObjectUrl(`${oUrl}${frag ? `#${frag}` : ""}`);

          setLoaded(true);
          setLoadError(false);
        } else {
          setObjectUrl(undefined);
          setLoaded(false);
          setLoadError(false);
        }
      } catch (e) {
        setLoadError(true);
        setObjectUrl(undefined);
      }
    })();

    return () => {
      if (oUrl) {
        setObjectUrl(undefined);
        URL.revokeObjectURL(oUrl); //we must release the URL -> Blob mapping or it will leak memory
      }
    };
  }, [props.url, props.timeoutMillis, props.srcDoc]);

  return (
    <StyledConfirmModal
      {...props}
      onClose={handleClose}
      onConfirm={handleConfirm}
      bodyContent={
        <>
          {props.preContent ? props.preContent : null}

          {/* key is set to prevent iframe url changes from being recorded in
          history (the iframe is replaced when url changes instead)*/}
          <iframe
            key={objectUrl ?? props.srcDoc}
            ref={ref}
            src={objectUrl}
            srcDoc={props.srcDoc}
            hidden={error || !loaded}
          />

          {(() => {
            if (error) {
              return props.errorContent;
            } else if (!loaded) {
              return <Spinner size="large" />;
            }
          })()}
          {props.postContent ? props.postContent : null}
        </>
      }
      confirmable={!error && loaded}
    />
  );
});

export type { IFrameConfirmModalProps };
export { IFrameConfirmModal };
