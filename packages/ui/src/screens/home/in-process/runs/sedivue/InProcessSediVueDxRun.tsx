import { useCallback, useMemo, useState } from "react";
import {
  RunAction,
  RunActionDefinition,
  RunActionPopover,
  RunActions,
} from "../../RunActionPopover";
import { useCancelRunMutation } from "../../../../../api/LabRequestsApi";
import { useStartRunMutation } from "../../../../../api/InstrumentRunApi";
import { InstrumentStatus, MaintenanceProcedure } from "@viewpoint/api";
import { useGetDetailedInstrumentStatusQuery } from "../../../../../api/InstrumentApi";
import { useRequestSediVueProcedureMutation } from "../../../../../api/SediVueApi";
import {
  AdditionalRunInfo,
  CancelRunModal,
  hasRunConfigPopoverInfo,
  InProcessRunDisplay,
  InProcessRunProps,
  RunConfigPopoverRunDetails,
} from "../../InProcessComponents";

const WAITING_FOR_SAMPLE = "WAITING_FOR_SAMPLE";

export function InProcessSediVueDxRun(props: InProcessRunProps) {
  const [activeRunAction, setActiveRunAction] = useState<RunAction>();
  const [runActionsShown, setRunActionsShown] = useState(false);

  const [cancelRun] = useCancelRunMutation();
  const [startRun] = useStartRunMutation();
  const [requestSvdxProcedure] = useRequestSediVueProcedureMutation();

  // Only SVDx needs the detailed status -- don't bother making the request for other instrument types
  const { data: detailedStatus } = useGetDetailedInstrumentStatusQuery(
    props.run.instrumentId
  );

  const runActions: RunActionDefinition[] = useMemo(
    () => [
      {
        action: RunActions.Start,
        disabled: !props.workRequestStatus?.runStartable,
        iconName: "play",
      },
      {
        action: RunActions.EjectCartridge,
        iconName: "export",
        disabled: detailedStatus?.detail !== WAITING_FOR_SAMPLE,
      },
      {
        action: RunActions.Cancel,
        iconName: "cancel",
      },
    ],
    [detailedStatus?.detail, props.workRequestStatus?.runStartable]
  );

  const handleAction = useCallback(
    (action: RunAction) => {
      setActiveRunAction(action);
      switch (action) {
        case RunActions.Start:
          startRun(props.run.id);
          break;
        case RunActions.EjectCartridge:
          requestSvdxProcedure({
            instrumentId: props.run.instrumentId,
            procedure: MaintenanceProcedure.DROP_CUVETTE,
          });
          break;
      }
    },
    [props.run.id, props.run.instrumentId, requestSvdxProcedure, startRun]
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
        onClicked={() => setRunActionsShown(!runActionsShown)}
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
