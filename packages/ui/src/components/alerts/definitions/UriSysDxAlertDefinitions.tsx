import { useNavigate } from "react-router-dom";
import {
  AlertAction,
  AlertDto,
  InstrumentStatusDto,
  UriSysDxAlerts,
} from "@viewpoint/api";
import {
  GenericActionAlertContent,
  GenericActionAlertContentProps,
} from "./AlertComponents";

export function getUriSysDxAlertContent(
  instrumentStatus: InstrumentStatusDto,
  alert: AlertDto,
  onClose: () => void
) {
  switch (alert.name) {
    // ('sys' faults)
    case UriSysDxAlerts.E7_MISSING_TRAY_ERROR:
    case UriSysDxAlerts.E8_TRAY_POSITION_ERROR:
    case UriSysDxAlerts.E9_WRONG_TRAY_ERROR:
    case UriSysDxAlerts.E10_LIGHT_BARRIER_ERROR:
    case UriSysDxAlerts.E11_MOTOR_STEP_ERROR:
    case UriSysDxAlerts.E12_OPTICS_ERROR:
      return (
        <GenericActionAlertContent
          alert={alert}
          instrumentStatus={instrumentStatus}
          actions={[AlertAction.INITIALIZE]}
        />
      );

    case UriSysDxAlerts.E25_SYSTEM_EPROM_ERROR:
    case UriSysDxAlerts.E29_DATABASE_ERROR:
    case UriSysDxAlerts.E30_SYSTEM_INITIALIZATION_ERROR:
    case UriSysDxAlerts.E33_SYSTEM_ERROR:
    case UriSysDxAlerts.E100_POWERSUPPLY_ERROR:
      return (
        <GenericActionAlertContent
          alert={alert}
          instrumentStatus={instrumentStatus}
          actions={[AlertAction.POWER_DOWN]}
          afterPostAction={onClose}
        />
      );

    // Ack Faults
    case UriSysDxAlerts.E1_REFERENCE_PAD_ERROR_MIDDLE_ERROR:
    case UriSysDxAlerts.E2_WRONG_STRIP_ERROR:
    case UriSysDxAlerts.E3_STRIP_MEASUREMENT_ERROR:
    case UriSysDxAlerts.E4_CALIBRATION_ERROR:
    case UriSysDxAlerts.E5_CALIBRATION_INVALID_ERROR:
    case UriSysDxAlerts.E15_REFERENCE_PAD_BOTTOM_ERROR:
    case UriSysDxAlerts.E16_REFERENCE_PAD_TOP_ERROR:
    case UriSysDxAlerts.E24_COMP_PAD_REMISSIONS_OUT_OF_RANGE_ERROR:
    case UriSysDxAlerts.UPDATE_FAILED_CATASTROPHIC:
      return (
        <GenericActionAlertContent
          alert={alert}
          instrumentStatus={instrumentStatus}
          actions={[AlertAction.OK_REMOVE]}
        />
      );

    case UriSysDxAlerts.E27_USER_CALIBRATION_IS_REQUIRED_ERROR:
      return (
        <CalibrateAlertContent
          alert={alert}
          instrumentStatus={instrumentStatus}
          onClose={onClose}
        />
      );

    // Reminder Faults
    case UriSysDxAlerts.UPDATE_AVAILABLE:
    case UriSysDxAlerts.UPDATE_FAILED:
      return (
        <UpdateAvailableAlertContent
          alert={alert}
          instrumentStatus={instrumentStatus}
          onClose={onClose}
        />
      );
  }
}

interface UriSysDxAlertDefinitionProps
  extends Pick<GenericActionAlertContentProps, "alert" | "instrumentStatus"> {
  onClose: () => void;
}

function UpdateAvailableAlertContent(props: UriSysDxAlertDefinitionProps) {
  return (
    <GenericActionAlertContent
      alert={props.alert}
      instrumentStatus={props.instrumentStatus}
      actions={[AlertAction.UPGRADE_LATER, AlertAction.UPGRADE_SOFTWARE]}
      afterPostAction={(alert) => {
        if (alert === AlertAction.UPGRADE_SOFTWARE) {
          props.onClose();
        }
      }}
      getButtonProps={(action) =>
        action === AlertAction.UPGRADE_LATER
          ? { buttonType: "secondary" }
          : undefined
      }
    />
  );
}

function CalibrateAlertContent(props: UriSysDxAlertDefinitionProps) {
  const nav = useNavigate();

  return (
    <GenericActionAlertContent
      alert={props.alert}
      instrumentStatus={props.instrumentStatus}
      actions={[AlertAction.OK_REMOVE, AlertAction.CALIBRATE]}
      afterPostAction={(action) => {
        if (action === AlertAction.CALIBRATE) {
          nav(`/instruments/${props.instrumentStatus.instrument.id}/qc`);
          props.onClose();
        }
      }}
      getButtonProps={(action) =>
        action === AlertAction.CALIBRATE
          ? { skipPostAction: true }
          : { buttonType: "secondary" }
      }
    />
  );
}
