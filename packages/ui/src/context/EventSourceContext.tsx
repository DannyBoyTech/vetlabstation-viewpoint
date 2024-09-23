import React, {
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { usePrevious } from "../utils/hooks/hooks";
import {
  getEventSource,
  QueuingEventSource,
} from "../utils/events/QueuingEventSource";
import { useSystemReadyQuery } from "../api/SystemInfoApi";
import { skipToken } from "@reduxjs/toolkit/query";
import { EventIds, IvlsConnectionStatusEvent } from "@viewpoint/api";

interface EventSourceProviderProps {
  children?: ReactNode;
}

interface EventSourceContextValues {
  eventSource: QueuingEventSource;
  wasSystemReady: boolean;
  isSystemReady: boolean;
  shuttingDown: boolean;
}

const EventSourceContext = React.createContext<EventSourceContextValues>(null!);

const EventSourceProvider = (props: EventSourceProviderProps) => {
  // Connection from VP UI -> VP server is ready
  const [vpReady, setVpReady] = useState(false);
  // Connection from VP Server -> IVLS Server is ready
  const [ivlsReady, setIvlsReady] = useState(false);
  // Track if the backend(s) were at one point ever ready
  const [wasSystemReady, setWasSystemReady] = useState(false);
  // Whether the IVLS is getting ready to shut down -- only set to true when we
  // receive a ShutDownDto message from IVLS
  const [shuttingDown, setShuttingDown] = useState(false);
  // Internal event source
  const [eventSource] = useState<QueuingEventSource>(getEventSource("/events"));

  // Poll the IVLS backend via VP server until it's available
  const { data: systemReadyPoll } = useSystemReadyQuery(
    wasSystemReady ? skipToken : undefined,
    { pollingInterval: 1000 }
  );

  // Don't start the event source until IVLS Server is reachable
  useEffect(() => {
    if (systemReadyPoll) {
      // Wait for the IVLS backend to be available before connecting the event source
      eventSource.connect();
      setIvlsReady(true);
      setVpReady(true);
    }
  }, [systemReadyPoll, eventSource]);

  useEffect(() => {
    if (ivlsReady && vpReady) {
      setWasSystemReady(true);
    }
  }, [ivlsReady, vpReady]);

  const ivlsConnectionStatusChangedHandler = useCallback(
    (msg: MessageEvent) => {
      const data: IvlsConnectionStatusEvent = JSON.parse(msg.data);
      console.log(
        `Received IVLS connection status event: ${JSON.stringify(data)}`
      );
      setIvlsReady(data.connected);
      if (data.connected) {
        // Reset shutting down flag when we reconnect
        setShuttingDown(false);
      }
    },
    []
  );

  const openHandler = useCallback(() => {
    setVpReady(true);
  }, []);

  const errorHandler = useCallback((err: any) => {
    console.error(`Received event source error`, err);
    setVpReady(false);
  }, []);

  const shuttingDownHandler = useCallback(() => {
    console.log("IVLS is shutting down");
    setShuttingDown(true);
  }, []);

  useEffect(() => {
    // Listen for connection changes between VP Server -> IVLS Server
    eventSource.addEventListener(
      EventIds.IvlsConnectionStatus,
      ivlsConnectionStatusChangedHandler
    );

    // List for shut down events
    eventSource.addEventListener(
      EventIds.IvlsShuttingDown,
      shuttingDownHandler
    );

    // Track VP UI -> VP Server readiness via event source connection status
    eventSource.addEventListener("open", openHandler);
    eventSource.addEventListener("error", errorHandler);

    return () => {
      eventSource.removeEventListener(
        EventIds.IvlsConnectionStatus,
        ivlsConnectionStatusChangedHandler
      );
      eventSource.removeEventListener(
        EventIds.IvlsShuttingDown,
        shuttingDownHandler
      );
      eventSource.removeEventListener("open", openHandler);
      eventSource.removeEventListener("error", errorHandler);
    };
  }, [
    errorHandler,
    eventSource,
    ivlsConnectionStatusChangedHandler,
    openHandler,
    shuttingDownHandler,
  ]);

  return (
    <EventSourceContext.Provider
      value={{
        eventSource,
        wasSystemReady,
        shuttingDown,
        isSystemReady: vpReady && ivlsReady,
      }}
    >
      {props.children}
    </EventSourceContext.Provider>
  );
};

/**
 * Returns the QueuingEventSource instance used by the app
 * @return QueuingEventSource
 */
const useEventSource = () => {
  return useContext(EventSourceContext).eventSource;
};

/**
 * Subscribe a callback function to run when a given event is received via SSE
 * @param eventId
 * @param listener
 */
const useEventListener = (
  eventId: string,
  listener: (msg: MessageEvent) => void
) => {
  const eventSource = useEventSource();

  useEffect(() => {
    eventSource.addEventListener(eventId, listener);

    return () => {
      eventSource.removeEventListener(eventId, listener);
    };
  }, [eventId, listener, eventSource]);
};

/**
 * Check if the ViewPoint and IVLS backends were at one point ever connected.
 *
 * @return boolean
 */
const useWasSystemReady = () => {
  const { wasSystemReady } = useContext(EventSourceContext);

  return wasSystemReady;
};

/**
 * Check if the ViewPoint and IVLS backends are currently connected/available
 */
const useIsSystemReady = () => {
  const { isSystemReady } = useContext(EventSourceContext);

  return isSystemReady;
};

/**
 * Schedule a callback to run on reconnect in the event connection to the backend is lost
 *
 * @param callback
 */
const useOnReconnect = (callback: () => void) => {
  const systemWasReady = useWasSystemReady();
  const systemIsReady = useIsSystemReady();

  const lastSystemReady = usePrevious(systemIsReady);

  useEffect(() => {
    if (systemIsReady && systemWasReady && !lastSystemReady) {
      callback();
    }
  }, [systemWasReady, systemIsReady, lastSystemReady, callback]);
};

const useIsShuttingDown = () => {
  const { shuttingDown } = useContext(EventSourceContext);

  return shuttingDown;
};

export {
  EventSourceProvider,
  useEventSource,
  useEventListener,
  useOnReconnect,
  useWasSystemReady,
  useIsSystemReady,
  useIsShuttingDown,
};
