import { useEventListener } from "../../../context/EventSourceContext";
import {
  EventIds,
  InstrumentRunStatus,
  InstrumentRunTimerCompleteDto,
  InstrumentType,
  SettingTypeEnum,
} from "@viewpoint/api";
import { useCallback, useEffect } from "react";
import {
  Button,
  SpotText,
  useRemoveToast,
  useToast,
} from "@viewpoint/spot-react/src";
import { usePrevious } from "../hooks";
import { InlineText } from "../../../components/typography/InlineText";
import { useTranslation } from "react-i18next";
import { useSystemBeep } from "../../../context/AppStateContext";
import { useGetRunningLabRequestsQuery } from "../../../api/LabRequestsApi";
import { useGetSettingQuery } from "../../../api/SettingsApi";
import { skipToken } from "@reduxjs/toolkit/query";
import { useFormatPersonalName } from "../LocalizationHooks";
import {
  DefaultToastOptions,
  ToastButtonContent,
  ToastContentRoot,
  ToastText,
  ToastTextContentRoot,
} from "../../toast/toast-defaults";
import { useNavigate } from "react-router-dom";

export function useTimerCompleteToast() {
  const { addToast } = useToast();
  const { removeToast } = useRemoveToast();
  const formatName = useFormatPersonalName();
  const { t } = useTranslation();
  const nav = useNavigate();

  const handleCompleteMessage = useCallback(
    (msg: MessageEvent<any>) => {
      const completeMessage: InstrumentRunTimerCompleteDto = JSON.parse(
        msg.data
      );
      const toastID = toastIdForSnapRunTimerComplete(
        completeMessage.instrumentRunDto.id
      );
      addToast({
        ...DefaultToastOptions,
        timer: undefined,
        id: toastID,
        icon: "bell",
        content: (
          <ToastContentRoot>
            <ToastTextContentRoot>
              <ToastText level="paragraph" bold $maxLines={1}>
                {formatName({
                  firstName:
                    completeMessage.labRequestDto.patientDto.patientName,
                  lastName:
                    completeMessage.labRequestDto.patientDto.clientDto.lastName,
                })}
              </ToastText>
              <ToastText level="paragraph" $maxLines={2}>
                {t("resultsEntry.snap.timerToast.complete", {
                  snapName: t(
                    completeMessage.instrumentRunDto.snapDeviceDto
                      ?.displayNamePropertyKey as any
                  ),
                })}
              </ToastText>
            </ToastTextContentRoot>
            <ToastButtonContent>
              <Button
                buttonSize="small"
                onClick={() => {
                  removeToast(toastID, "bottomLeft");
                  nav(
                    `/?snapEntryRunId=${completeMessage.instrumentRunDto.id}`
                  );
                }}
              >
                {t("resultsEntry.snap.timerToast.link")}
              </Button>
            </ToastButtonContent>
          </ToastContentRoot>
        ),
      });
    },
    [addToast, formatName, nav, removeToast, t]
  );

  useEventListener(EventIds.InstrumentRunTimerComplete, handleCompleteMessage);
}

/**
 * Unfortunately, IVLS today relies on the run status change -> TIMER_COMPLETE
 * to kick off beeping for SNAP timers, which happens X seconds before the
 * InstrumentRunTimerCompleteDto message is sent (where X is configurable in the
 * SNAP settings page)
 *
 * This hook monitors all running SNAP runs and tracks any runs that change to
 * TIMER_COMPLETE. Once that status change occurs, it starts beeping.
 *
 * Ideally, IVLS would send us a push message to let us know when we should start
 * beeping, but this will have to work for now.
 */
export function useSnapTimerBeeper() {
  const { startBeeping, stopBeeping } = useSystemBeep();

  // No need to query the data if timer functionality is disabled
  const { data: snapTimerEnabled } = useGetSettingQuery(
    SettingTypeEnum.SNAP_ENABLETIMER,
    {
      selectFromResult: (res) => ({
        ...res,
        data: res.data === "true",
      }),
    }
  );
  // Get all the in process SNAP runs, map them to a string of
  //
  // {id}:{runStatus}/{id}:{runStatus}/...etc.
  //
  // This is done so that it's easier to only run the effect when a new SNAP
  // run is added or when the status of one changes
  const { data: runningSnaps } = useGetRunningLabRequestsQuery(
    snapTimerEnabled ? undefined : skipToken,
    {
      selectFromResult: (res) => ({
        ...res,
        data: res.data
          ?.flatMap((lr) => lr.instrumentRunDtos ?? [])
          .filter((ir) => ir.instrumentType === InstrumentType.SNAP)
          .map((ir) => `${ir.id}:${ir.status}`)
          .join("/"),
      }),
    }
  );

  // Track the previous value of SNAP run id -> statuses
  const previousRunningSnaps = usePrevious(runningSnaps);

  useEffect(() => {
    // Track whether there are any TIMER_COMPLETE runs, because if there aren't
    // we should ask to stop beeping (failsafe in case there's some way for the
    // run to be removed without opening the results entry panel)
    let completeSnapRunFound = false;
    if (runningSnaps != null) {
      const currentRunningSnaps = runningSnaps.split("/");

      for (const snapRun of currentRunningSnaps) {
        // If there's a run with status TIMER_COMPLETE
        if (snapRun.endsWith(InstrumentRunStatus.Timer_Complete)) {
          completeSnapRunFound = true;
          // Pull out the run ID and find the matching run/status entry from
          // the previous result
          const runId = snapRun.split(":")[0];
          const matchingRunStatus = previousRunningSnaps
            ?.split("/")
            .find((run) => run.startsWith(`${runId}:`))
            ?.split(":")?.[0];

          // If the status was not TIMER_COMPLETE previously, start beeping.
          if (matchingRunStatus !== InstrumentRunStatus.Timer_Complete) {
            startBeeping();
          }
        }
      }
    }
    if (!completeSnapRunFound) {
      stopBeeping();
    }
  }, [previousRunningSnaps, runningSnaps, startBeeping, stopBeeping]);
}

export const toastIdForSnapRunTimerComplete = (runId: number) =>
  `SNAP-timer-${runId}`;
