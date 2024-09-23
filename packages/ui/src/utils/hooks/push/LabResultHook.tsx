import styled from "styled-components";
import { SpotText, useRemoveToast, useToast } from "@viewpoint/spot-react/src";
import { useTranslation } from "react-i18next";
import { useCallback } from "react";
import {
  EventIds,
  LabRequestCompleteDto,
  SettingTypeEnum,
} from "@viewpoint/api";
import { useEventListener } from "../../../context/EventSourceContext";
import { useNavigate } from "react-router-dom";
import { useGetSettingsQuery } from "../../../api/SettingsApi";
import { useSystemBeep } from "../../../context/AppStateContext";
import { extractAlertSettings } from "../../../screens/settings/AlertsAndNotifications";
import {
  DefaultToastOptions,
  ToastContentRoot,
  ToastText,
  ToastTextContentRoot,
} from "../../toast/toast-defaults";
import { useLazyGetDetailedLabRequestQuery } from "../../../api/LabRequestsApi";
import { useFormatPersonalName } from "../LocalizationHooks";

const StyledText = styled(SpotText)`
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

export const useLabRequestCompleteHook = () => {
  const { t } = useTranslation();
  const { addToast } = useToast();
  const { removeToast } = useRemoveToast();
  const nav = useNavigate();
  const { startBeeping, stopBeeping } = useSystemBeep();
  const formatName = useFormatPersonalName();

  const { data: settings, isLoading: isLoadingSettings } = useGetSettingsQuery([
    SettingTypeEnum.DISPLAY_SHOW_ALERT,
    SettingTypeEnum.DISPLAY_BLINK_NEW_RESULTS_DURATION,
    SettingTypeEnum.DISPLAY_BEEP_ALERT,
    SettingTypeEnum.DISPLAY_BEEP_ALERT_DURATION,
  ]);

  const [getLabRequest] = useLazyGetDetailedLabRequestQuery();

  // Listen to LabResult Events, and show toast message accordingly
  const labResultCallback = useCallback(
    async (msg: MessageEvent) => {
      const labRequestCompleteEvent: LabRequestCompleteDto = JSON.parse(
        msg.data
      );

      const { isBeepAlert, isShowAlert, showAlertDuration, beepAlertDuration } =
        extractAlertSettings(settings);

      const canDisplayAlert =
        isShowAlert &&
        labRequestCompleteEvent.includedRunsType !== "NO_COMPLETE_RUNS" &&
        labRequestCompleteEvent.includedRunsType !== "MANUAL_SNAP_ONLY" &&
        !labRequestCompleteEvent.isQualityControl;

      if (canDisplayAlert) {
        if (isBeepAlert && beepAlertDuration != null && beepAlertDuration > 0) {
          // Beep alert is stored in IVLS in seconds
          startBeeping(beepAlertDuration * 1000);
        }

        try {
          const labRequest = await getLabRequest({
            labRequestId: labRequestCompleteEvent.labRequestId,
          }).unwrap();

          const toastID = addToast({
            ...DefaultToastOptions,
            timer:
              showAlertDuration > 0
                ? showAlertDuration * 60000 // Display alert is stored in IVLS in minutes
                : undefined,
            icon: "clipboard-medical-notes",
            onDismiss: () => stopBeeping(),
            content: (
              <ToastContentRoot
                onClick={() => {
                  stopBeeping();
                  removeToast(toastID, "bottomLeft");
                  nav(`/labRequest/${labRequestCompleteEvent.labRequestId}`);
                }}
              >
                <ToastTextContentRoot>
                  <ToastText level="paragraph" bold $maxLines={1}>
                    {formatName({
                      firstName: labRequest.patientDto.patientName,
                      lastName: labRequest.patientDto.clientDto.lastName,
                    })}
                  </ToastText>
                  <ToastText level="paragraph" $maxLines={2}>
                    {t("Results.resultsComplete")}
                  </ToastText>
                </ToastTextContentRoot>
              </ToastContentRoot>
            ),
          });
        } catch (err) {
          console.error(
            `Error getting detailed lab request ${labRequestCompleteEvent.labRequestId} for new results notification`,
            err
          );
        }
      }
    },
    [
      settings,
      startBeeping,
      getLabRequest,
      addToast,
      formatName,
      t,
      stopBeeping,
      removeToast,
      nav,
    ]
  );

  useEventListener(EventIds.LabRequestComplete, labResultCallback);
};
