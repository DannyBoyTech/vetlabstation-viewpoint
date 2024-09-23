import {
  AlertAction,
  AlertDto,
  InstrumentStatusDto,
  InVueDxAlerts,
} from "@viewpoint/api";
import {
  GenericActionAlertContent,
  GenericActionAlertContentProps,
} from "./AlertComponents";
import { useNavigate } from "react-router-dom";

export function getInVueDxAlertContent(
  instrumentStatus: InstrumentStatusDto,
  alert: AlertDto,
  onClose: () => void
) {
  switch (alert.name) {
    /*
      The following faults are handled by the default handler in AlertDefinitions.getAlertContent
      INST_TEMP_LOW
      INST_TEMP_HIGH
      INVALID_CONSUMABLES
      EXPIRED_CONSUMABLES
      INCORRECT_TEST_TYPE
      SAMPLE_OVER_TEMP
      SAMPLE_UNDER_TEMP
      IMPROPER_SAMPLE_PREPARATION
      SAMPLE_CELLULARITY_HIGH
      MOTION_ERROR_CARTRIDGE
      MOTION_ERROR_MICROSCOPE
      UNKNOWN_ERROR
     */
    case InVueDxAlerts.BARCODE_READ_FAILURE:
      return (
        <BarcodeReadFailureContent
          instrumentStatus={instrumentStatus}
          alert={alert}
          actions={[AlertAction.CANCEL_RUN, AlertAction.ENTER_THEIA_BARCODE]}
          onClose={onClose}
        />
      );
  }
}

function BarcodeReadFailureContent(
  props: GenericActionAlertContentProps & { onClose: () => void }
) {
  const nav = useNavigate();

  return (
    <GenericActionAlertContent
      instrumentStatus={props.instrumentStatus}
      alert={props.alert}
      actions={[AlertAction.CANCEL_RUN, AlertAction.ENTER_THEIA_BARCODE]}
      getButtonProps={(action) =>
        action === AlertAction.CANCEL_RUN
          ? { buttonType: "secondary" }
          : undefined
      }
      afterPostAction={(action) => {
        if (action === AlertAction.ENTER_THEIA_BARCODE) {
          nav(`/instruments/${props.instrumentStatus.instrument.id}/lotEntry`);
          props.onClose();
        }
      }}
    />
  );
}
