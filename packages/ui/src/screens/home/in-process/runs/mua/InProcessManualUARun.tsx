import { useState } from "react";
import { InstrumentStatus } from "@viewpoint/api";
import { ManualUAResultsEntrySlideOut } from "../../../../../components/result-entry/manual-ua/ManualUAResultsEntrySlideOut";
import {
  InProcessRunDisplay,
  InProcessRunProps,
} from "../../InProcessComponents";

/**
 * Custom In Process Run component for Manual UA runs
 *
 * @param props
 * @constructor
 */
export function InProcessManualUARun(props: InProcessRunProps) {
  const [manualEntryOpen, setManualEntryOpen] = useState(false);

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
        <ManualUAResultsEntrySlideOut
          runId={props.run.id}
          labRequestId={props.labRequest.id}
          open={true}
          onClose={() => setManualEntryOpen(false)}
        />
      )}
    </>
  );
}
