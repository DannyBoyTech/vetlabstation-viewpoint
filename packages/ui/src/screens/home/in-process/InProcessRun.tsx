import {
  InstrumentRunStatus,
  InstrumentStatus,
  InstrumentType,
} from "@viewpoint/api";
import {
  RunAction,
  RunActionDefinition,
  RunActionPopover,
  RunActions,
} from "./RunActionPopover";
import { useCallback, useMemo, useState } from "react";
import { useCancelRunMutation } from "../../../api/LabRequestsApi";
import { useStartRunMutation } from "../../../api/InstrumentRunApi";
import { InProcessSNAPRun } from "./runs/snap/InProcessSNAPRun";
import { InProcessSediVueDxRun } from "./runs/sedivue/InProcessSediVueDxRun";
import { useAppDispatch } from "../../../utils/hooks/hooks";
import { enqueue as enqueueUserInputEntry } from "../../../redux/slices/user-input-requests";
import { InProcessSNAPProRun } from "./runs/snappro/InProcessSNAPProRun";
import { InProcessManualUARun } from "./runs/mua/InProcessManualUARun";
import {
  AdditionalRunInfo,
  CancelRunModal,
  hasRunConfigPopoverInfo,
  InProcessRunDisplay,
  InProcessRunProps,
  RunConfigPopoverRunDetails,
} from "./InProcessComponents";
import { InProcessManualCRPRun } from "./runs/mCRP/InProcessManualCRPRun";

export function InProcessRun(props: InProcessRunProps) {
  switch (props.run.instrumentType) {
    case InstrumentType.SNAP:
      return <InProcessSNAPRun {...props} />;
    case InstrumentType.SNAPPro:
      return <InProcessSNAPProRun {...props} />;
    case InstrumentType.SediVueDx:
      return <InProcessSediVueDxRun {...props} />;
    case InstrumentType.ManualUA:
      return <InProcessManualUARun {...props} />;
    case InstrumentType.ManualCRP:
      return <InProcessManualCRPRun {...props} />;
    default:
      return <DefaultInProcessRun {...props} />;
  }
}

/**
 * Default In Process Run item shown in the InProcessCard.
 *
 * @param props
 * @constructor
 */
export function DefaultInProcessRun(props: InProcessRunProps) {
  const [activeRunAction, setActiveRunAction] = useState<RunAction>();
  const [runActionsShown, setRunActionsShown] = useState(false);

  const [cancelRun] = useCancelRunMutation();
  const [startRun] = useStartRunMutation();
  const dispatch = useAppDispatch();

  const runActions: RunActionDefinition[] = useMemo(
    () => [
      {
        action: RunActions.Start,
        disabled: !props.workRequestStatus?.runStartable,
        iconName: "play",
      },
      {
        action: RunActions.Cancel,
        iconName: "cancel",
      },
    ],
    [props.workRequestStatus?.runStartable]
  );

  const handleRunClicked = () => {
    // This is technically only supported by CatOne/Dx I think, but it's so small
    // that creating an analyzer-specific version for it feels like overkill
    if (props.run.status === InstrumentRunStatus.Requires_User_Input) {
      handleAction(RunActions.AddDetails);
    } else {
      setRunActionsShown(!runActionsShown);
    }
  };

  const handleAction = useCallback(
    (action: RunAction) => {
      setActiveRunAction(action);
      switch (action) {
        case RunActions.Start:
          startRun(props.run.id);
          break;
        case RunActions.AddDetails:
          dispatch(enqueueUserInputEntry(props.run.id));
          break;
      }
    },
    [dispatch, props.run.id, startRun]
  );

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
      runDetails={
        hasRunConfigPopoverInfo(props.run) ? (
          <RunConfigPopoverRunDetails run={props.run} />
        ) : undefined
      }
    >
      <InProcessRunDisplay
        onClicked={handleRunClicked}
        active={runActionsShown || !!props.active}
        instrumentType={props.run.instrumentType}
        instrumentStatus={props.instrumentStatus ?? InstrumentStatus.Unknown}
        instrumentName={props.instrumentName}
        timeRemaining={props.run.timeRemaining}
        progress={props.run.progress}
        instrumentRunStatus={props.run.status}
        additionalRunInfo={
          <AdditionalRunInfo run={props.run} labRequest={props.labRequest} />
        }
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
    </RunActionPopover>
  );
}
