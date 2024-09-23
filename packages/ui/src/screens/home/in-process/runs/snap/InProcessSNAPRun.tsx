import { useCallback, useEffect, useMemo, useState } from "react";
import {
  RunAction,
  RunActionDefinition,
  RunActionPopover,
  RunActions,
} from "../../RunActionPopover";
import { useCancelRunMutation } from "../../../../../api/LabRequestsApi";
import {
  InstrumentRunStatus,
  InstrumentStatus,
  InstrumentType,
  RunningInstrumentRunDto,
  SettingTypeEnum,
} from "@viewpoint/api";
import { useGetSettingQuery } from "../../../../../api/SettingsApi";
import { useSearchParams } from "react-router-dom";
import {
  useResetSnapTimerMutation,
  useSaveSnapResultsMutation,
  useStartSnapTimerMutation,
} from "../../../../../api/ManualEntryRunApi";
import { SNAPResultsEntrySlideOut } from "../../../../../components/result-entry/snap/SNAPResultsEntrySlideOut";
import { useSystemBeep } from "../../../../../context/AppStateContext";
import { useRemoveToast } from "@viewpoint/spot-react/src";
import { toastIdForSnapRunTimerComplete } from "../../../../../utils/hooks/push/RunTimerHooks";
import {
  CancelRunModal,
  InProcessRunDisplay,
  InProcessRunProps,
} from "../../InProcessComponents";

const READY_FOR_RESULTS_STATUSES: InstrumentRunStatus[] = [
  InstrumentRunStatus.Running,
  InstrumentRunStatus.Timer_Complete,
];

const RESETTABLE_STATUSES: InstrumentRunStatus[] = [
  InstrumentRunStatus.Running,
  InstrumentRunStatus.Timer_Complete,
];

/**
 * Custom In Process Run component for Manual SNAP runs
 *
 * @param props
 * @constructor
 */
export function InProcessSNAPRun(props: InProcessRunProps) {
  const [activeRunAction, setActiveRunAction] = useState<RunAction>();
  const [runActionsShown, setRunActionsShown] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();

  const [slideOutClosing, setSlideOutClosing] = useState(false);

  const [startSnapTimer] = useStartSnapTimerMutation();
  const [resetTimer] = useResetSnapTimerMutation();
  const [cancelRun] = useCancelRunMutation();
  const [saveResults] = useSaveSnapResultsMutation();
  const { stopBeeping } = useSystemBeep();
  const { removeToast } = useRemoveToast();

  const { data: snapTimerEnabled } = useGetSettingQuery(
    SettingTypeEnum.SNAP_ENABLETIMER,
    {
      selectFromResult: (res) => ({
        ...res,
        data: res.data === "true",
      }),
    }
  );

  const runActions: RunActionDefinition[] = useMemo(
    () =>
      snapTimerEnabled && props.run.status !== InstrumentRunStatus.Running
        ? [
            {
              action: RunActions.StartTimer,
              iconName: "play",
            },
            {
              action: RunActions.EnterResults,
              iconName: "add",
            },
            {
              action: RunActions.Cancel,
              iconName: "cancel",
            },
          ]
        : [],
    [props.run.status, snapTimerEnabled]
  );

  const handleAction = useCallback(
    (action: RunAction) => {
      setActiveRunAction(action);
      if (action === RunActions.StartTimer) {
        startSnapTimer(props.run.id);
      } else if (action === RunActions.EnterResults) {
        removeToast(toastIdForSnapRunTimerComplete(props.run.id), "bottomLeft");
        stopBeeping();
      }
    },
    [props.run.id, removeToast, startSnapTimer, stopBeeping]
  );

  const handleRunClicked = useCallback(() => {
    if (
      !snapTimerEnabled ||
      READY_FOR_RESULTS_STATUSES.includes(props.run.status)
    ) {
      handleAction(RunActions.EnterResults);
    } else {
      setRunActionsShown((shown) => !shown);
    }
  }, [handleAction, props.run.status, snapTimerEnabled]);

  const snapEntryRunId = searchParams.get("snapEntryRunId");
  useEffect(() => {
    if (snapEntryRunId != null && `${props.run.id}` === snapEntryRunId) {
      setSearchParams({});
      // Open the SNAP manual entry page on mount if the search param is present,
      // since user can be brought to SNAP results entry via toast message on any screen
      handleAction(RunActions.EnterResults);
    }
  }, [props.run.id, handleAction, setSearchParams, snapEntryRunId]);

  return (
    <RunActionPopover
      open={runActionsShown}
      intersectionRootRef={props.intersectionRootRef}
      className="cancel-popover"
      availableActions={runActions}
      onClose={() => setRunActionsShown(false)}
      onAction={(action) => {
        setRunActionsShown(false);
        handleAction(action);
      }}
    >
      <InProcessRunDisplay
        onClicked={handleRunClicked}
        active={runActionsShown || !!props.active}
        instrumentType={props.run.instrumentType}
        instrumentStatus={props.instrumentStatus ?? InstrumentStatus.Unknown}
        instrumentName={props.instrumentName}
        timeRemaining={
          snapTimerEnabled ? getTimeRemaining(props.run) : undefined
        }
        progress={props.run.progress}
        instrumentRunStatus={props.run.status}
        blinking={props.run.status === InstrumentRunStatus.Timer_Complete}
      />

      {activeRunAction === RunActions.Cancel && (
        <CancelRunModal
          instrumentName={props.instrumentName}
          onClose={() => setActiveRunAction(undefined)}
          onConfirm={() => {
            cancelRun(props.run.id);
            setActiveRunAction(undefined);
          }}
        />
      )}

      {props.run.snapDeviceDto != null && (
        <SNAPResultsEntrySlideOut
          open={activeRunAction === RunActions.EnterResults}
          closing={slideOutClosing}
          instrumentType={InstrumentType.SNAP}
          onClose={() => {
            setSlideOutClosing(false);
            setActiveRunAction(undefined);
          }}
          onCloseRequested={() => setSlideOutClosing(true)}
          selectedSnapDevice={props.run.snapDeviceDto}
          onCancelRun={() => {
            cancelRun(props.run.id);
            setSlideOutClosing(true);
          }}
          onSaveResults={(results) => {
            saveResults({
              instrumentRunId: props.run.id,
              results,
            });
            setSlideOutClosing(true);
          }}
          onResetTimer={() => {
            resetTimer(props.run.id);
            setSlideOutClosing(true);
          }}
          resetTimerDisabled={
            !RESETTABLE_STATUSES.includes(props.run.status) ||
            props.run.timeRemaining == null
          }
        />
      )}
    </RunActionPopover>
  );
}

function getTimeRemaining(run: RunningInstrumentRunDto) {
  if (run.status === InstrumentRunStatus.Timer_Complete) {
    return run.timeRemaining ?? 0;
  } else if (run.status === InstrumentRunStatus.Running) {
    return (
      run.timeRemaining ?? toMilliseconds(run.snapDeviceDto?.snapDeviceTestTime)
    );
  }
  return toMilliseconds(run.snapDeviceDto?.snapDeviceTestTime);
}

function toMilliseconds(timeSeconds?: number) {
  return timeSeconds == null ? undefined : timeSeconds * 1000;
}
