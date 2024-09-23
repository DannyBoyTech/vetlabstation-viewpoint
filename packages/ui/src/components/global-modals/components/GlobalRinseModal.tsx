import { useCallback, useRef } from "react";
import { RinseModal, RinseModalProps } from "../../pdx-rinse/RinseModal";
import { MaybeWithId, useGlobalModals, WithId } from "../GlobalModals";
import { useEventListener } from "../../../context/EventSourceContext";
import {
  DetailedInstrumentStatusEvent,
  EventIds,
  HealthCode,
  InstrumentProgressEvent,
  InstrumentWaitingEvent,
} from "@viewpoint/api";
import { useLocation, useNavigate } from "react-router-dom";

type AddRinseModalProps = MaybeWithId<RinseModalProps>;

function GlobalRinseModal(props: WithId<RinseModalProps>) {
  const { removeModal } = useGlobalModals();

  useRinseModalRemoveListener(props.instrumentId, props.id);

  const callThenRemoveModal = useCallback(
    (fn?: () => void) => {
      fn?.();
      removeModal(props.id);
    },
    [removeModal, props.id]
  );

  return (
    <RinseModal
      {...props}
      onCancelRinse={() => callThenRemoveModal(props.onCancelRinse)}
    />
  );
}

/**
 * Provides hooks that implement scope-wide rinse modals.
 *
 * @returns hooks that enable with scope-wide rinse modals
 */
function useRinseModal() {
  const { addModal, removeModal } = useGlobalModals();

  const addRinseModal = useCallback(
    (confirmModalProps: MaybeWithId<RinseModalProps>) => {
      const id = confirmModalProps.id ?? crypto.randomUUID();
      // Since these functions are ultimately provided as return values from hooks, always make sure to use
      // the callback version of setState functions to ensure we don't use a stale value
      addModal({
        id,
        content: <GlobalRinseModal id={id} {...confirmModalProps} />,
      });

      return id;
    },
    [addModal]
  );

  return { addRinseModal, removeRinseModal: removeModal };
}

//this is not that unique, but probably works given that there are unlikely to
//be two different types of rinse going on per instrument.
const rinseModalId = (instrumentId: number) => `rinse-${instrumentId}`;

/**
 * Registers an event listener that will display a global
 * 'rinse modal' when an InstrumentWaiting event occurs.
 */
function useRinseModalAddListener() {
  const { addRinseModal } = useRinseModal();

  useEventListener(EventIds.InstrumentWaiting, (evt: MessageEvent) => {
    const waitEvent: InstrumentWaitingEvent = JSON.parse(evt.data);

    const instrumentId = waitEvent.instrument.id;
    const instrumentType = waitEvent.instrument.instrumentType;
    const rinseType = waitEvent.waitingReason;

    addRinseModal({
      id: rinseModalId(instrumentId),
      instrumentId,
      instrumentType,
      rinseType,
    });
  });
}

/**
 * Registers an event listener that will destroy a single 'rinse modal' (determined by id) when an
 * 'InstrumentProgressEvent' occurs for a particular instrument (determined by instrumentId).
 *
 * It also will navigate up (to the instrument page) if the current location is the
 * maintenance screen for the instrument.
 */
function useRinseModalRemoveListener(
  instrumentId: number,
  rinseModalId: string
) {
  const { removeRinseModal } = useRinseModal();
  const nav = useNavigate();
  const location = useLocation();

  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const handleRemove = useCallback(() => {
    removeRinseModal(rinseModalId);
    //nav up to the instrument page if we are on the instrument's maintenance page
    if (
      location.pathname.endsWith(`/instruments/${instrumentId}/maintenance`)
    ) {
      nav("../");
    } else if (
      location.pathname.endsWith(`/instruments/${instrumentId}/diagnostics`)
    ) {
      nav("../", { relative: "path" });
    }
  }, [instrumentId, location.pathname, nav, removeRinseModal, rinseModalId]);

  useEventListener(EventIds.InstrumentProgress, (evt: MessageEvent) => {
    const progressEvent: InstrumentProgressEvent = JSON.parse(evt.data);

    if (progressEvent.instrumentId === instrumentId) {
      if (timeoutRef.current != null) {
        clearTimeout(timeoutRef.current);
      }
      handleRemove();
    }
  });

  useEventListener(
    EventIds.DetailedInstrumentStatusUpdated,
    (evt: MessageEvent) => {
      const statusEvent: DetailedInstrumentStatusEvent = JSON.parse(evt.data);

      if (statusEvent.instrument.id === instrumentId) {
        // When user presses start, schedule modal dismissal for 15 seconds
        if (
          statusEvent.status === HealthCode.RUNNING &&
          timeoutRef.current == null
        ) {
          timeoutRef.current = setTimeout(handleRemove, 15000);
          // If dismissal is scheduled but the instrument changes state, cancel dismissal
          // Not entirely sure what scenario this would represent, but it is parity
          // with the FX client implementation
        } else if (
          statusEvent.status !== HealthCode.RUNNING &&
          timeoutRef.current != null
        ) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = undefined;
        }
      }
    }
  );
}

export type { AddRinseModalProps };
export { useRinseModal, useRinseModalAddListener, useRinseModalRemoveListener };
