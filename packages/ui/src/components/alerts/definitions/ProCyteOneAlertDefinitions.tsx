import {
  AlertAction,
  AlertDto,
  BarcodeType,
  FluidPackStatusResponseDto,
  InstrumentStatusDto,
  ProCyteOneAlerts,
} from "@viewpoint/api";
import {
  GenericActionAlertContent,
  GenericActionAlertContentProps,
} from "./AlertComponents";
import { useMemo } from "react";
import { useGlobalModals } from "../../global-modals/GlobalModals";
import { ProCyteOneReplaceFluidModal } from "../../../screens/instruments/procyteone/maintenance/ProCyteOneReplaceFluidModal";
import { ProCyteOneReplaceFilterModal } from "../../../screens/instruments/procyteone/maintenance/ProCyteOneReplaceFilterModal";
import { ReplaceQcModal } from "../../../screens/instruments/procyteone/ReplaceQcModal";
import { TestId } from "../../../screens/instruments/procyteone/qc/ProCyteOneQcScreen";
import { useLocation, useNavigate } from "react-router-dom";
import { Trans } from "react-i18next";

export function getProCyteOneAlertContent(
  instrumentStatus: InstrumentStatusDto,
  alert: AlertDto,
  onClose: () => void
) {
  /*
    Any ProCyte One faults not included in this switch statement will be handled by default behavior in
    AlertDefinition.getAlertContent.
  */
  switch (alert.name) {
    /*
      ProCyte One faults handled by default behavior in AlertDefinition.getAlertContent
      CAMERA_INITIALIZATION_FAILURE
      MISSING_REAGENT
      MISSING_SAMPLE
      MISSING_SHEATH
      OVER_PRESSURE_UNRECOVERABLE
      OVER_TEMP
      SAMPLE_DRAWER_OPEN_RUN
      STOPPER_PRESENT
      UNKNOWN_TUBE
      UPDATE_PENDING
    */

    /*
      ProCyte One Acknowledge faults that override the default behavior
    */
    case ProCyteOneAlerts.ALG_RUN_FLAG_FAULT:
    case ProCyteOneAlerts.ASP_CLOT:
    case ProCyteOneAlerts.ASP_ERROR:
    case ProCyteOneAlerts.ASP_NO_FLUID:
    case ProCyteOneAlerts.ASP_PARTIAL:
    case ProCyteOneAlerts.ASP_START_IN_AIR:
    case ProCyteOneAlerts.DATA_PROCESSING_ERROR:
    case ProCyteOneAlerts.INSUFFICIENT_EVENTS:
    case ProCyteOneAlerts.JUNK_OVERLOAD:
    case ProCyteOneAlerts.MICROCODE_WATCHDOG:
    case ProCyteOneAlerts.MISSING_CONTROL:
    case ProCyteOneAlerts.OBC_LOW:
    case ProCyteOneAlerts.OVER_PRESSURE:
    case ProCyteOneAlerts.PACK_ACCESS_OPEN:
    case ProCyteOneAlerts.PACK_ACCESS_OPEN_RUN:
    case ProCyteOneAlerts.QC_REMINDER:
    case ProCyteOneAlerts.REAGENT_LOW:
    case ProCyteOneAlerts.REAGENT_PACK_LEAK:
    case ProCyteOneAlerts.REAGENT_PACK_LEAK_RUN:
    case ProCyteOneAlerts.SAMPLE_DRAWER_OPEN_QC:
    case ProCyteOneAlerts.SAMPLE_TUBE_RUN_END:
    case ProCyteOneAlerts.SHEATH_LOW:
    case ProCyteOneAlerts.SHUTDOWN_SHIPPING_CLEANUP:
    case ProCyteOneAlerts.SYR_RBC_HOME_ERROR:
    case ProCyteOneAlerts.SYR_RBC_MOTION_ERROR:
    case ProCyteOneAlerts.SYR_RBC_PRESSURE_ERROR:
    case ProCyteOneAlerts.SYR_SAMPLE_HOME_ERROR:
    case ProCyteOneAlerts.SYR_SAMPLE_MOTION_ERROR:
    case ProCyteOneAlerts.SYR_SAMPLE_PRESSURE_ERROR:
    case ProCyteOneAlerts.SYR_SHEATH_HOME_ERROR:
    case ProCyteOneAlerts.SYR_SHEATH_MOTION_ERROR:
    case ProCyteOneAlerts.SYR_SHEATH_PRESSURE_ERROR:
    case ProCyteOneAlerts.SYR_WBC_HOME_ERROR:
    case ProCyteOneAlerts.SYR_WBC_MOTION_ERROR:
    case ProCyteOneAlerts.SYR_WBC_PRESSURE_ERROR:
    case ProCyteOneAlerts.TUBE_EMPTY:
    case ProCyteOneAlerts.UNEXPECTED_ERROR:
    case ProCyteOneAlerts.UNEXPECTED_ERROR_MAINTENANCE:
    case ProCyteOneAlerts.XAXIS_MOTION_ERROR:
    case ProCyteOneAlerts.ZAXIS_MOTION_ERROR:
      return (
        /*
          Default Viewpoint behavior for Acknowledge faults will add an 'OK' button with the 'OK_REMOVE' action.

          All ProCyte One handlers for acknowledge faults in the IVLS server expect the 'OK' action to trigger removal
          of the fault. Because this expectation exists, override the default behavior for all acknowledge fault cases
          so the 'OK' action is sent rather than the 'OK_REMOVE' action.

          As a fallback, the 'OK_REMOVE' behavior being sent by VP would also work because the IVLS server has a
          wildcard definition for ProCyte One alert actions that includes the 'OK_REMOVE' action.
          See: com/idexx/labstation/serverapp/alert/acadia_alert_handlers.xml
        */
        <GenericActionAlertContent
          actions={[AlertAction.OK]}
          alert={alert}
          instrumentStatus={instrumentStatus}
        />
      );

    /*
      All other ProCyte One faults which have more unique deviations from the default behavior
    */
    case ProCyteOneAlerts.MAINTENANCE_TUBE_ERROR:
      return (
        <GenericActionAlertContent
          actions={[AlertAction.CANCEL]}
          alert={alert}
          instrumentStatus={instrumentStatus}
          afterPostAction={() => onClose()}
        />
      );
    case ProCyteOneAlerts.BARCODE_READ_FAILURE_QC:
    case ProCyteOneAlerts.OBC_EMPTY:
    case ProCyteOneAlerts.UNSUPPORTED_QC_LOT:
      return (
        <ReplaceSmartQcAlertContent
          alert={alert}
          instrumentStatus={instrumentStatus}
          onClose={() => onClose()}
        />
      );
    case ProCyteOneAlerts.FILTER_REPLACE:
    case ProCyteOneAlerts.FILTER_LEAK:
      return (
        <ReplaceFilterAlertContent
          alert={alert}
          instrumentStatus={instrumentStatus}
          onClose={() => onClose()}
        />
      );
    case ProCyteOneAlerts.BARCODE_READ_FAILURE_REAGENT:
    case ProCyteOneAlerts.BARCODE_READ_FAILURE_SHEATH:
      return (
        <ManualBarcodeEntryAlertContent
          alert={alert}
          instrumentStatus={instrumentStatus}
          onClose={() => onClose()}
        />
      );
    case ProCyteOneAlerts.EXPIRED_REAGENT:
    case ProCyteOneAlerts.REAGENT_EMPTY:
    case ProCyteOneAlerts.UNSTABLE_REAGENT:
    case ProCyteOneAlerts.USED_REAGENT:
      return (
        <ReplaceFluidPackAlertContent
          alert={alert}
          instrumentStatus={instrumentStatus}
          onClose={() => onClose()}
          fluidPackType={"Reagent"}
        />
      );
    case ProCyteOneAlerts.EXPIRED_SHEATH:
    case ProCyteOneAlerts.SHEATH_EMPTY:
    case ProCyteOneAlerts.UNSTABLE_SHEATH:
      return (
        <ReplaceFluidPackAlertContent
          alert={alert}
          instrumentStatus={instrumentStatus}
          onClose={() => onClose()}
          fluidPackType={"Sheath"}
        />
      );
    case ProCyteOneAlerts.BLEACH_CLEAN_RECOMMENDED:
    case ProCyteOneAlerts.BLEACH_CLEAN_REQUIRED:
      return (
        <BleachCleanAlertContent
          alert={alert}
          instrumentStatus={instrumentStatus}
          onClose={() => onClose()}
        />
      );
  }

  interface ProCyteOneAlertContentProps
    extends Pick<GenericActionAlertContentProps, "alert" | "instrumentStatus"> {
    onClose: () => void;
  }

  function ReplaceSmartQcAlertContent(props: ProCyteOneAlertContentProps) {
    const { addModal, removeModal } = useGlobalModals();
    const id = useMemo(() => crypto.randomUUID(), []);

    return (
      <GenericActionAlertContent
        alert={props.alert}
        instrumentStatus={props.instrumentStatus}
        actions={[AlertAction.REMIND_ME_LATER, AlertAction.REPLACE_SMART_QC]}
        afterPostAction={(action) => {
          if (action === AlertAction.REPLACE_SMART_QC) {
            addModal({
              id,
              content: (
                <ReplaceQcModal
                  data-testid={TestId.ChangeQCModal}
                  onClose={() => removeModal(id)}
                  onConfirm={() => removeModal(id)}
                />
              ),
            });
            props.onClose();
          }
        }}
        getButtonProps={(action) => {
          if (action === AlertAction.REMIND_ME_LATER) {
            // Some alerts show a "Remind me later" button, but send an "OK" alert action.
            // All "Remind me later" buttons are secondary
            if (
              alert.name === ProCyteOneAlerts.OBC_EMPTY ||
              alert.name === ProCyteOneAlerts.UNSUPPORTED_QC_LOT
            ) {
              return { alertAction: AlertAction.OK, buttonType: "secondary" };
            } else {
              return { buttonType: "secondary" };
            }
          }
        }}
      />
    );
  }

  interface FluidPackAlertContentProps extends ProCyteOneAlertContentProps {
    fluidPackType: FluidPackStatusResponseDto["packType"];
  }

  function ReplaceFluidPackAlertContent(props: FluidPackAlertContentProps) {
    const { addModal, removeModal } = useGlobalModals();
    const id = useMemo(() => crypto.randomUUID(), []);

    return (
      <GenericActionAlertContent
        alert={props.alert}
        instrumentStatus={props.instrumentStatus}
        actions={[
          props.fluidPackType === "Sheath"
            ? AlertAction.REPLACE_SHEATH
            : AlertAction.REPLACE_REAGENT,
        ]}
        afterPostAction={(action) => {
          if (
            action === AlertAction.REPLACE_SHEATH ||
            action === AlertAction.REPLACE_REAGENT
          ) {
            addModal({
              id,
              content: (
                <ProCyteOneReplaceFluidModal
                  onClose={() => removeModal(id)}
                  onConfirm={() => removeModal(id)}
                  open={true}
                  type={props.fluidPackType}
                />
              ),
            });
            props.onClose();
          }
        }}
      />
    );
  }

  function ReplaceFilterAlertContent(props: ProCyteOneAlertContentProps) {
    const { addModal, removeModal } = useGlobalModals();
    const id = useMemo(() => crypto.randomUUID(), []);

    return (
      <GenericActionAlertContent
        alert={props.alert}
        instrumentStatus={props.instrumentStatus}
        actions={[AlertAction.REPLACE_FILTER]}
        getButtonContent={(alert) =>
          replaceFilterButtonContent(alert, props.alert)
        }
        afterPostAction={(action) => {
          if (action === AlertAction.REPLACE_FILTER) {
            addModal({
              id,
              content: (
                <ProCyteOneReplaceFilterModal
                  onClose={() => removeModal(id)}
                  onConfirm={() => removeModal(id)}
                />
              ),
            });
            props.onClose();
          }
        }}
      />
    );
  }

  function replaceFilterButtonContent(action: AlertAction, alert: AlertDto) {
    // FILTER_LEAK does not use its alert action (REPLACE_FILTER) to map button text, set explicitly instead.
    const key =
      alert.name === ProCyteOneAlerts.FILTER_LEAK
        ? "FILTER_INSTRUCTIONS"
        : action.toString();
    return <Trans ns="alerts" i18nKey={`defaultActionButtons.${key}` as any} />;
  }

  function ManualBarcodeEntryAlertContent(props: ProCyteOneAlertContentProps) {
    const nav = useNavigate();
    const location = useLocation();

    return (
      <GenericActionAlertContent
        alert={props.alert}
        instrumentStatus={props.instrumentStatus}
        actions={[
          props.alert.name === ProCyteOneAlerts.BARCODE_READ_FAILURE_SHEATH
            ? AlertAction.ENTER_SHEATH_BARCODE
            : AlertAction.ENTER_REAGENT_BARCODE,
        ]}
        afterPostAction={(action) => {
          /*Before navigating to either of the barcode entry screen variants, ensure that we are not already at that
           * location. This prevents stacking the same screen repeatedly if the user cyclically executes this workflow
           * via the header bar alert icons (possible because they are visible everywhere).*/
          const sheathUrl = `/instruments/${props.instrumentStatus.instrument.id}/lotEntry/${BarcodeType.SHEATH}`;
          const reagentUrl = `/instruments/${props.instrumentStatus.instrument.id}/lotEntry/${BarcodeType.REAGENT}`;
          if (
            action === AlertAction.ENTER_SHEATH_BARCODE &&
            !location.pathname.endsWith(sheathUrl)
          ) {
            nav(sheathUrl);
          } else if (
            action === AlertAction.ENTER_REAGENT_BARCODE &&
            !location.pathname.endsWith(reagentUrl)
          ) {
            nav(reagentUrl);
          }
          props.onClose();
        }}
      />
    );
  }

  function BleachCleanAlertContent(props: ProCyteOneAlertContentProps) {
    return (
      <GenericActionAlertContent
        alert={props.alert}
        instrumentStatus={props.instrumentStatus}
        actions={
          props.alert.name === ProCyteOneAlerts.BLEACH_CLEAN_RECOMMENDED
            ? [AlertAction.REMIND_ME_LATER, AlertAction.RUN_BLEACH_CLEAN]
            : [AlertAction.RUN_BLEACH_CLEAN]
        }
        afterPostAction={(action) => {
          if (action === AlertAction.RUN_BLEACH_CLEAN) {
            /*Display of BleachCleanModal is managed by InstrumentMaintenanceResultHooks because this workflow can be
             * started here or via ProCye One Diagnostics screen and is dependent on the
             * MaintenanceProcedureAccepted notification event following execution of this alert action.*/
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
}
