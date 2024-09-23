import { EventIds } from "@viewpoint/api";
import { useEventListener } from "../../context/EventSourceContext";
import { useShutdownPrintServiceMutation } from "../../api/PrintApi";
import { useCallback } from "react";

/**
 * A React hook that listens for shutdown events published from the IVLS backend
 * and shuts down client services.
 *
 * This message is fired when backend is shutdown, which can happen when the whole machine
 * is powering down or just the software is shutting down (e.g. just before upgrade).
 */
export function useAppShutdownHandler() {
  const shutdownClient = useShutdownClient();

  useEventListener(EventIds.IvlsShuttingDown, () => {
    console.info("recieved shutdown notification from backend");
    shutdownClient();
  });
}

/**
 * A React hook that returns a function that shuts the client (and print) down.
 */
export function useShutdownClient() {
  const [shutdownPrintService] = useShutdownPrintServiceMutation();

  return useCallback(
    (options?: { delay?: number }) => {
      //stop the print service as soon as possible
      shutdownPrintService();

      //give time for UI to give user indication that shutdown is progressing before stopping app
      setTimeout(() => {
        window.main?.send("shutdown");
      }, options?.delay ?? 0);
    },
    [shutdownPrintService]
  );
}
