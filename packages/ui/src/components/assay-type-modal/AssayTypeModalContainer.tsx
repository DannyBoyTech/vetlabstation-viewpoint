import {
  AssayTypeIdentificationRequest,
  AssayTypeIdentificationRequestEvent,
  EventIds,
  UserInputOption,
  UserInputRequest,
  UserInputRequestTypes,
} from "@viewpoint/api";
import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { skipToken } from "@reduxjs/toolkit/query";
import { useGetUserInputRequestsQuery } from "../../api/InstrumentRunApi";
import { useUpdateResultAssayTypeMutation } from "../../api/ResultsApi";
import { useEventListener } from "../../context/EventSourceContext";
import { dequeue, enqueue } from "../../redux/slices/user-input-requests";
import { selectNextUserInputRequest } from "../../redux/store";
import { useAppDispatch } from "../../utils/hooks/hooks";
import { AssayTypeModal, AssayTypeModalOption } from "./AssayTypeModal";

function toAssayTypeModalOption(
  userInputOptions: UserInputOption
): AssayTypeModalOption {
  const { key, id } = userInputOptions;
  return {
    key,
    value: id.toString(),
  };
}

interface AssayTypeModalContainerProps {
  openDelayMillis?: number;
}

const AssayTypeModalContainer = ({
  openDelayMillis,
}: AssayTypeModalContainerProps) => {
  const dispatch = useAppDispatch();
  const instrumentRunId = useSelector(selectNextUserInputRequest);

  const { currentData, isFetching, isSuccess } = useGetUserInputRequestsQuery(
    instrumentRunId ?? skipToken
  );
  const [updateResultAssayType] = useUpdateResultAssayTypeMutation();

  const [inputReq, setInputReq] = useState<UserInputRequest | undefined>();
  const [confirmed, setConfirmed] = useState<number | undefined>();

  //stable userInputRequest list for current instrumentRunId
  const userInputRequests = isFetching
    ? undefined
    : isSuccess
    ? currentData
    : null;

  const listener = useCallback(
    (ev: MessageEvent) => {
      const assayIdEvent: AssayTypeIdentificationRequestEvent = JSON.parse(
        ev.data as string
      );
      const instrumentRunId = assayIdEvent.instrumentRunId;
      if (instrumentRunId) {
        dispatch(enqueue(instrumentRunId));
      }
    },
    [dispatch]
  );

  useEventListener(EventIds.AssayTypeIdentificationRequest, listener);

  // open the modal if it isn't already, delay if one was specified via props
  useEffect(() => {
    if (userInputRequests?.length === 0) {
      if (!isFetching) {
        setConfirmed(instrumentRunId);
      }
    }

    const firstInputReq = userInputRequests?.[0];
    if (firstInputReq) {
      if (openDelayMillis) {
        setTimeout(() => setInputReq(firstInputReq), openDelayMillis);
      } else {
        setInputReq(firstInputReq);
      }
    } else {
      setInputReq(undefined);
    }
  }, [userInputRequests, isFetching, instrumentRunId, openDelayMillis]);

  useEffect(() => {
    if (confirmed) {
      setInputReq(undefined);
      dispatch(dequeue(confirmed));
      setConfirmed(undefined);
    }
  }, [confirmed, dispatch]);

  // handle the 'later' option if the user chooses it
  const handleClose = useCallback(() => {
    setConfirmed(instrumentRunId);
  }, [instrumentRunId]);

  //handle the 'done' option where user selects an assay
  const handleConfirm = useCallback(
    (userResponse: string) => {
      const updateArgs = {
        instrumentRunId: inputReq?.instrumentRunId ?? -1,
        instrumentResultId: inputReq?.instrumentResultId ?? -1,
        assayType: Number(userResponse),
      };
      updateResultAssayType(updateArgs);

      //you'd think we confirm here, but there can potentially be multiple
      //results per run, so instead we rely on cache invalidation to cause
      //refetch of userInputRequests via rtk query, which causes rerender.
      //
      //the real confirm happens once the api returns zero userInputRequests
      //for the run.
    },
    [inputReq, updateResultAssayType, userInputRequests]
  );

  if (inputReq) {
    if (
      inputReq.type === UserInputRequestTypes.AssayTypeIdentificationRequest
    ) {
      const assayReq = inputReq as AssayTypeIdentificationRequest;
      return (
        <AssayTypeModal
          categoryKey={assayReq.categoryKey ?? ""}
          onClose={handleClose}
          onConfirm={handleConfirm}
          open={!!inputReq}
          options={assayReq.options?.map(toAssayTypeModalOption) ?? []}
          patientName={assayReq.patientName ?? ""}
          speciesKey={assayReq.species?.key ?? ""}
        />
      );
    }
  }
  return <></>;
};

export { AssayTypeModalContainer };
