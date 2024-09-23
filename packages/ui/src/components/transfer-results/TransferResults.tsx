import { LabRequestDto } from "@viewpoint/api";
import { Button, Link, useToast } from "@viewpoint/spot-react";
import { skipToken } from "@reduxjs/toolkit/query";
import { useState, useCallback, useEffect, useMemo } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import {
  useGetDetailedLabRequestQuery,
  useGetRecordsForPatientQuery,
  useTransferMutation,
} from "../../api/LabRequestsApi";
import { TransferResultsConfirmModal } from "../transfer-results-confirm-modal/TransferResultsConfirmModal";
import {
  DefaultSuccessToastOptions,
  DefaultToastOptions,
  ToastButtonContent,
  ToastContentRoot,
  ToastText,
  ToastTextContentRoot,
} from "../../utils/toast/toast-defaults";
import { useFormatPersonalName } from "../../utils/hooks/LocalizationHooks";
import { trackResultTransferSuccess } from "../../analytics/nltx-events";

interface TransferResultsProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  labRequestId?: number;
  destPatientId?: number;
  destPatientName?: string;
  destClientFamilyName?: string;
}

interface LocationState {
  redirectTo?: string;
  redirectState: unknown;
}

/**
 * Container for results transfer IU and logic.
 */
const TransferResults = ({
  open,
  labRequestId,
  destPatientId,
  destPatientName,
  destClientFamilyName,
  ...props
}: TransferResultsProps) => {
  const nav = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();
  const { t } = useTranslation();
  const formatName = useFormatPersonalName();

  const { redirectTo, redirectState } = useMemo<LocationState>(
    () =>
      location.state != null
        ? (location.state as { redirectTo?: string; redirectState: unknown })
        : { redirectTo: undefined, redirectState: undefined },
    [location.state]
  );

  useEffect(() => {
    if (redirectTo) {
      nav(redirectTo, { replace: true, state: redirectState });
    }
  }, [redirectTo, redirectState, nav]);

  const { data: labRequest }: { data?: LabRequestDto | undefined } =
    useGetDetailedLabRequestQuery(
      labRequestId ? { labRequestId: Number(labRequestId) } : skipToken
    );

  const [transfer] = useTransferMutation();
  const [transferCompleted, setTransferCompleted] = useState(false);

  // Fetch patient records to determine where to redirect on transfer
  //
  // * If the source patient has any remaining records post transfer, go to the
  // latest (first in list due to API sort).
  //
  // * If source patient has no remaining records after transfer, nav to the
  // labrequest we just transferred
  const {
    currentData: sourcePatientRecords,
    isFetching: isFetchingSourcePatientRecords,
  } = useGetRecordsForPatientQuery(labRequest?.patientDto.id ?? skipToken);

  useEffect(() => {
    if (transferCompleted && !isFetchingSourcePatientRecords) {
      if (sourcePatientRecords && sourcePatientRecords.length > 0) {
        nav("", {
          state: { redirectTo: "/", redirectState: { activeTab: "complete" } },
          replace: true,
        });
        nav(`/labRequest/${sourcePatientRecords[0].labRequestId}`);
      } else {
        nav("", {
          state: { redirectTo: "/", redirectState: { activeTab: "complete" } },
          replace: true,
        });
        nav(`/labRequest/${labRequestId}`);
      }
    }
  }, [transferCompleted, isFetchingSourcePatientRecords, sourcePatientRecords]);

  const handleTransferConfirm = useCallback(async () => {
    try {
      if (labRequest?.id == null || destPatientId == null) {
        throw new Error(
          `labRequestId and patientId are required for result transfer (labRequestId: ${labRequest?.id}, patientId: ${destPatientId}`
        );
      }

      await transfer({
        labRequestId: labRequest.id,
        patientId: destPatientId,
      }).unwrap();

      trackResultTransferSuccess({ labReqId: labRequest.id, destPatientId });

      setTransferCompleted(true); // trigger re-fetch of patient records now that we've adjusted their histories

      props.onConfirm();

      addToast({
        ...DefaultSuccessToastOptions,
        content: (
          <ToastContentRoot onClick={() => nav(`/labRequest/${labRequestId}`)}>
            <ToastTextContentRoot>
              <ToastText level="paragraph" bold $maxLines={1}>
                {formatName({
                  firstName: destPatientName,
                  lastName: destClientFamilyName,
                })}
              </ToastText>
              <ToastText level="paragraph" $maxLines={2}>
                {t("general.messages.transferResultsSuccess")}
              </ToastText>
            </ToastTextContentRoot>
          </ToastContentRoot>
        ),
      });
    } catch (e) {
      addToast({
        ...DefaultToastOptions,
        alertLevel: "danger",
        icon: "alert-notification",
        content: t("general.messages.somethingWentWrong"),
      });
    }
  }, [
    labRequest?.id,
    destPatientId,
    transfer,
    props,
    addToast,
    labRequestId,
    destPatientName,
    destClientFamilyName,
    t,
  ]);

  return (
    <TransferResultsConfirmModal
      open={open}
      onClose={props.onClose}
      onConfirm={handleTransferConfirm}
      labRequest={labRequest}
      destPatientName={destPatientName}
      destClientFamilyName={destClientFamilyName}
    />
  );
};

export type { TransferResultsProps };

export { TransferResults };
