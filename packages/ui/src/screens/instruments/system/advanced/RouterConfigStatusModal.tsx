import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ConfirmModal } from "../../../../components/confirm-modal/ConfirmModal";
import { EventIds, RouterConfigResultEvent } from "@viewpoint/api";
import { useEventListener } from "../../../../context/EventSourceContext";

function bodyContentKey(result: ConfigResult) {
  if (result === ConfigResults.SUCCESS) {
    return "instrumentScreens.system.advanced.configStatusModal.successMessage";
  } else {
    return "instrumentScreens.system.advanced.configStatusModal.failureMessage";
  }
}

const TIMEOUT_MILLIS = 660_000; //11 minutes

const ConfigResults = {
  SUCCESS: true,
  FAILURE: false,
} as const;

type ConfigResult = (typeof ConfigResults)[keyof typeof ConfigResults];

interface RouterConfigStatusModalProps {
  confirmable?: boolean;
  onClose: () => void;
  onConfirm: (success: boolean) => void;
}

function RouterConfigStatusModal(props: RouterConfigStatusModalProps) {
  const { t } = useTranslation();

  const [bodyContent, setBodyContent] = useState<ReactNode>(
    t("instrumentScreens.system.advanced.configStatusModal.pleaseWait")
  );
  const [confirmable, setConfirmable] = useState<boolean>(false);
  const [result, setResult] = useState<ConfigResult>(ConfigResults.FAILURE);

  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const cancelTimeout = useCallback(() => {
    if (timeoutRef.current != null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
  }, []);

  const handleResult = useCallback(
    (result: ConfigResult) => {
      setConfirmable(true);
      setBodyContent(t(bodyContentKey(result)));
      setResult(result);
    },
    [t]
  );

  const handleResultEvent = useCallback(
    (ev: MessageEvent) => {
      const event: RouterConfigResultEvent = JSON.parse(ev.data);
      cancelTimeout();
      handleResult(event.isSuccessful);
    },
    [cancelTimeout, handleResult]
  );

  useEventListener(EventIds.RouterConfigResult, handleResultEvent);

  const handleResultTimeout = useCallback(() => {
    cancelTimeout();
    handleResult(ConfigResults.FAILURE);
  }, [cancelTimeout, handleResult]);

  function handleConfirm() {
    props.onConfirm(result);
  }

  useEffect(() => {
    if (timeoutRef.current == null) {
      timeoutRef.current = setTimeout(handleResultTimeout, TIMEOUT_MILLIS);
    }
  }, [handleResultTimeout]);

  return (
    <ConfirmModal
      {...props}
      open={true}
      confirmable={confirmable}
      dismissable={false}
      headerContent={t(
        "instrumentScreens.system.advanced.configStatusModal.title"
      )}
      bodyContent={bodyContent}
      confirmButtonContent={t("general.buttons.ok")}
      onConfirm={handleConfirm}
    />
  );
}

export type { RouterConfigStatusModalProps };
export { RouterConfigStatusModal };
