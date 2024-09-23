import { useCallback } from "react";
import { useComponentId } from "./componentId";

/**
 * Returns a function that will generate a dom id with the given prefix.
 * The ID is guaranteed to be unique per component, and will not change between renders.
 *
 * @returns function that generates a DOM-compatible ID with the given prefix
 */
export function useDomId() {
  const componentId = useComponentId();
  return useCallback(
    (prefix: string) => `${prefix}:${componentId}`,
    [componentId]
  );
}
