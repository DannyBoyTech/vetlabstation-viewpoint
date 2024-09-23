import { useRef } from "react";

let uniqueId = BigInt(0);
const getUniqueId = () => uniqueId++;

/**
 * Returns a unique id for the current component.
 *
 * @returns a string that is unique per component that uses it
 */
export function useComponentId() {
  const idRef = useRef<string>();

  //assign 'current' directly to prevent calling getUniqueId on every render
  if (idRef.current == null) {
    idRef.current = getUniqueId().toString();
  }
  return idRef.current;
}
