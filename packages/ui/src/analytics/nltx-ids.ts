export const NltxIds = {
  TutorialButton: "tutorial-button",
} as const;
export type NltxId = (typeof NltxIds)[keyof typeof NltxIds];

export const NLTX_ATTR_NAME = "data-nltx";

interface NltxAttr {
  [NLTX_ATTR_NAME]?: string;
}

/**
 * Returns an object that contains an analytics tracking label attribute key and value.
 * The idea is that this object can be spread into JSX to more easily
 * identify DOM elements to be picked up by analytics tools (like Heap.io).
 *
 * @param id - the tracking id to apply
 * @returns an object that can be spread to apply a JSX attribute
 */
export function nltxAttr(id: NltxId): NltxAttr {
  return { [NLTX_ATTR_NAME]: id };
}
