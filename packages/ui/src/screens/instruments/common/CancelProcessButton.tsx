import { Button } from "@viewpoint/spot-react";
import { useTranslation } from "react-i18next";
import { ConfirmModal } from "../../../components/confirm-modal/ConfirmModal";
import { useState } from "react";
import { useStopWaitingMutation } from "../../../api/InstrumentApi";
import { InstrumentStatusDto } from "@viewpoint/api";
import { useInstrumentNameForId } from "../../../utils/hooks/hooks";
import { ButtonProps } from "@viewpoint/spot-react/src/components/button/Button";

export const TestId = {
  ConfirmModal: (testId?: string) =>
    testId != null
      ? `${testId}__confirm-modal`
      : "cancel-process-button__confirm-modal",
} as const;

interface CancelProcessButtonProps extends Omit<ButtonProps, "onClick"> {
  instrumentStatus?: InstrumentStatusDto;
}

export function CancelProcessButton(props: CancelProcessButtonProps) {
  const { t } = useTranslation();
  const [confirming, setConfirming] = useState(false);
  const [stopWaiting] = useStopWaitingMutation();
  const instrumentNameForId = useInstrumentNameForId();

  const handleClick = () => {
    setConfirming(true);
  };

  const handleClose = () => {
    setConfirming(false);
  };

  const { instrumentStatus, ...buttonProps } = props;

  const instrumentId = instrumentStatus?.instrument.id;
  const handleConfirm = () => {
    setConfirming(false);
    instrumentId != null && stopWaiting({ instrumentId });
  };

  const instrumentConnected = instrumentStatus?.connected;
  const buttonEnabled =
    !props.disabled && instrumentId != null && instrumentConnected;

  return (
    <>
      <Button
        {...buttonProps}
        disabled={!buttonEnabled}
        onClick={handleClick}
        data-testid={props["data-testid"]}
      >
        {t("general.buttons.cancelProcess")}
      </Button>
      {confirming && (
        <ConfirmModal
          data-testid={TestId.ConfirmModal(props["data-testid"])}
          open={true}
          onClose={handleClose}
          onConfirm={handleConfirm}
          secondaryHeaderContent={
            instrumentId != null && instrumentNameForId(instrumentId)
          }
          headerContent={t("instruments.cancelProcessModal.title")}
          bodyContent={t("instruments.cancelProcessModal.body")}
          confirmButtonContent={t("general.buttons.cancelProcess")}
        />
      )}
    </>
  );
}
