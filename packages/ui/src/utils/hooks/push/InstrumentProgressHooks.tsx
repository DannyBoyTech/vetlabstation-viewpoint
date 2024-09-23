import { useAppDispatch } from "../hooks";
import { useEventListener } from "../../../context/EventSourceContext";
import { useCallback } from "react";
import { EventIds, ProgressDto } from "@viewpoint/api";
import { updateProgress } from "../../../redux/slices/instrument-progress";

export function useInstrumentProgressStateCapture() {
  const dispatch = useAppDispatch();

  const callback = useCallback(
    (msg: MessageEvent) => {
      try {
        const progressEvent: ProgressDto = JSON.parse(msg.data);
        dispatch(updateProgress(progressEvent));
      } catch (err) {
        console.error("Error handling instrument progress message", err);
      }
    },
    [dispatch]
  );
  useEventListener(EventIds.InstrumentProgress, callback);
  useEventListener(EventIds.InstrumentRunProgress, callback);
}
