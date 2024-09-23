import {
  AlertAction,
  AlertDto,
  InstrumentStatusDto,
  SediVueAlerts,
} from "@viewpoint/api";
import {
  GenericActionAlertContent,
  GenericActionAlertContentProps,
} from "./AlertComponents";
import { Trans } from "react-i18next";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { useGlobalModals } from "../../global-modals/GlobalModals";
import { SediVueDxCleaningWizard } from "../../../screens/instruments/sedivue/cleaning/SediVueDxCleaningWizard";
import { useMemo } from "react";

export function getSediVueDxAlertContent(
  instrumentStatus: InstrumentStatusDto,
  alert: AlertDto,
  onClose: () => void
) {
  switch (alert.name) {
    /*
      The following faults are handled by the default handler in AlertDefinitions.getAlertContent 
      CAMERA_ERROR
      CENTRIFUGE_ARM_MISSING
      CENTRIFUGE_ROTATION_ERROR
      DOOR_OPEN
      FOCUS_DLL_NOT_FOUND
      FOCUS_FUNCTION_MISFOCUS_FUNCTION_MISSINGSING
      FOCUS_HOME_POSITION_ERROR
      GENERAL_COMMUNICATION_ERROR
      HOUSE_OPEN
      INSTRUMENT_PORT_OPEN_ERROR
      MEMORY_ALLOCATION_ERROR
      MICROSCOPE_CTS_TIMEOUT
      MICROSCOPE_THREAD_CREATION_ERROR
      PLATE_MISSING
      PORT_THREAD_NOT_STARTED
      PROTOCOL_CLASS_CREATION_ERROR
      PROTOCOL_USAGE_UNDEFINED
      SERIAL_PORT_NOT_FOUND
      SERIAL_PORT_UNAVAILABLE
      TOO_MANY_SERIAL_PORTS_DEFINED
      UPDATE_FAILED_CATASTROPHIC
    */

    case SediVueAlerts.UPDATE_AVAILABLE:
      return (
        <UpdateAvailableAlertContent
          alert={alert}
          instrumentStatus={instrumentStatus}
          onClose={onClose}
        />
      );
    case SediVueAlerts.UPDATE_FAILED:
      return (
        <UpdateFailedAlertContent
          alert={alert}
          instrumentStatus={instrumentStatus}
          onClose={onClose}
        />
      );
    case SediVueAlerts.CUVETTE_COUNT_LOW:
      return (
        <GenericActionAlertContent
          alert={alert}
          instrumentStatus={instrumentStatus}
          actions={[
            AlertAction.REMIND_ME_NEXT_RUN,
            AlertAction.REMIND_ME_WHEN_EMPTY,
          ]}
        />
      );
    case SediVueAlerts.CUVETTE_SENSOR_EMPTY:
    case SediVueAlerts.CUVETTE_COUNT_ZERO:
      return (
        <CuvetteCountZeroAndSensorEmptyAlertContent
          alert={alert}
          instrumentStatus={instrumentStatus}
          onClose={onClose}
        />
      );
    case SediVueAlerts.WAKE_ON_LAN_FAILURE_TIMEOUT:
      return (
        <GenericActionAlertContent
          alert={alert}
          instrumentStatus={instrumentStatus}
          actions={[AlertAction.CLOSE]}
        />
      );
    case SediVueAlerts.FEEDER_MOVEMENT:
    case SediVueAlerts.ARM_MOVEMENT:
    case SediVueAlerts.MOTY_MOVEMENT:
      return (
        <CleanActionAlertContent
          alert={alert}
          instrumentStatus={instrumentStatus}
          onClose={() => onClose()}
        />
      );
    case SediVueAlerts.SYSTEM_REBOOT_RECOMMENDED:
      return (
        <GenericActionAlertContent
          alert={alert}
          instrumentStatus={instrumentStatus}
          actions={[AlertAction.REBOOT_INSTRUMENT, AlertAction.REMIND_ME_LATER]}
          getButtonProps={(action) =>
            action === AlertAction.REMIND_ME_LATER
              ? { buttonType: "secondary" }
              : undefined
          }
        />
      );
    case SediVueAlerts.SMART_SERVICE_DISCONNECTED:
      return (
        <SmartServiceOfflineAlertContent
          onClose={onClose}
          alert={alert}
          instrumentStatus={instrumentStatus}
        />
      );
    case SediVueAlerts.CLEANING_RECOMMENDED:
      return (
        <CleaningReminderAlertContent
          onClose={onClose}
          alert={alert}
          instrumentStatus={instrumentStatus}
        />
      );
  }
}

interface SediVueDxAlertDefinitionProps
  extends Pick<GenericActionAlertContentProps, "alert" | "instrumentStatus"> {
  onClose: () => void;
}

function UpdateAvailableAlertContent(props: SediVueDxAlertDefinitionProps) {
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
      // SediVue will optionally force an update after a given date, provided by the instrument as an arg
      additionalContent={
        // Intentionally using || to catch empty string case
        (props.alert.args?.["dateFormat"] || undefined) == null ? undefined : (
          <Trans
            ns="alerts"
            i18nKey="URISED.UPDATE_AVAILABLE.noUpgradeWarning"
            values={props.alert.args}
          />
        )
      }
      getButtonProps={(action) =>
        action === AlertAction.UPGRADE_LATER
          ? { buttonType: "secondary" }
          : undefined
      }
    />
  );
}

function UpdateFailedAlertContent(props: SediVueDxAlertDefinitionProps) {
  // If the force upgrade date has not yet passed, give the user
  // the option to Upgrade Later
  const actions: AlertAction[] = [];
  const dateArg = (props.alert.args?.["date"] as Record<string, unknown>)?.[
    "date"
  ];
  if (
    dateArg === null ||
    (dateArg !== null && dayjs(dateArg as number).isAfter(dayjs()))
  ) {
    actions.push(AlertAction.UPGRADE_LATER);
  }
  actions.push(AlertAction.UPGRADE_SOFTWARE);
  return (
    <GenericActionAlertContent
      alert={props.alert}
      instrumentStatus={props.instrumentStatus}
      actions={actions}
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

function CuvetteCountZeroAndSensorEmptyAlertContent(
  props: SediVueDxAlertDefinitionProps
) {
  const nav = useNavigate();
  return (
    <GenericActionAlertContent
      alert={props.alert}
      instrumentStatus={props.instrumentStatus}
      actions={[AlertAction.REPLACE_CUVETTES]}
      afterPostAction={(action) => {
        if (action === AlertAction.REPLACE_CUVETTES) {
          nav(
            `/instruments/${props.instrumentStatus.instrument.id}/maintenance/replace/cartridge`
          );
          props.onClose();
        }
      }}
      getButtonProps={(action) => {
        // No request needs to be made to the server for this action
        if (action === AlertAction.REPLACE_CUVETTES) {
          return { skipPostAction: true };
        }
      }}
    />
  );
}

function CleanActionAlertContent(props: SediVueDxAlertDefinitionProps) {
  const { addModal, removeModal } = useGlobalModals();

  const id = useMemo(() => crypto.randomUUID(), []);

  return (
    <GenericActionAlertContent
      alert={props.alert}
      instrumentStatus={props.instrumentStatus}
      actions={[AlertAction.INITIALIZE]}
      afterPostAction={(action) => {
        if (action === AlertAction.INITIALIZE) {
          addModal({
            id,
            content: (
              <SediVueDxCleaningWizard
                instrumentId={props.instrumentStatus.instrument.id}
                onDone={() => removeModal(id)}
                onCancel={() => removeModal(id)}
              />
            ),
          });
          props.onClose();
        }
      }}
    />
  );
}

function SmartServiceOfflineAlertContent(props: SediVueDxAlertDefinitionProps) {
  const nav = useNavigate();
  return (
    <GenericActionAlertContent
      alert={props.alert}
      instrumentStatus={props.instrumentStatus}
      actions={[AlertAction.REMIND_ME_LATER, AlertAction.CONNECT]}
      afterPostAction={(action) => {
        if (action === AlertAction.CONNECT) {
          nav("/settings/smart_service");
          props.onClose();
        }
      }}
      getButtonProps={(action) =>
        action === AlertAction.REMIND_ME_LATER
          ? { buttonType: "secondary" }
          : undefined
      }
    />
  );
}

function CleaningReminderAlertContent(props: SediVueDxAlertDefinitionProps) {
  const { addModal, removeModal } = useGlobalModals();

  const id = useMemo(() => crypto.randomUUID(), []);

  return (
    <GenericActionAlertContent
      alert={props.alert}
      instrumentStatus={props.instrumentStatus}
      actions={[
        AlertAction.DISMISS,
        AlertAction.REMIND_ME_LATER,
        AlertAction.CLEAN,
      ]}
      afterPostAction={(action) => {
        if (action === AlertAction.CLEAN) {
          addModal({
            id,
            content: (
              <SediVueDxCleaningWizard
                instrumentId={props.instrumentStatus.instrument.id}
                onDone={() => removeModal(id)}
                onCancel={() => removeModal(id)}
              />
            ),
          });
          props.onClose();
        }
      }}
      getButtonProps={(action) =>
        [AlertAction.DISMISS, AlertAction.REMIND_ME_LATER].includes(action)
          ? { buttonType: "secondary" }
          : undefined
      }
    />
  );
}
