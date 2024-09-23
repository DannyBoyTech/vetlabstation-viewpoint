import { useEventListener } from "../../context/EventSourceContext";
import {
  EventIds,
  InstrumentMaintenanceResultDto,
  MaintenanceProcedure,
  MaintenanceProcedureAcceptedEvent,
  MaintenanceProcedureCode,
  MaintenanceResult,
} from "@viewpoint/api";
import { AddToastProps, SpotText, useToast } from "@viewpoint/spot-react";
import { TFunction, Trans, useTranslation } from "react-i18next";
import { useInfoModal } from "../global-modals/components/GlobalInfoModal";
import { useInstrumentNameForId } from "../../utils/hooks/hooks";
import { CommonTransComponents } from "../../utils/i18n-utils";
import { useCallback } from "react";
import { useGlobalModals } from "../global-modals/GlobalModals";
import { BleachCleanModal } from "../../screens/instruments/procyteone/maintenance/BleachCleanModal";
import {
  DefaultToastOptions,
  ToastContentRoot,
  ToastText,
  ToastTextContentRoot,
} from "../../utils/toast/toast-defaults";
import { trackMaintenanceResult } from "../../analytics/nltx-events";

export function useInstrumentMaintenanceResultActions() {
  const { addToast } = useToast();
  const { addInfoModal } = useInfoModal();
  const { addModal } = useGlobalModals();
  const { t } = useTranslation();
  const getInstrumentName = useInstrumentNameForId();

  //memoized to ensure events are not lost when rerender is triggered due to the same event
  const handleInstrumentMaintenanceResult = useCallback(
    (msg: MessageEvent) => {
      const data: InstrumentMaintenanceResultDto = JSON.parse(msg.data);

      trackMaintenanceResult({
        instrumentType: data.instrument.instrumentType,
        procedure: data.maintenanceType,
        result: data.result,
      });

      switch (data.maintenanceType) {
        case MaintenanceProcedure.GENERAL_CLEAN:
        case MaintenanceProcedure.OPTICS_CALIBRATION:
        case MaintenanceProcedure.OPTIMIZE:
        case MaintenanceProcedure.REPLACE_OBC:
        case MaintenanceProcedure.REPLACE_REAGENT:
        case MaintenanceProcedure.REPLACE_SHEATH:
          if (data.result === MaintenanceResult.SUCCESS) {
            handleSimpleToast(
              data,
              getInstrumentName(data.instrument.id) ??
                t(`instruments.names.${data.instrument.instrumentType}`),
              addToast,
              t
            );
          }
          break;
        case MaintenanceProcedure.OFFSETS:
          if (data.result === MaintenanceResult.SUCCESS) {
            handleSimpleToast(
              data,
              getInstrumentName(data.instrument.id) ??
                t(`instruments.names.${data.instrument.instrumentType}`),
              addToast,
              t
            );
          } else if (data.result === MaintenanceResult.FAILED) {
            addInfoModal({
              header: t("instrumentScreens.maintenance.title", {
                instrumentName: getInstrumentName(data.instrument.id),
              }),
              content: t(
                `instrumentMaintenanceResult.${data.instrument.instrumentType}.${data.maintenanceType}.${data.result}` as any
              ),
            });
          }
          break;
      }
    },
    [addToast, getInstrumentName, t, addInfoModal]
  );

  useEventListener(
    EventIds.InstrumentMaintenanceResult,
    handleInstrumentMaintenanceResult
  );

  useEventListener(EventIds.ProcedureRejected, (msg) => {
    const data: { instrumentId: number } = JSON.parse(msg.data);
    addInfoModal({
      header: (
        <>
          <SpotText level="h4">{getInstrumentName(data.instrumentId)}</SpotText>
          <SpotText level="h3">
            {t("instrumentMaintenanceResult.rejectedTitle")}
          </SpotText>
        </>
      ),
      confirmButtonContent: t("general.buttons.ok"),
      content: (
        <SpotText level="paragraph">
          <Trans
            i18nKey="instrumentMaintenanceResult.rejected"
            components={CommonTransComponents}
          />
        </SpotText>
      ),
    });
  });

  useEventListener(EventIds.MaintenanceProcedureAccepted, (msg) => {
    const accepted: MaintenanceProcedureAcceptedEvent = JSON.parse(msg.data);
    const bleachCleanModalId = crypto.randomUUID();

    switch (accepted.procedure) {
      case MaintenanceProcedureCode.BLEACH_CLEAN:
        addModal({
          id: bleachCleanModalId,
          content: (
            <BleachCleanModal
              instrumentId={accepted.instrumentId}
              modalId={bleachCleanModalId}
            />
          ),
        });
    }
  });
}

function handleSimpleToast(
  result: InstrumentMaintenanceResultDto,
  instrumentName: string,
  addToast: (props: AddToastProps) => void,
  t: TFunction,
  toastProperties?: Partial<AddToastProps>
) {
  addToast({
    ...DefaultToastOptions,
    alertLevel:
      result.result === MaintenanceResult.SUCCESS ? "default" : "danger",
    icon:
      result.result === MaintenanceResult.SUCCESS
        ? "checkmark"
        : "alert-notification",
    content: (
      <ToastContentRoot>
        <ToastTextContentRoot>
          <ToastText level="paragraph" bold $maxLines={1}>
            {instrumentName}
          </ToastText>
          <ToastText level="paragraph" $maxLines={2}>
            <Trans
              i18nKey={
                `instrumentMaintenanceResult.${result.instrument.instrumentType}.${result.maintenanceType}.${result.result}` as any
              }
              defaults={t("instrumentMaintenanceResult.default", {
                maintenanceType: result.maintenanceType,
                maintenanceResult: result.result,
              })}
            />
          </ToastText>
        </ToastTextContentRoot>
      </ToastContentRoot>
    ),
    ...toastProperties,
  });
}
