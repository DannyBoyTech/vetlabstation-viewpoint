import Button, {
  ButtonProps,
} from "@viewpoint/spot-react/src/components/button/Button";
import { useState } from "react";
import {
  useCancelGeneralCleanMutation,
  useCompleteGeneralCleanMutation,
  useRequestGeneralCleanMutation,
} from "../../../../api/CatOneApi";
import {
  CatOneCleaningWizard,
  CatOneCleaningWizardProps,
} from "./CatOneCleaningWizard";
import { useEventListener } from "../../../../context/EventSourceContext";
import {
  EventIds,
  InstrumentMaintenanceResultDto,
  MaintenanceProcedure,
  MaintenanceResult,
} from "@viewpoint/api";

export interface CatOneCleaningButtonProps
  extends ButtonProps,
    Omit<CatOneCleaningWizardProps, "onCancel" | "onDone"> {
  onCancel?: () => void;
  onDone?: () => void;
}

/**
 * A button component instantiates a Catalyst One cleaning
 * wizard when clicked.
 *
 * It handles communication with the instrument on click, cancel or done.
 */
export function CatOneCleaningButton(props: CatOneCleaningButtonProps) {
  const { instrumentStatus, onCancel, onDone, ...buttonProps } = props;

  const instrument = instrumentStatus.instrument;
  const instrumentId = instrument.id;

  const [wizardOpen, setWizardOpen] = useState(false);

  const [requestClean] = useRequestGeneralCleanMutation();
  const [cancelClean] = useCancelGeneralCleanMutation();
  const [completeClean] = useCompleteGeneralCleanMutation();

  useEventListener(EventIds.InstrumentMaintenanceResult, (msg) => {
    const result: InstrumentMaintenanceResultDto = JSON.parse(msg.data);
    if (
      result.maintenanceType === MaintenanceProcedure.GENERAL_CLEAN &&
      result.instrument.id === instrument.id &&
      result.result === MaintenanceResult.SUCCESS
    ) {
      setWizardOpen(false);
      onDone?.();
    }
  });

  const handleClean = (ev: React.MouseEvent<HTMLButtonElement>) => {
    requestClean(instrumentId);
    setWizardOpen(true);
    buttonProps.onClick?.(ev);
  };

  const handleCancel = () => {
    cancelClean(instrumentId);
    setWizardOpen(false);
    onCancel?.();
  };

  const handleDone = () => {
    completeClean(instrumentId);
    setWizardOpen(false);
    onDone?.();
  };

  return (
    <>
      <Button {...buttonProps} onClick={handleClean} />
      {wizardOpen && (
        <CatOneCleaningWizard
          instrumentStatus={props.instrumentStatus}
          onCancel={handleCancel}
          onDone={handleDone}
        />
      )}
    </>
  );
}
