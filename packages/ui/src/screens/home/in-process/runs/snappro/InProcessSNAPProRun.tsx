import { useMemo, useState } from "react";
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
  SnapDeviceDto,
} from "@viewpoint/api";
import { SelectSnapTestModal } from "./SelectSnapTestModal";
import { SNAPResultsEntrySlideOut } from "../../../../../components/result-entry/snap/SNAPResultsEntrySlideOut";
import { useSaveSnapResultsAndCreateRunMutation } from "../../../../../api/ManualEntryRunApi";
import {
  AdditionalRunInfo,
  CancelRunModal,
  InProcessRunDisplay,
  InProcessRunProps,
} from "../../InProcessComponents";

/**
 * Custom In Process Run component for SNAP Pro runs
 *
 * @param props
 * @constructor
 */
export function InProcessSNAPProRun(props: InProcessRunProps) {
  const [activeRunAction, setActiveRunAction] = useState<RunAction>();
  const [runActionsShown, setRunActionsShown] = useState(false);
  const [selectedSnapDevice, setSelectedSnapDevice] = useState<SnapDeviceDto>();

  const [slideOutClosing, setSlideOutClosing] = useState(false);

  const [cancelRun] = useCancelRunMutation();
  const [saveResultsAndCreateRun] = useSaveSnapResultsAndCreateRunMutation();

  const runActions: RunActionDefinition[] = useMemo(
    () => [
      {
        action: RunActions.SelectSnapTest,
        iconName: "add",
        disabled: !props.workRequestStatus?.runStartable,
      },
      {
        action: RunActions.Cancel,
        iconName: "cancel",
      },
    ],
    [props.workRequestStatus?.runStartable]
  );

  return (
    <RunActionPopover
      open={runActionsShown}
      intersectionRootRef={props.intersectionRootRef}
      className="cancel-popover"
      availableActions={runActions}
      onClose={() => setRunActionsShown(false)}
      onAction={(action) => {
        setActiveRunAction(action);
        setRunActionsShown(false);
      }}
    >
      <InProcessRunDisplay
        onClicked={() => setRunActionsShown(!runActionsShown)}
        active={runActionsShown || !!props.active}
        instrumentType={props.run.instrumentType}
        instrumentStatus={
          // Override instrument status when run is in progress to show
          // yellow icon -- SNAP Pro instrument status does not change to busy
          // when a run is in progress as it reports the "parent" SNAP Pro status
          props.run.status === InstrumentRunStatus.Running
            ? InstrumentStatus.Busy
            : props.instrumentStatus ?? InstrumentStatus.Unknown
        }
        instrumentName={props.instrumentName}
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
      {activeRunAction === RunActions.SelectSnapTest && (
        <SelectSnapTestModal
          open
          onClose={() => setActiveRunAction(undefined)}
          onConfirm={(device) => {
            setSelectedSnapDevice(device);
            setActiveRunAction(RunActions.EnterResults);
          }}
          speciesId={props.labRequest.patientDto.speciesDto.id}
        />
      )}
      {selectedSnapDevice != null && (
        <SNAPResultsEntrySlideOut
          open={activeRunAction === RunActions.EnterResults}
          closing={slideOutClosing}
          onCloseRequested={() => setSlideOutClosing(true)}
          onClose={() => {
            setActiveRunAction(undefined);
            setSlideOutClosing(false);
          }}
          instrumentType={InstrumentType.SNAPPro}
          selectedSnapDevice={selectedSnapDevice}
          onCancelRun={() => {
            cancelRun(props.run.id);
            setSlideOutClosing(true);
          }}
          onSaveResults={(results) => {
            cancelRun(props.run.id);
            saveResultsAndCreateRun({
              labRequestId: props.labRequest.id,
              snapDeviceId: selectedSnapDevice!.snapDeviceId,
              results,
            });
            setSlideOutClosing(true);
          }}
        />
      )}
    </RunActionPopover>
  );
}
