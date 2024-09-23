import { ManualEntryTypeEnum } from "@viewpoint/api";
import { ManualUAResultEntry } from "./ManualUAResultEntry";
import { useState } from "react";
import { useCancelRunMutation } from "../../../api/LabRequestsApi";
import SpinnerOverlay from "../../overlay/SpinnerOverlay";
import { useGetManualAssaysQuery } from "../../../api/SpeciesApi";
import { skipToken } from "@reduxjs/toolkit/query";
import { useTranslation } from "react-i18next";
import { SlideOut, useOpenStateForSlideout } from "../../slideout/SlideOut";
import {
  ManualEntrySlideOutProps,
  Root,
  useInstrumentRunDataForManualEntry,
} from "../common-slideout-components";
import { CancelConfirmationModal } from "../../confirm-modal/CancelConfirmationModal";
import { convertManualUaResults } from "./manual-ua-result-utils";
import { CancelRunModal } from "../../../screens/home/in-process/InProcessComponents";

export const TestId = {
  SlideOut: "manual-entry-slideout",
  CloseConfirm: "manual-entry-close-confirm-modal",
  CancelRunConfirm: "manual-entry-cancel-run-confirm-modal",
};

interface ManualUAResultsEntrySlideOutProps
  extends Omit<ManualEntrySlideOutProps, "closing"> {
  runId: number;
  labRequestId: number;
}

export function ManualUAResultsEntrySlideOut(
  props: ManualUAResultsEntrySlideOutProps
) {
  const [confirmingCancelRun, setConfirmingCancelRun] = useState(false);
  const [confirmingClose, setConfirmingClose] = useState(false);
  const { t } = useTranslation();

  const [open, setOpen] = useOpenStateForSlideout(props.open);

  const {
    inProcessRun,
    detailedRun,
    detailedLabRequest,
    inProcessLabRequest,
    isLoading,
  } = useInstrumentRunDataForManualEntry({
    runId: props.runId,
    labRequestId: props.labRequestId,
  });

  const { data: availableAssays } = useGetManualAssaysQuery(
    (detailedLabRequest ?? inProcessLabRequest)?.patientDto?.speciesDto?.id ??
      skipToken
  );

  const [cancelRun] = useCancelRunMutation();

  // For mUA -- if there's an "editable run" then we need to use that. If not, use the detailed run, and finally fall back to the in process run
  const runToUse = detailedRun?.editableRun ?? detailedRun ?? inProcessRun;

  const handleCancelRun = async () => {
    if (runToUse != null) {
      try {
        cancelRun(runToUse?.id);
        setOpen(false);
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <SlideOut
      side={"right"}
      open={open}
      onTapShade={() => setConfirmingClose(true)}
      onCloseTransitionEnd={() => props.onClose()}
      data-testid={TestId.SlideOut}
    >
      <Root>
        {isLoading || runToUse == null ? (
          <SpinnerOverlay />
        ) : (
          <ManualUAResultEntry
            editableRunId={runToUse.id}
            targetRunId={detailedRun?.id}
            onDone={() => setOpen(false)}
            onClose={() => setConfirmingClose(true)}
            onCancelRun={() => setConfirmingCancelRun(true)}
            availableAssays={availableAssays ?? []}
            skipChemistries={
              runToUse.manualEntryType === ManualEntryTypeEnum.ONLY
            }
            initialResults={
              !!detailedRun ? convertManualUaResults(detailedRun) : undefined
            }
          />
        )}
      </Root>

      {confirmingCancelRun && runToUse != null && (
        <CancelRunModal
          data-testid={TestId.CancelRunConfirm}
          onConfirm={async () => {
            setConfirmingCancelRun(false);
            handleCancelRun().catch((err) => console.error(err));
          }}
          onClose={() => setConfirmingCancelRun(false)}
          instrumentName={t(`instruments.names.${runToUse.instrumentType}`)}
        />
      )}

      {confirmingClose && (
        <CancelConfirmationModal
          onConfirm={() => {
            setConfirmingClose(false);
            setOpen(false);
          }}
          open={confirmingClose}
          onClose={() => setConfirmingClose(false)}
          data-testid={TestId.CloseConfirm}
        />
      )}
    </SlideOut>
  );
}
