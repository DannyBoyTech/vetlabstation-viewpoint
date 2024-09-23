import {
  ForwardedRef,
  MutableRefObject,
  RefCallback,
  useCallback,
} from "react";

/**
 * Creates a callback ref from multiple refs.
 * Useful, for instance, when you are forwarded a ref/callback,
 * have one yourself that you need internally, and you want both
 * to refer to the same element.
 */
export function useForkRef<T>(
  ...refs: (MutableRefObject<T> | ForwardedRef<T>)[]
): RefCallback<T> {
  return useCallback(
    (elem: T) => {
      refs
        .filter((it) => it != null)
        .forEach((ref) =>
          typeof ref === "function"
            ? ref(elem)
            : ((ref as MutableRefObject<T>).current = elem)
        );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    refs
  );
}
