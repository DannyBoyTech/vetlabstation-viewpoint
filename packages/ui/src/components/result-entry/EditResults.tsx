import { useState } from "react";
import {
  InstrumentRunDto,
  InstrumentType,
  ManualCrpResultDto,
} from "@viewpoint/api";
import { ManualUAResultsEntrySlideOut } from "./manual-ua/ManualUAResultsEntrySlideOut";
import { SNAPResultsEntrySlideOut } from "./snap/SNAPResultsEntrySlideOut";
import {
  useEditCrpResultsMutation,
  useEditSnapResultsMutation,
} from "../../api/ManualEntryRunApi";
import { getSnapResultFromRunResults } from "./snap/SNAPDefinitions";
import { ManualCRPResultsEntrySlideOut } from "./manual-crp/ManualCRPResultsEntrySlideOut";

interface EditResultsProps {
  selectedRun: InstrumentRunDto;
  labRequestId: number;
  onClose: () => void;
}

export function EditResults({ selectedRun, ...props }: EditResultsProps) {
  const [slideOutClosing, setSlideOutClosing] = useState(false);

  const [saveSnapEdits, snapSaveEditsStatus] = useEditSnapResultsMutation();
  const [saveCrpEdits, saveCrpEditsStatus] = useEditCrpResultsMutation();

  const isManualUa =
    selectedRun?.instrumentType === InstrumentType.ManualUA ||
    selectedRun?.editableRun?.instrumentType === InstrumentType.ManualUA;

  const isSnap =
    selectedRun?.snapDeviceDto != null &&
    (selectedRun.instrumentType === InstrumentType.SNAP ||
      selectedRun.instrumentType === InstrumentType.SNAPPro);

  const isManualCrp = selectedRun?.instrumentType === InstrumentType.ManualCRP;

  return (
    <>
      {isManualUa && (
        <ManualUAResultsEntrySlideOut
          open
          runId={selectedRun.id}
          labRequestId={props.labRequestId}
          onClose={props.onClose}
        />
      )}

      {isSnap && (
        <SNAPResultsEntrySlideOut
          open
          closing={slideOutClosing}
          onClose={() => {
            setSlideOutClosing(false);
            props.onClose();
          }}
          onCloseRequested={() => setSlideOutClosing(true)}
          loading={snapSaveEditsStatus.isLoading}
          onSaveResults={async (results) => {
            await saveSnapEdits({
              instrumentRunId: selectedRun.id,
              results,
            });
            setSlideOutClosing(true);
          }}
          initialResult={{
            snapResultType: getSnapResultFromRunResults(selectedRun),
          }}
          editHistory={selectedRun.runEditHistories}
          instrumentType={selectedRun.instrumentType as InstrumentType.SNAP}
          selectedSnapDevice={selectedRun.snapDeviceDto!}
        />
      )}

      {isManualCrp && (
        <ManualCRPResultsEntrySlideOut
          open
          closing={slideOutClosing}
          onClose={() => {
            setSlideOutClosing(false);
            props.onClose();
          }}
          onCloseRequested={() => setSlideOutClosing(true)}
          loading={saveCrpEditsStatus.isLoading}
          initialResults={getMCRPResultValue(selectedRun)}
          onSaveResults={async (results) => {
            await saveCrpEdits({
              instrumentRunId: selectedRun.id,
              results,
            });
            setSlideOutClosing(true);
          }}
        />
      )}
    </>
  );
}

function getMCRPResultValue(
  run: InstrumentRunDto
): ManualCrpResultDto | undefined {
  const result = run.instrumentResultDtos.find((ir) => ir.assay === "mCRP");
  if (result != null && result.resultValue != null) {
    return {
      resultValue: result.resultValue,
      qualifierType: result.qualifierType,
    };
  }
}
