import { useEffect } from "react";

/**
 * Prevents context (right-click) menu from showing when the application
 * is being used in a 'production' environment.
 */
export function usePreventContextMenu() {
  useEffect(() => {
    if (window.main?.getEnv() === "production") {
      const body = document.getElementsByTagName("body")[0];

      const listener = (ev: MouseEvent) => {
        ev.preventDefault();
        ev.stopImmediatePropagation();
      };

      body.addEventListener("contextmenu", listener);

      return () => body.removeEventListener("contextmenu", listener);
    }
  }, []);
}
