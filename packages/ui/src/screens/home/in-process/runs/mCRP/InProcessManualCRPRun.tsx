import { useState } from "react";
import { InstrumentStatus } from "@viewpoint/api";
import {
  InProcessRunDisplay,
  InProcessRunProps,
} from "../../InProcessComponents";
import { ManualCRPResultsEntrySlideOut } from "../../../../../components/result-entry/manual-crp/ManualCRPResultsEntrySlideOut";
import { useCancelRunMutation } from "../../../../../api/LabRequestsApi";
import { useSaveCrpResultsMutation } from "../../../../../api/ManualEntryRunApi";

/**
 * Custom In Process Run component for Manual UA runs
 *
 * @param props
 * @constructor
 */
export function InProcessManualCRPRun(props: InProcessRunProps) {
  const [manualEntryOpen, setManualEntryOpen] = useState(false);
  const [panelClosing, setPanelClosing] = useState(false);

  const [cancelRun, cancelRunStatus] = useCancelRunMutation();
  const [saveRun, saveRunStatus] = useSaveCrpResultsMutation();

  return (
    <>
      <InProcessRunDisplay
        onClicked={() => setManualEntryOpen(true)}
        active={manualEntryOpen || !!props.active}
        instrumentType={props.run.instrumentType}
        instrumentStatus={props.instrumentStatus ?? InstrumentStatus.Unknown}
        instrumentName={props.instrumentName}
        instrumentRunStatus={props.run.status}
      />

      {manualEntryOpen && (
        <ManualCRPResultsEntrySlideOut
          open={manualEntryOpen}
          closing={panelClosing}
          loading={saveRunStatus.isLoading || cancelRunStatus.isLoading}
          onClose={() => {
            setPanelClosing(false);
            setManualEntryOpen(false);
          }}
          onCloseRequested={() => setPanelClosing(true)}
          onCancelRun={async () => {
            await cancelRun(props.run.id);
            setPanelClosing(true);
          }}
          onSaveResults={async (results) => {
            await saveRun({ instrumentRunId: props.run.id, results });
            setPanelClosing(true);
          }}
        />
      )}
    </>
  );
}
