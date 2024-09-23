import {
  AlertAction,
  AlertDto,
  BackgroundCheckDto,
  HealthCode,
  InstrumentStatusDto,
  ProCyteDxAlerts,
  ProCyteDxFluidType,
} from "@viewpoint/api";
import {
  AlertActionButtonProps,
  GenericActionAlertContent,
  GenericActionAlertContentProps,
} from "./AlertComponents";
import { useLocation, useNavigate } from "react-router-dom";
import { Trans, useTranslation } from "react-i18next";
import { CommonTransComponents } from "../../../utils/i18n-utils";
import { useGetDetailedInstrumentStatusQuery } from "../../../api/InstrumentApi";
import { useMemo } from "react";
import { StickyHeaderDataTable } from "../../table/StickyHeaderTable";
import StartButton from "../../../assets/alerts/procytedx/crimson_start_button.png";
import { InlineText } from "../../typography/InlineText";
import styled from "styled-components";
import { getDefaultTextFromAlert } from "./alert-component-utils";
import { SpotText } from "@viewpoint/spot-react";
import classNames from "classnames";
import { SpotTokens } from "../../../utils/StyleConstants";

/* A few important things to note with ProCyte Dx alerts:
 * - ProCyte Dx predates the commonly referred to "Fault Types" (Acknowledge, System, Reminder) seen in newer instruments.
 *   Although there is overlap conceptually, behavior is more loosely defined on a fault by fault basis.
 * - this function intentionally does not consider faults which are "ignored" by the IVLS server. These
 *   ignored faults will never bubble up to the client, this behavior is consistent with the FX client. For more info,
 *   see com.idexx.labstation.serverapp.alert.crimson.CrimsonAlertManager#IGNORE_ALERTS
 * - minus unrecognized faults and the "ignored" faults mentioned above, all PDx faults should be explicitly handled
 *   by this function. The reason being that we should not rely on the default behavior provided in
 *   AlertDefinitons#getAlertContent as it relies on the "Fault Type" paradigm mentioned above.
 * */
export function getProCyteDxAlertContent(
  instrumentStatus: InstrumentStatusDto,
  alert: AlertDto,
  onClose: () => void
) {
  switch (alert.name) {
    /*PDx faults that override the default "OK_REMOVE" alert action. The IVLS server expects just the "OK" action
     * to trigger removal of these faults*/
    case ProCyteDxAlerts.BLOOD_ASP_SENSOR:
    case ProCyteDxAlerts.DIFF_CH:
    case ProCyteDxAlerts.DIFF_SAMPLING:
    case ProCyteDxAlerts.EXCHANGE_AIR_PUMP:
    case ProCyteDxAlerts.HGB:
    case ProCyteDxAlerts.LASER_DIODE_AGED:
    case ProCyteDxAlerts.PLT_CH:
    case ProCyteDxAlerts.RBC_CH:
    case ProCyteDxAlerts.REPLACE_PIERCER:
    case ProCyteDxAlerts.RET_CH:
    case ProCyteDxAlerts.RET:
    case ProCyteDxAlerts.SAMPLE_NOT_ASP:
    case ProCyteDxAlerts.SHORT_SAMPLE:
    case ProCyteDxAlerts.SOFTWARE_UPGRADE_TIMEOUT:
      return (
        <GenericActionAlertContent
          alert={alert}
          instrumentStatus={instrumentStatus}
          actions={[AlertAction.OK]}
        />
      );

    /*PDx faults which provide user instruction but no user action buttons */
    case ProCyteDxAlerts.ASP_UNIT_UPDOWN_MOTOR:
    case ProCyteDxAlerts.CLOSE_FCM_DETECT_COVER:
    case ProCyteDxAlerts.ENV_TEMP_HIGH:
    case ProCyteDxAlerts.ENV_TEMP_LOW:
    case ProCyteDxAlerts.ENV_THERM_SENS:
    case ProCyteDxAlerts.FCM_RU_TEMP_HIGH:
    case ProCyteDxAlerts.FCM_RU_TEMP_LOW:
    case ProCyteDxAlerts.FCM_RU_THERM_SENS:
    case ProCyteDxAlerts.FCM_SHEATH_SENS:
    case ProCyteDxAlerts.IPU_COMMUNICATION_ERROR:
    case ProCyteDxAlerts.LASER_POWER:
    case ProCyteDxAlerts.RH_TEMP_HIGH_DIFF:
    case ProCyteDxAlerts.RH_TEMP_HIGH_RET:
    case ProCyteDxAlerts.RH_TEMP_LOW_DIFF:
    case ProCyteDxAlerts.RH_TEMP_LOW_RET:
    case ProCyteDxAlerts.RH_THERM_SENS_ERR_DIFF:
    case ProCyteDxAlerts.RH_THERM_SENS_ERR_RET:
    case ProCyteDxAlerts.RIGHT_COVER_HAS_OPENED:
    case ProCyteDxAlerts.RIGHT_COVER_IS_OPEN:
    case ProCyteDxAlerts.SFS_INTERRUPTED:
    case ProCyteDxAlerts.SYSTEM_CONFIGURATION:
    case ProCyteDxAlerts.TUBE_HOLDER_HAS_OPENED:
    case ProCyteDxAlerts.TURN_ON_MAIN_UNIT:
      return (
        <GenericActionAlertContent
          alert={alert}
          instrumentStatus={instrumentStatus}
          actions={[]}
        />
      );

    case ProCyteDxAlerts.PRESSURE_LOWER:
    case ProCyteDxAlerts.MPA_06:
    case ProCyteDxAlerts.MPA_NEG03:
      return (
        <GenericActionAlertContent
          alert={alert}
          instrumentStatus={instrumentStatus}
          actions={[AlertAction.RESET_AIR_PUMP]}
        />
      );

    case ProCyteDxAlerts.EXCHANGE_WASTE_TANK:
    case ProCyteDxAlerts.WASTE_CHAMBER_1:
    case ProCyteDxAlerts.WASTE_CHAMBER_2:
      return (
        <GenericActionAlertContent
          alert={alert}
          instrumentStatus={instrumentStatus}
          actions={[AlertAction.DRAIN_WASTE_CHAMBER]}
        />
      );

    case ProCyteDxAlerts.RBC_HGB_CHAMBER:
    case ProCyteDxAlerts.RET_CHAMBER:
    case ProCyteDxAlerts.WBC_CHAMBER:
      return (
        <GenericActionAlertContent
          alert={alert}
          instrumentStatus={instrumentStatus}
          actions={[AlertAction.DRAIN_REACTION_CHAMBER]}
        />
      );

    case ProCyteDxAlerts.PLT_SAMPLING:
    case ProCyteDxAlerts.RBC_BUBBLE:
    case ProCyteDxAlerts.RBC_CLOG:
    case ProCyteDxAlerts.RBC_SAMPLING:
      return (
        <GenericActionAlertContent
          alert={alert}
          instrumentStatus={instrumentStatus}
          actions={[AlertAction.REMOVE_CLOGS]}
        />
      );

    case ProCyteDxAlerts.CHAMBER_EPK:
    case ProCyteDxAlerts.FFS_ASP_ERROR:
    case ProCyteDxAlerts.REPLACE_EPK:
    case ProCyteDxAlerts.REPLACE_FFD:
    case ProCyteDxAlerts.REPLACE_RED:
    case ProCyteDxAlerts.REPLACE_SLS:
      return (
        <GenericActionAlertContent
          alert={alert}
          instrumentStatus={instrumentStatus}
          actions={[AlertAction.START_PRIME]}
        />
      );

    case ProCyteDxAlerts.WB_ASP_MOTOR:
      return (
        <GenericActionAlertContent
          alert={alert}
          instrumentStatus={instrumentStatus}
          actions={[AlertAction.RESET_WB_MOTOR]}
        />
      );

    case ProCyteDxAlerts.SHEATH_MOTOR:
      return (
        <GenericActionAlertContent
          alert={alert}
          instrumentStatus={instrumentStatus}
          actions={[AlertAction.RESET_SHEATH_MOTOR]}
        />
      );

    case ProCyteDxAlerts.ASP_UNIT_FRONTBACK_MOTOR:
      return (
        <GenericActionAlertContent
          alert={alert}
          instrumentStatus={instrumentStatus}
          actions={[AlertAction.ASPIRATION_UNIT_MOTOR]}
        />
      );

    case ProCyteDxAlerts.RINSE_CUP_PINCH_VALVE:
    case ProCyteDxAlerts.WASTE_CHAMBER_1_PINCH_VALVE:
    case ProCyteDxAlerts.WASTE_CHAMBER_2_PINCH_VALVE:
      return (
        <GenericActionAlertContent
          alert={alert}
          instrumentStatus={instrumentStatus}
          actions={[AlertAction.PINCH_VALVE]}
        />
      );

    case ProCyteDxAlerts.TUBE_HOLDER_MOTOR:
      return (
        <GenericActionAlertContent
          alert={alert}
          instrumentStatus={instrumentStatus}
          actions={[AlertAction.TUBE_HOLDER_MOTOR]}
        />
      );

    case ProCyteDxAlerts.EXECUTE_MONTHLY_RINSE_WARNING:
      return (
        <GenericActionAlertContent
          alert={alert}
          instrumentStatus={instrumentStatus}
          actions={[AlertAction.MONTHLY_RINSE]}
        />
      );

    case ProCyteDxAlerts.RET_SAMPLING:
    case ProCyteDxAlerts.WBC_SAMPLING:
    case ProCyteDxAlerts.WBC_CH:
      return (
        <GenericActionAlertContent
          alert={alert}
          instrumentStatus={instrumentStatus}
          actions={[AlertAction.RINSE_FLOW_CELL]}
        />
      );

    case ProCyteDxAlerts.EXECUTE_MONTHLY_RINSE_IVLS:
      return (
        <GenericActionAlertContent
          alert={alert}
          instrumentStatus={instrumentStatus}
          actions={[AlertAction.REMIND_ME_LATER, AlertAction.MONTHLY_RINSE]}
          getButtonProps={(action) =>
            action === AlertAction.REMIND_ME_LATER
              ? { buttonType: "secondary" }
              : undefined
          }
        />
      );

    case ProCyteDxAlerts.STARTUP_PRIME_REQUIRED:
      return (
        <GenericActionAlertContent
          alert={alert}
          instrumentStatus={instrumentStatus}
          actions={[AlertAction.CONTINUE]}
        />
      );

    case ProCyteDxAlerts.SFS_REAGENTS_DRAINED:
      return (
        <GenericActionAlertContent
          alert={alert}
          instrumentStatus={instrumentStatus}
          actions={[AlertAction.FINISH]}
        />
      );

    /*Contrary to other alerts in VP (which have done away with "Close" buttons), UNINTENTIONAL_OFFLINE_TIMEOUT,
     * and WAKE_ON_LAN_FAILURE_TIMEOUT require it. The reason is that the IVLS server expects this action as a way for
     * the user to clear the alert.*/
    case ProCyteDxAlerts.UNINTENTIONAL_OFFLINE_TIMEOUT:
      return (
        <GenericActionAlertContent
          alert={alert}
          instrumentStatus={instrumentStatus}
          actions={[AlertAction.WAKE_ON_LAN, AlertAction.CLOSE]}
          getButtonContent={powerOnProCyteDxButtonContent}
        />
      );
    case ProCyteDxAlerts.WAKE_ON_LAN_FAILURE_TIMEOUT:
      return (
        <GenericActionAlertContent
          alert={alert}
          instrumentStatus={instrumentStatus}
          actions={[AlertAction.CLOSE]}
        />
      );

    case ProCyteDxAlerts.REPLACE_REAGENT_PACKAGE:
    case ProCyteDxAlerts.EXPIRED_EPK:
    case ProCyteDxAlerts.EXPIRED_FFD:
    case ProCyteDxAlerts.EXPIRED_RED:
    case ProCyteDxAlerts.EXPIRED_SLS:
      return (
        <ReplaceFluid
          fluidType={ProCyteDxFluidType.REAGENT}
          alert={alert}
          instrumentStatus={instrumentStatus}
          remindMeLater={alert.name !== ProCyteDxAlerts.REPLACE_REAGENT_PACKAGE}
          onClose={onClose}
        />
      );

    case ProCyteDxAlerts.REPLACE_FFS:
    case ProCyteDxAlerts.REPLACE_RES:
    case ProCyteDxAlerts.EXPIRED_FFS:
    case ProCyteDxAlerts.EXPIRED_RES:
      return (
        <ReplaceFluid
          fluidType={ProCyteDxFluidType.STAIN}
          alert={alert}
          instrumentStatus={instrumentStatus}
          remindMeLater={
            alert.name === ProCyteDxAlerts.EXPIRED_FFS ||
            alert.name === ProCyteDxAlerts.EXPIRED_RES
          }
          onClose={onClose}
        />
      );

    case ProCyteDxAlerts.NEW_HARDWARE_DETECTED:
      return (
        <NewHardwareDetected
          alert={alert}
          instrumentStatus={instrumentStatus}
          onClose={onClose}
        />
      );

    case ProCyteDxAlerts.BACKGROUND:
      return (
        <BackgroundError alert={alert} instrumentStatus={instrumentStatus} />
      );

    case ProCyteDxAlerts.SOFTWARE_UPGRADE_AVAILABLE:
    case ProCyteDxAlerts.SOFTWARE_UPGRADE_FAILED:
      return (
        <SoftwareUpgrade alert={alert} instrumentStatus={instrumentStatus} />
      );
    case ProCyteDxAlerts.PRESS_START_BUTTON:
      return (
        <PressStartButton
          alert={alert}
          instrumentStatus={instrumentStatus}
          actions={[AlertAction.CANCEL_RUN]}
        />
      );

    case ProCyteDxAlerts.PRESS_START_BUTTON_QC:
      return (
        <PressStartButtonQc
          alert={alert}
          instrumentStatus={instrumentStatus}
          actions={[AlertAction.CANCEL_RUN]}
        />
      );
    case ProCyteDxAlerts.REAGENT_KIT_LOW:
    case ProCyteDxAlerts.STAIN_PACK_LOW:
      return (
        <GenericActionAlertContent
          alert={alert}
          instrumentStatus={instrumentStatus}
          actions={[
            AlertAction.REMIND_ME_NEXT_RUN,
            AlertAction.REMIND_ME_WHEN_EMPTY,
          ]}
          getButtonProps={(action) =>
            action === AlertAction.REMIND_ME_WHEN_EMPTY
              ? { disabled: !Boolean(alert.args?.["installed"]) }
              : undefined
          }
        />
      );
    default:
      return (
        <UnmappedAlert alert={alert} instrumentStatus={instrumentStatus} />
      );
  }
}

interface ReplaceFluidProps
  extends Pick<GenericActionAlertContentProps, "alert" | "instrumentStatus"> {
  onClose: () => void;
  fluidType: ProCyteDxFluidType;
  remindMeLater: boolean;
}

function ReplaceFluid(props: ReplaceFluidProps) {
  const nav = useNavigate();
  const location = useLocation();

  return (
    <GenericActionAlertContent
      alert={props.alert}
      instrumentStatus={props.instrumentStatus}
      actions={
        props.remindMeLater
          ? [AlertAction.REMIND_ME_LATER, AlertAction.CLOSE]
          : [AlertAction.CLOSE]
      }
      getButtonContent={(action) =>
        replaceFluidButtonContent(props.fluidType, action)
      }
      getButtonProps={(action) =>
        action === AlertAction.REMIND_ME_LATER
          ? { buttonType: "secondary" }
          : undefined
      }
      afterPostAction={(action) => {
        // the button that initiates a fluid replacement workflow expectedly (but unintuitively) sends the CLOSE action.
        if (action === AlertAction.CLOSE) {
          // Before navigating to either of the lot-entry screens, ensure that we are not already at that location.
          const url = `/instruments/${props.instrumentStatus.instrument.id}/lotEntry?fluidType=${props.fluidType}`;
          if (!(location.pathname + location.search).includes(url)) {
            // always skip the sufficient volume confirmation when this workflow is executed via an alert
            nav(url + `&skipSufficientVolumeConfirmation=${true}`);
          }
          props.onClose();
        }
      }}
    />
  );
}

const BackgroundErrorRoot = styled.div`
  display: contents;

  .out-of-range td {
    color: ${(p) => p.theme.colors?.feedback?.error};
    font-weight: ${SpotTokens.font.weight.bold};
  }
`;

function BackgroundErrorDataTable(props: BackgroundErrorProps) {
  const { t } = useTranslation("alerts");
  const { t: normalT } = useTranslation();

  const rowData = useMemo<BackgroundCheckDto[]>(
    () =>
      Object.values(
        props.alert.args as unknown as Record<string, BackgroundCheckDto>
      ).filter((item) => typeof item === "object"),
    [props.alert.args]
  );

  const columns = useMemo(
    () => [
      {
        Header: t("CRIMSON.BACKGROUND.table.headers.assay"),
        accessor: "assayName",
        Cell: ({ value }: { value: unknown }) =>
          t(`CRIMSON.BACKGROUND.table.assays.${value}` as any),
      },
      {
        Header: t("CRIMSON.BACKGROUND.table.headers.result"),
        accessor: "value",
        Cell: ({ value }: { value: unknown }) =>
          typeof value !== "number"
            ? normalT("general.placeholder.noValue")
            : (value as number).toFixed(2),
      },
      {
        Header: t("CRIMSON.BACKGROUND.table.headers.limit"),
        accessor: "highLimit",
        Cell: ({ value }: { value: unknown }) =>
          typeof value !== "number"
            ? normalT("general.placeholder.noValue")
            : (value as number).toFixed(2),
      },
      {
        Header: t("CRIMSON.BACKGROUND.table.headers.unit"),
        accessor: "units",
        Cell: ({ value }: { value: unknown }) =>
          value ?? normalT("general.placeholder.noValue"),
      },
    ],
    [normalT, t]
  );

  return (
    <BackgroundErrorRoot>
      <StickyHeaderDataTable
        columns={columns}
        data={rowData as unknown as Record<string, unknown>[]}
        getRowProps={(row, meta) => {
          const resultRecord: BackgroundCheckDto = meta.row
            .original as unknown as BackgroundCheckDto;
          const outOfRange = resultRecord.value > (resultRecord.highLimit ?? 0);
          return {
            ...row,
            className: classNames(row.className, {
              "out-of-range": outOfRange,
            }),
          };
        }}
      />
    </BackgroundErrorRoot>
  );
}

interface BackgroundErrorProps
  extends Pick<GenericActionAlertContentProps, "alert" | "instrumentStatus"> {}

function BackgroundError(props: BackgroundErrorProps) {
  return (
    <GenericActionAlertContent
      alert={props.alert}
      instrumentStatus={props.instrumentStatus}
      actions={[AlertAction.REMIND_ME_LATER, AlertAction.AUTO_RINSE]}
      getButtonProps={(action) =>
        action === AlertAction.REMIND_ME_LATER
          ? { buttonType: "secondary" }
          : undefined
      }
      additionalContent={<BackgroundErrorDataTable {...props} />}
    />
  );
}

interface SoftwareUpgradeProps
  extends Pick<GenericActionAlertContentProps, "alert" | "instrumentStatus"> {}

function SoftwareUpgrade(props: SoftwareUpgradeProps) {
  const { data: detailedStatus, isLoading } =
    useGetDetailedInstrumentStatusQuery(props.instrumentStatus.instrument.id);

  return (
    <GenericActionAlertContent
      alert={props.alert}
      instrumentStatus={props.instrumentStatus}
      actions={[AlertAction.REMIND_ME_LATER, AlertAction.UPGRADE_SOFTWARE]}
      getButtonProps={(action) =>
        upgradeButtonProps(
          action,
          isLoading || detailedStatus?.status !== HealthCode.HALT
        )
      }
    />
  );
}

const PressStartButtonRoot = styled.div`
  display: flex;
  gap: 16px;
  align-items: flex-start;

  > img {
    margin-left: auto;
  }
`;

function PressStartButton(props: GenericActionAlertContentProps) {
  const { t } = useTranslation("alerts");
  return (
    <GenericActionAlertContent
      alert={props.alert}
      instrumentStatus={props.instrumentStatus}
      actions={[AlertAction.CANCEL_RUN]}
      content={
        <PressStartButtonRoot>
          <InlineText level="paragraph">
            <Trans
              ns="alerts"
              i18nKey={"CRIMSON.PRESS_START_BUTTON.body"}
              defaults={
                getDefaultTextFromAlert(props.alert) ?? t("default.message")
              }
              values={props.alert.args}
              components={{ ...CommonTransComponents }}
            />
          </InlineText>
          <img src={StartButton} alt={"press-start-button"} />
        </PressStartButtonRoot>
      }
    />
  );
}

// This alert is a bit strange currently -- IVLS sends a localization key as an
// arg (called "units") that is used to indicate the instructions to display
// to the user. IVLS uses the unit system to determine which localization key
// to send, but for all non-US units systems the key is just an empty string.
// This means the instructions for non-US units systems are blank.
// Ideally, we would get different instructions for all units systems and just
// determine which instruction set to display here in code rather than relying
// on the alert arg sent by the IVLS server, but for now sticking with parity approach.
function PressStartButtonQc(props: GenericActionAlertContentProps) {
  const { t } = useTranslation("alerts");
  return (
    <GenericActionAlertContent
      alert={props.alert}
      instrumentStatus={props.instrumentStatus}
      actions={[AlertAction.CANCEL_RUN]}
      content={
        <PressStartButtonRoot>
          <InlineText level="paragraph">
            <Trans
              ns="alerts"
              i18nKey={"CRIMSON.PRESS_START_BUTTON_QC.body"}
              defaults={
                getDefaultTextFromAlert(props.alert) ?? t("default.message")
              }
              values={props.alert.args}
              components={{ ...CommonTransComponents }}
            />
          </InlineText>
          <img src={StartButton} alt={"press-start-button"} />
        </PressStartButtonRoot>
      }
    />
  );
}

function NewHardwareDetected(
  props: Pick<GenericActionAlertContentProps, "alert" | "instrumentStatus"> & {
    onClose: () => void;
  }
) {
  const nav = useNavigate();
  return (
    <GenericActionAlertContent
      alert={props.alert}
      instrumentStatus={props.instrumentStatus}
      actions={[AlertAction.CONFIGURE]}
      // IVLS doesn't actually want the action to be posted for this alert
      skipActions={[AlertAction.CONFIGURE]}
      afterPostAction={(action) => {
        if (action === AlertAction.CONFIGURE) {
          nav(
            `/instruments/${props.instrumentStatus.instrument.id}/newHardware`
          );
          props.onClose();
        }
      }}
    />
  );
}

function upgradeButtonProps(action: AlertAction, upgradeBlocked: boolean) {
  let buttonProps: Partial<AlertActionButtonProps> = {};
  if (action === AlertAction.REMIND_ME_LATER) {
    buttonProps = { buttonType: "secondary" };
  } else if (action === AlertAction.UPGRADE_SOFTWARE) {
    buttonProps = { disabled: upgradeBlocked };
  }
  return buttonProps;
}

interface UnhandledAlertProps
  extends Pick<GenericActionAlertContentProps, "alert" | "instrumentStatus"> {}

function UnmappedAlert(props: UnhandledAlertProps) {
  const { t } = useTranslation();
  return (
    <GenericActionAlertContent
      alert={props.alert}
      instrumentStatus={props.instrumentStatus}
      actions={[AlertAction.CLOSE]}
      getButtonContent={(action) =>
        action === AlertAction.CLOSE ? t("general.buttons.ok") : undefined
      }
      content={
        <Trans
          ns="alerts"
          i18nKey="CRIMSON.unmapped.body"
          values={props.alert.args}
          components={{ ...CommonTransComponents }}
        />
      }
    />
  );
}

function powerOnProCyteDxButtonContent(action: AlertAction) {
  const i18nKeys: { [key in AlertAction]?: string } = {
    [AlertAction.WAKE_ON_LAN]: "buttons.powerOnProCyteDx",
    [AlertAction.CLOSE]: "defaultActionButtons.CLOSE",
  } as const;

  return <Trans ns="alerts" i18nKey={i18nKeys[action] as any} />;
}

function replaceFluidButtonContent(
  fluidType: ProCyteDxFluidType,
  action: AlertAction
) {
  const i18nKeys: { [key in AlertAction]?: string } = {
    [AlertAction.CLOSE]:
      fluidType === ProCyteDxFluidType.STAIN
        ? "defaultActionButtons.CHANGE_STAIN"
        : "defaultActionButtons.CHANGE_REAGENT",
    [AlertAction.REMIND_ME_LATER]: "defaultActionButtons.REMIND_ME_LATER",
  } as const;

  return <Trans ns="alerts" i18nKey={i18nKeys[action] as any} />;
}
