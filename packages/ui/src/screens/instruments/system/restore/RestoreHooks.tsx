import { Fragment, ReactNode, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useInfoModal } from "../../../../components/global-modals/components/GlobalInfoModal";
import {
  CalibrationRestoreEvent,
  EventIds,
  InstrumentType,
  ModeEnum,
  RemoteRestoreRequestEvent,
  RestoreDto,
} from "@viewpoint/api";
import { useGetInstrumentStatusesQuery } from "../../../../api/InstrumentApi";
import { SpotText } from "@viewpoint/spot-react/src";
import styled from "styled-components";
import { Theme } from "../../../../utils/StyleConstants";
import { useGetBootItemsQuery } from "../../../../api/BootItemsApi";
import { useEventListener } from "../../../../context/EventSourceContext";
import { useRespondToAsyncRestoreRequestMutation } from "../../../../api/RestoreApi";
import { useConfirmModal } from "../../../../components/global-modals/components/GlobalConfirmModal";

const StyledText = styled(SpotText).attrs({ level: "paragraph" })<{
  $failure: boolean;
}>`
  ${(p: { theme: Theme; $failure: boolean }) =>
    p.$failure ? `color: ${p.theme.colors?.feedback?.error}` : ""}
`;

export function useRestoreStatusNotifier() {
  const [userNotified, setUserNotified] = useState(false);
  const { data: bootItems, isLoading } = useGetBootItemsQuery();
  const { data: instrumentStatuses } = useGetInstrumentStatusesQuery();
  const { addInfoModal } = useInfoModal();

  const { t } = useTranslation();

  useEffect(() => {
    if (isLoading || instrumentStatuses == null) return;
    if (bootItems?.restoreDto.restorePerformed && !userNotified) {
      const restoreDto: RestoreDto = bootItems.restoreDto;
      setUserNotified(true);
      const messages: ReactNode[] = [];

      let restoreSuccess = true;

      if (restoreDto.mode === ModeEnum.ALL) {
        /*
        From JavaFx:
        NOTE: restore mode ALL is inclusive of calibration data restore. Also note that a user executing restore mode
        CALIBRATION will not result in execution of this code as we notify the client immediately of success/failure.
        For this reason, RestoreMode.CALIBRATION is not used here
        */
        const calSuccess = !!calibrationRestoreSucceeded(restoreDto, true);
        if (
          calSuccess ||
          // Only show failure if there is an LC or PDx on the system
          instrumentStatuses?.some((is) =>
            [
              InstrumentType.ProCyteDx,
              InstrumentType.LaserCyte,
              InstrumentType.LaserCyteDx,
            ].includes(is.instrument.instrumentType)
          )
        ) {
          restoreSuccess = restoreSuccess && calSuccess;
          messages.push(
            <StyledText $failure={!calSuccess}>
              {calSuccess
                ? t("restore.restoreRebootModal.hematologySuccess")
                : t("restore.restoreRebootModal.hematologyFailure")}
            </StyledText>
          );
        }
      }

      if (
        restoreDto.mode === ModeEnum.ALL ||
        restoreDto.mode === ModeEnum.PATIENT
      ) {
        restoreSuccess =
          restoreSuccess && !!restoreDto.restorePatientDataSuccess;
        messages.push(
          <StyledText $failure={!restoreDto.restorePatientDataSuccess}>
            {restoreDto.restorePatientDataSuccess
              ? t("restore.restoreRebootModal.patientDataSuccess")
              : t("restore.restoreRebootModal.patientDataFailure")}
          </StyledText>
        );

        /* Only notify a content restore failure and furthermore only in the case that there was content data to restore.
        The content database name will be empty in the case that there was no data to restore. */
        if (
          (restoreDto.restoreContentDatabaseName?.length ?? 0) > 0 &&
          !restoreDto.restoreContentDataSuccess
        ) {
          restoreSuccess = false;
          messages.push(
            <StyledText $failure>
              {t("restore.restoreRebootModal.contentDataFailure")}
            </StyledText>
          );
        }
      }

      if (
        restoreDto.mode === ModeEnum.ALL ||
        restoreDto.mode === ModeEnum.SETTINGS
      ) {
        restoreSuccess =
          restoreSuccess && !!restoreDto.restoreSettingsDataSuccess;
        messages.push(
          <StyledText $failure={!restoreDto.restoreSettingsDataSuccess}>
            {restoreDto.restoreSettingsDataSuccess
              ? t("restore.restoreRebootModal.settingsDataSuccess")
              : t("restore.restoreRebootModal.settingsDataFailure")}
          </StyledText>
        );
      }

      addInfoModal({
        header: t("restore.restoreRebootModal.title"),
        content: (
          <div>
            {messages.map((message, i) => (
              <Fragment key={i}>{message}</Fragment>
            ))}
            {!restoreSuccess && (
              <>
                <br />
                <SpotText level="paragraph" bold>
                  {t("restore.restoreRebootModal.failure")}
                </SpotText>
              </>
            )}
          </div>
        ),
      });
    }
  }, [
    instrumentStatuses,
    addInfoModal,
    bootItems?.restoreDto,
    isLoading,
    t,
    userNotified,
  ]);

  // Hematology calibration restores happen immediately without need for a reboot
  // Success/failure result will be pushed to client
  const calibrationResultCallback = useCallback(
    (msg: MessageEvent) => {
      const calibrationResult: CalibrationRestoreEvent = JSON.parse(msg.data);
      if (calibrationResult != null) {
        const calSuccess = !!calibrationRestoreSucceeded(
          {
            proCyteCalibrationDataPresent: calibrationResult.proCyteDataPresent,
            restoreProCyteCalibrationSuccess:
              calibrationResult.proCyteDataRestored,
            laserCyteCalibrationDataPresent:
              calibrationResult.laserCyteDataPresent,
            restoreLaserCyteCalibrationSuccess:
              calibrationResult.laserCyteDataRestored,
          },
          true
        );

        addInfoModal({
          header: t("restore.restoreRebootModal.title"),
          content: (
            <StyledText $failure={!calSuccess}>
              {calSuccess
                ? t("restore.restoreRebootModal.hematologySuccess")
                : t("restore.restoreRebootModal.hematologyFailure")}
            </StyledText>
          ),
        });
      }
    },
    [addInfoModal, t]
  );

  useEventListener(EventIds.CalibrationRestore, calibrationResultCallback);
}

function calibrationRestoreSucceeded(
  restoreDto: RestoreDto,
  failOnNoCalFiles?: boolean
) {
  if (
    restoreDto.proCyteCalibrationDataPresent &&
    restoreDto.laserCyteCalibrationDataPresent
  ) {
    return (
      restoreDto.restoreProCyteCalibrationSuccess &&
      restoreDto.restoreLaserCyteCalibrationSuccess
    );
  } else if (
    !restoreDto.proCyteCalibrationDataPresent &&
    restoreDto.laserCyteCalibrationDataPresent
  ) {
    return restoreDto.laserCyteCalibrationDataPresent;
  } else if (
    restoreDto.proCyteCalibrationDataPresent &&
    !restoreDto.laserCyteCalibrationDataPresent
  ) {
    return restoreDto.restoreProCyteCalibrationSuccess;
  } else {
    return !failOnNoCalFiles;
  }
}

export function useRemoteRestoreRequestHandler() {
  const [respond] = useRespondToAsyncRestoreRequestMutation();
  const { addConfirmModal } = useConfirmModal();
  const { t } = useTranslation();

  const evCallback = useCallback(
    (msg: MessageEvent) => {
      const request: RemoteRestoreRequestEvent = JSON.parse(msg.data);
      if (request != null) {
        addConfirmModal({
          dismissable: false,
          headerContent: t("restore.ssRestoreModal.header"),
          bodyContent: t("restore.ssRestoreModal.body"),
          confirmButtonContent: t("general.buttons.ok"),
          cancelButtonContent: t("general.buttons.cancel"),
          onConfirm: async () => {
            respond({
              backupId: request.backupId,
              accepted: true,
              restoreEventId: request.restoreEventId,
            });
          },
          onClose: () => {
            respond({
              backupId: request.backupId,
              accepted: false,
              restoreEventId: request.restoreEventId,
              reason: "USER_REJECTED",
            });
          },
        });
      }
    },
    [addConfirmModal, respond, t]
  );

  useEventListener(EventIds.RemoteRestoreRequest, evCallback);
}
