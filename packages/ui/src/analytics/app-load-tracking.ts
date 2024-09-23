import { useEffect, useState } from "react";
import { trackAppLoad } from "./nltx-events";
import { useGetSettingsQuery } from "../api/SettingsApi";

/**
 * Tracks an app load (or reload) w/ the initial settings
 *
 * NOTE: This hook must be used somewhere that remains loaded during
 *      the entire app lifetime (like PostBootApp) to accurately reflect
 *      the number of app loads.
 */
export function useAppLoadTracking() {
  const { data: settings, isSuccess: settingsLoaded } = useGetSettingsQuery([]);
  const [appLoadReported, setAppLoadReported] = useState<boolean>(false);

  useEffect(() => {
    if (settingsLoaded && !appLoadReported) {
      trackAppLoad(settings ?? {});
      setAppLoadReported(true);
    }
  }, [appLoadReported, settings, settingsLoaded]);
}
