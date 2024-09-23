import { InstrumentType } from "@viewpoint/api/src/ivls/generated/ivls-api";
import { getInstrumentDisplayImage } from "../utils/instrument-utils";

/**
 * Fetches all IVLS instrument images with a high priority, to populate cache.
 */
async function fetchInstrumentImages() {
  return Promise.all(
    Object.values(InstrumentType)
      .map(getInstrumentDisplayImage)
      .map((href) =>
        fetch(
          href,
          //@ts-ignore our typescript type doesn't seem to support fetch priority yet
          { priority: "high" } as any
        )
      )
  );
}

/**
 * Preloads performance critical assets early in the application lifecycle.
 */
export function preloadAssets() {
  (async () => {
    try {
      console.debug("asset preload requested");

      await fetchInstrumentImages();

      console.debug("asset preload completed");
    } catch (e) {
      console.debug("asset preload failed", e);
    }
  })();
}

preloadAssets();
