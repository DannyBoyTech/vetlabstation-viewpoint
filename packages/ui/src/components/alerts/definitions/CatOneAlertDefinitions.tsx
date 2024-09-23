import {
  AlertAction,
  AlertDto,
  CatalystOneAlerts,
  InstrumentStatus,
  InstrumentStatusDto,
} from "@viewpoint/api";
import {
  AlertActionButtonProps,
  GenericActionAlertContent,
} from "./AlertComponents";
import dayjs from "dayjs";
import { Trans, useTranslation } from "react-i18next";
import { ConfirmModal } from "../../confirm-modal/ConfirmModal";
import { CommonTransComponents } from "../../../utils/i18n-utils";
import styled from "styled-components";
import AlignmentImage from "../../../assets/instruments/maintenance/catOne/optimize/CatOne_rtd_drawer_alignment.png";
import { useMemo, useState } from "react";
import {
  useRequestGeneralCleanMutation,
  useRequestOptimizationMutation,
} from "../../../api/CatOneApi";
import { useFormatLongDateTime12h } from "../../../utils/hooks/datetime";
import { useNavigate } from "react-router-dom";
import {
  getMaintenanceActionPath,
  MaintenanceActions,
} from "../../../screens/instruments/catone/CatOneMaintenanceScreen";

export function getCatOneAlertContent(
  instrumentStatus: InstrumentStatusDto,
  alert: AlertDto,
  onClose: () => void
) {
  switch (alert.name) {
    /*
      The following faults are handled by the default handler in AlertDefinitions.getAlertContent:

      ('ack' faults)

      ALG_ANOM_INIT_SLOPE_VS_SUB_READ
      ALG_ANOM_PROG_CURVE_DEVELOPMENT
      ALG_BAD_DRY_READ
      ALG_BAD_LATE_SLOPE
      ALG_BAD_RESPONSE_RANGE
      ALG_BAD_SC_MINUS_DRY_DIFF
      ALG_BAD_WASH_MINUS_SC_DIFF
      ALG_BAD_SUB_MINUS_WASH_DIFF
      ALG_ELLIPSE_INTERSECTION_FAIL
      ALG_GREATER_THAN_EXTREME_HIGH_CONC_LIMIT
      ALG_GREATER_THAN_EXTREME_LOW_CONC_LIMIT
      ALG_INTERFERING_SUBSTANCE
      ALG_ION_CALIBRATION_DRIFT
      ALG_ION_IMPULSE_DETECTED
      ALG_ION_SAMPLE_DRIFT
      ALG_ION_SAMPLE_ERROR
      ALG_ION_SAMPLE_NOT_DETECTED
      ALG_ION_SHIFT_DETECTED
      ALG_NO_SAMPLE_DISPENSE
      ALG_NO_WASH_1_DISPENSE
      ALG_NO_WASH_2_DISPENSE
      ALG_PHBR_BIASED_RESULT
      ALG_SLIDE_NOT_SPOTTED
      ALG_SLOPE_NOT_CORRECTABLE
      ALG_SLOPE_NOT_CORRECTABLE_GEN
      ALG_SUBSTRATE_DEPLETION
      ALG_TT4_ANOM_INIT_SLOPE_VS_SUB_READ
      ALG_TT4_ANOM_PROG_CURVE_DEVELOPMENT
      ALG_TT4_BAD_SUB_MINUS_WASH_DIFF
      ALG_TT4_ELLIPSE_INTERSECTION_FAIL
      ALG_DRY_READ_VARIANCE
      ASPIRATION_FAILURE
      ASPIRATION_START_IN_AIR
      ASPIRATION_START_IN_AIR_WARNING
      ASSAY_NORMALIZATION_MISSING
      BARCODE_READ_ERROR
      BARCODE_READ_FAILURE
      CHECK_EVAP_CAP
      CLOT_DETECTED_IN_SAMPLE
      CLOT_DETECTED_IN_SAMPLE_WARNING
      ERR_ALG_ALGORITHM_INTERFERING_SUBSTANCE
      FLUID_FIND_FAILURE (this is currently incorrectly sent as a 'sys' fault by IRIS)
      FOAM_DETECTED_IN_SAMPLE 
      FOAM_DETECTED_IN_SAMPLE_WARNING
      INSUFFICIENT_SAMPLE_VOLUME_IGNORABLE_WARNING
      INSUFFICIENT_SAMPLE_VOLUME_WARNING
      LVLASP_BUBBLE
      LVLASP_CLOT
      LVLASP_INSUFFICIENT_SAMPLE
      LVLASP_START_IN_AIR
      LYTE_PROCESSING_ERROR
      MATERIALS_INCOMPATIBLE_FRIENDS
      MISSING_EMPTY_DILUTION_CUP
      MISSING_IA_FOR_REAGENT
      MISSING_REAGENT_FOR_IA
      MISSING_REAGENT
      OFFSETS_CALIBRATION_ERROR
      OFFSETS_CV_TOO_HIGH_ERROR
      OFFSETS_INSUFFICIENT_SLIDES_ERROR
      OFFSETS_OUT_OF_RANGE_ERROR 
      OPTICS_LED_FAILURE
      OPTICS_SENSOR_FAILURE
      PHBR_ORIENT_ERROR
      SAMPLE_TOO_LOW
      SLIDE_CONTAMINATED
      SLIDE_REAGENT_LOT_MISMATCH
      SUSPECT_RESULT_COMPARISON
      UNSUPPORTED_QC_RANGE
      UNSUPPORTED_SLIDE_LOT
      UPGRADE_FAILED_DOWNLOAD
      UPGRADE_FAILED_PREPARATION
      USED_REAGENT_DETECTED
      USED_REAGENT_DETECTED_IGNORABLE_WARNING
      USED_REAGENT_DETECTED_WARNING

      ('sys' faults)

      ADD_PIPETTE_TIPS
      AIR_DETECTED_IN_SAMPLE
      AIR_DETECTED_IN_SAMPLE_WARNING
      ASPIRATION_FAILURE
      BAD_OR_MISSING_CALCURVE_DATA
      CALIBRATION_SOFTWARE_ERROR
      CAMERA_COM_ERROR
      CAMERA_CONNECTION_ERROR
      CAMERA_INITIALIZATION_FAILURE
      CANNOT_LOCK_SAMPLE_DRAWER
      CANNOT_UNLOCK_SAMPLE_DRAWER
      CAP_DETECTED
      CAROUSEL_ALIGNMENT_FAILED
      CAROUSEL_COVER_OPEN
      CAROUSEL_ROTATION_ERROR
      CENTRIFUGE_ERROR
      DILUTION_SLIDE_COUNT_EXCEEDED
      DUPLICATE_REAGENT_TYPE_DETECTED
      FLUID_FIND_FAILURE_DIL_CUP
      FLUID_FIND_FAILURE_MIX_CUP
      HEIGHT_CORRECTION_SURFACE_FIND_FAILURE
      INCORRECTLY_SEATED_CAROUSEL
      INCORRECT_SLIDE_OR_REAGENT
      
      INSUFFICIENT_DILUENT_VOLUME
      INSUFFICIENT_DILUENT_VOLUME_WARNING

      INSUFFICIENT_SAMPLE_FOR_DILUTION
      INSUFFICIENT_SAMPLE_FOR_DILUTION_WARNING
      INSUFFICIENT_SAMPLE_VOLUME
      INTERNAL_TIMING_ERROR
      MATERIALS_INCOMPATIBLE
      MISSING_DILUTION_MATERIALS
      MISSING_EMPTY_CUP

      MISSING_UPC_MATERIALS
      MULTIPLE_SAMPLES_DETECTED
      NO_IDENTIFIABLE_SLIDES_FOUND
      NO_SAMPLE_DETECTED
      OPTICS_CALIBRATION_REQUIRED
      OPTICS_INITIALIZATION_FAILURE
      OPTICS_MODULE_CONFIGURATION_ERROR
      PHBR_LOAD_ERROR

      PIPETTE_TIPS_LOW
      PRESSURE_SENSOR_ERROR
      REAGENT_IDENTIFICATION_ERROR
      RECOVERABLE_TIMEOUT
      RECOVERY_FAILURE
      ROBOT_HOMING_FAILURE
      ROBOT_MOTION_ERROR
      RUN_COMPLETION_ERROR
      SAMPLE_DRAWER_LOCK_ERROR
      SAMPLE_DRAWER_OPEN
      SAMPLE_DRAWER_OPEN_RUN
      SHIPPING_CLIPS_DETECTED
      SIDE_DOOR_OPEN
      SLIDE_DATE_SOFTWARE_VERSION_MISMATCH
      SLIDE_DETECTION_ERROR
      SLIDE_EJECT_ERROR
      SLIDE_LOADING_ERROR
      SLIDE_REAGENT_MISMATCH
      
      SLIDE_TIMEOUT_ERROR
      SPURIOUS_DEVICE_EVENT
      THERMAL_CONTROL_ERROR
      THERMAL_ERROR
      UNSPECIFIED_ERROR
      UNSUPPORTED_WHITE_REF_SLIDE_LOT
      USER_CALIBRATION_UNSUCCESSFUL
      WARMUP_THERMAL_ERROR
      WASTE_DRAWER_FULL
      WASTE_DRAWER_OPEN
      WASTE_DRAWER_OPEN_RUN
      WBS_SAMPLE_VOLUME_HIGH
    */

    case CatalystOneAlerts.CLEANING_REQUIRED:
      return (
        <CleaningRequiredAlertContent
          alertDto={alert}
          instrumentStatus={instrumentStatus}
          onClose={onClose}
        />
      );

    case CatalystOneAlerts.OPTIMIZATION_AVAILABLE:
      return (
        <GenericActionAlertContent
          alert={alert}
          instrumentStatus={instrumentStatus}
          actions={[AlertAction.OK_REMOVE, AlertAction.OPTIMIZE]}
          getButtonContent={optimizeButtonContent}
          getButtonProps={optimizeButtonProps}
        />
      );

    case CatalystOneAlerts.OPTIMIZATION_AVAILABLE_ALIGNMENT:
      return (
        <OptimizeAlignmentAlertContent
          alert={alert}
          instrumentStatus={instrumentStatus}
          onClose={onClose}
        />
      );

    case CatalystOneAlerts.UPDATE_AVAILABLE:
      return (
        <UpdateAvailableAlertContent
          alert={alert}
          instrumentStatus={instrumentStatus}
        />
      );

    case CatalystOneAlerts.UPDATE_FAILED:
      return (
        <UpdateFailedAlertContent
          alert={alert}
          instrumentStatus={instrumentStatus}
        />
      );

    case CatalystOneAlerts.UPDATE_FAILED_CATASTROPHIC:
      return (
        <GenericActionAlertContent
          alert={alert}
          instrumentStatus={instrumentStatus}
          actions={[AlertAction.OK]}
        />
      );
    case CatalystOneAlerts.OPTICS_CALIBRATION_REQUIRED:
      return (
        <OpticsCalibrationRequiredAlertContent
          alert={alert}
          instrumentStatus={instrumentStatus}
          onClose={onClose}
        />
      );
    case CatalystOneAlerts.INCORRECT_SLIDE_OR_REAGENT_IGNORABLE:
    case CatalystOneAlerts.INSUFFICIENT_PIPETTE_TIPS:
    case CatalystOneAlerts.INSUFFICIENT_SAMPLE_VOLUME_IGNORABLE:
    case CatalystOneAlerts.MISSING_REAGENT_IGNORABLE:
    case CatalystOneAlerts.PHBR_LOAD_ERROR_IGNORABLE:
    case CatalystOneAlerts.PHBR_ORIENT_ERROR_IGNORABLE:
    case CatalystOneAlerts.SLIDE_REAGENT_LOT_MISMATCH_IGNORABLE:
    case CatalystOneAlerts.SLIDE_REAGENT_MISMATCH_IGNORABLE:
    case CatalystOneAlerts.USED_REAGENT_DETECTED_IGNORABLE:
      return (
        <GenericActionAlertContent
          alert={alert}
          instrumentStatus={instrumentStatus}
          actions={alert.args?.["during-run"] ? [AlertAction.FORCE_RUN] : []}
        />
      );
  }
}

interface CleaningRequiredAlertContentProps {
  alertDto: AlertDto;
  instrumentStatus: InstrumentStatusDto;
  onClose: () => void;
}

function CleaningRequiredAlertContent(
  props: CleaningRequiredAlertContentProps
) {
  const nav = useNavigate();
  const [requestClean] = useRequestGeneralCleanMutation();
  return (
    <GenericActionAlertContent
      alert={props.alertDto}
      instrumentStatus={props.instrumentStatus}
      actions={[AlertAction.CLEAN]}
      getButtonProps={() => ({
        disabled: ![InstrumentStatus.Alert, InstrumentStatus.Ready].includes(
          props.instrumentStatus.instrumentStatus
        ),
      })}
      afterPostAction={() => {
        requestClean(props.instrumentStatus.instrument.id);
        nav(
          getMaintenanceActionPath(
            props.instrumentStatus.instrument.id,
            MaintenanceActions.Clean
          )
        );
        props.onClose();
      }}
    />
  );
}

function optimizeButtonContent(action: AlertAction) {
  const i18nKeys: { [key in AlertAction]?: string } = {
    [AlertAction.OPTIMIZE]: "defaultActionButtons.OPTIMIZE_NOW",
    [AlertAction.OK_REMOVE]: "defaultActionButtons.OPTIMIZE_LATER",
  } as const;

  return <Trans ns="alerts" i18nKey={i18nKeys[action] as any} />;
}

function optimizeButtonProps(action: AlertAction) {
  const buttonProps: Partial<AlertActionButtonProps> =
    action === AlertAction.OPTIMIZE ? {} : { buttonType: "secondary" };
  return buttonProps;
}

interface DateHolder {
  date: number;
}

function isDateHolder(it: unknown): it is DateHolder {
  if (it != null && typeof it === "object" && "date" in it) {
    const date = (it as { date?: unknown }).date;
    return typeof date === "number";
  }

  return false;
}

interface UpdateAvailableAlertContentProps {
  alert: AlertDto;
  instrumentStatus: InstrumentStatusDto;
}

function UpdateAvailableAlertContent(props: UpdateAvailableAlertContentProps) {
  const dateTimeFormat = useFormatLongDateTime12h();
  const dateArg = props.alert.args?.["date"];

  const autoUpdateWarning = useMemo(() => {
    return isDateHolder(dateArg) ? (
      <Trans
        ns="alerts"
        i18nKey="CATONE.UPDATE_AVAILABLE.autoUpdateWarning"
        values={{ dateTime: dateTimeFormat(dateArg.date) }}
        components={CommonTransComponents}
      />
    ) : undefined;
  }, [dateTimeFormat, dateArg]);

  return (
    <GenericActionAlertContent
      alert={props.alert}
      instrumentStatus={props.instrumentStatus}
      actions={[AlertAction.UPGRADE_LATER, AlertAction.UPGRADE_SOFTWARE]}
      getButtonProps={(action) => ({
        buttonType:
          action === AlertAction.UPGRADE_SOFTWARE ? "primary" : "secondary",
      })}
      additionalContent={autoUpdateWarning}
    />
  );
}

function upgradeButtonContent(action: AlertAction, allowLater: boolean) {
  let key: any;

  // allowing option for later changes upgrade button text to 'upgrade now'.
  // UPGRADE_SOFTWARE action maps to "Upgrade Now" button text (the action name
  // cannot be changed to match the text change because IVLS expects UPGRADE_SOFTWARE as the action name)
  if (action === AlertAction.UPGRADE_SOFTWARE) {
    key = `defaultActionButtons.UPGRADE${allowLater ? "_SOFTWARE" : ""}`;
  } else {
    key = `defaultActionButtons.${action}`;
  }

  return <Trans ns="alerts" i18nKey={key} />;
}

function upgradeButtonProps(
  alert: AlertAction
): Partial<AlertActionButtonProps> {
  return alert === AlertAction.UPGRADE_LATER ? { buttonType: "secondary" } : {};
}

interface UpdateFailedAlertContentProps {
  alert: AlertDto;
  instrumentStatus: InstrumentStatusDto;
}

function UpdateFailedAlertContent(props: UpdateFailedAlertContentProps) {
  const dateArg = props.alert.args?.["date"];

  let allowLater: boolean = true;
  if (isDateHolder(dateArg)) {
    const laterCutoff = dayjs(dateArg.date);
    const now = dayjs();

    if (now.isAfter(laterCutoff)) allowLater = false;
  }

  const actions = allowLater
    ? [AlertAction.UPGRADE_LATER, AlertAction.UPGRADE_SOFTWARE]
    : [AlertAction.UPGRADE_SOFTWARE];

  return (
    <GenericActionAlertContent
      alert={props.alert}
      instrumentStatus={props.instrumentStatus}
      actions={actions}
      getButtonContent={(alert) => upgradeButtonContent(alert, allowLater)}
      getButtonProps={upgradeButtonProps}
    />
  );
}

interface OptimizeAlignmentAlertContentProps {
  alert: AlertDto;
  instrumentStatus: InstrumentStatusDto;
  onClose: () => void;
}

function OptimizeAlignmentAlertContent(
  props: OptimizeAlignmentAlertContentProps
) {
  const [instructionsShowing, setInstructionsShowing] = useState(false);
  const [requestOptimization] = useRequestOptimizationMutation();

  const optimizeAlignmentButtonProps = (action: AlertAction) => {
    const buttonProps: Partial<AlertActionButtonProps> =
      action === AlertAction.OPTIMIZE
        ? {
            skipPostAction: true,
            onClick: () => {
              setInstructionsShowing(true);
            },
          }
        : { buttonType: "secondary" };
    return buttonProps;
  };

  const handleOptimize = () => {
    requestOptimization(props.instrumentStatus.instrument.id);
    setInstructionsShowing(false);
    props.onClose();
  };

  return (
    <>
      <GenericActionAlertContent
        alert={props.alert}
        instrumentStatus={props.instrumentStatus}
        actions={[AlertAction.OK_REMOVE, AlertAction.OPTIMIZE]}
        getButtonContent={optimizeButtonContent}
        getButtonProps={optimizeAlignmentButtonProps}
      />
      {instructionsShowing && (
        <OptimizeAlignmentInstructions onConfirm={handleOptimize} />
      )}
    </>
  );
}

const Root = styled.div`
  display: flex;
  gap: 34px;
  justify-content: space-around;
`;

const ImageSection = styled.div`
  flex: initial;

  > img {
    width: 360px;
  }
`;

const InstructionsSection = styled.div`
  flex: 1;

  > ol > li {
    padding-bottom: 12px;
    margin: 0;
  }
`;

// this styling override is getting a little unwieldy, and only necessary because
// higher level components are leaking styles to their children.
// we should fix those components rather than override the styles in the children.
const StyledConfirmModal = styled(ConfirmModal)`
  &&.spot-modal {
    min-height: 520px;
    max-width: 80vw;
  }
`;

function OptimizationAvailableBodyContent() {
  return (
    <Root>
      <ImageSection>
        <img src={AlignmentImage} alt="catone-alignment-image" />
      </ImageSection>
      <InstructionsSection>
        <Trans
          ns="alerts"
          i18nKey="CATONE.OPTIMIZATION_AVAILABLE_ALIGNMENT.instructions.body"
          components={CommonTransComponents}
        />
      </InstructionsSection>
    </Root>
  );
}

interface OptimizeAlignmentInstructionsProps {
  onConfirm?: () => void;
}

function OptimizeAlignmentInstructions(
  props: OptimizeAlignmentInstructionsProps
) {
  const { t } = useTranslation("alerts");

  const onConfirm = props.onConfirm ?? (() => {});

  return (
    <StyledConfirmModal
      dismissable={false}
      open={true}
      onClose={() => {}}
      onConfirm={onConfirm}
      headerContent={t(
        "CATONE.OPTIMIZATION_AVAILABLE_ALIGNMENT.instructions.title"
      )}
      bodyContent={<OptimizationAvailableBodyContent />}
      confirmButtonContent={t("buttons.start")}
    />
  );
}

interface OpticsCalibrationRequiredAlertContentProps {
  alert: AlertDto;
  instrumentStatus: InstrumentStatusDto;
  onClose: () => void;
}

function OpticsCalibrationRequiredAlertContent(
  props: OpticsCalibrationRequiredAlertContentProps
) {
  const nav = useNavigate();

  return (
    <>
      <GenericActionAlertContent
        alert={props.alert}
        instrumentStatus={props.instrumentStatus}
        actions={[AlertAction.CALIBRATE]}
        skipActions={[AlertAction.CALIBRATE]}
        getButtonProps={() => ({
          disabled: ![InstrumentStatus.Alert, InstrumentStatus.Ready].includes(
            props.instrumentStatus.instrumentStatus
          ),
        })}
        afterPostAction={() => {
          nav(
            getMaintenanceActionPath(
              props.instrumentStatus.instrument.id,
              MaintenanceActions.Calibrate
            )
          );
          props.onClose();
        }}
      />
    </>
  );
}
