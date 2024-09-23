import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePrevious } from "../../utils/hooks/hooks";

interface UniqueModal {
  id: string;
  content: ReactNode;
}

type MaybeWithId<P extends object> = P & {
  id?: string;
};

type WithId<P extends object> = P & {
  id: string;
};

interface Provided {
  addModal: (modal: UniqueModal) => void;
  removeModal: (id: UniqueModal["id"]) => void;
}
const Context = createContext<Provided | undefined>(undefined);

interface GlobalModalProviderProps {
  children: ReactNode;
  interModalDelayMillis?: number;
}

interface State {
  modals: UniqueModal[];
  hidden: boolean;
}

const DEFAULT_STATE: State = {
  modals: [] as UniqueModal[],
  hidden: false,
} as const;

/**
 * Determines the next 'hidden' state based on the delay, previous modals, and current modals.
 * @param delay delay between modals, if any
 * @param modals previous array of modals
 * @param nextModals next array of modals
 * @returns true if first modal has changed, false otherwise
 */
function nextHiddenState(
  delay: number | undefined,
  modals: UniqueModal[],
  nextModals: UniqueModal[]
): boolean {
  return (
    (delay ?? -1) > 0 &&
    modals[0] != null &&
    nextModals[0] != null &&
    nextModals[0] !== modals[0] &&
    nextModals[0].id !== modals[0].id
  );
}

/**
 *  An instantiatable context provider that provides global modals
 */
const GlobalModalProvider = (props: GlobalModalProviderProps) => {
  const [state, setState] = useState<State>(DEFAULT_STATE);
  const prevState = usePrevious(state);

  const unhideAfterMillis = (delayMillis?: number) => {
    setTimeout(() => {
      setState((state) => ({
        ...state,
        hidden: false,
      }));
    }, delayMillis);
  };

  useEffect(() => {
    if (state.hidden && !prevState?.hidden) {
      unhideAfterMillis(props.interModalDelayMillis);
    }
  }, [prevState?.hidden, props.interModalDelayMillis, state.hidden]);

  const addModal = useCallback(
    (modal: UniqueModal) => {
      setState((prev) => {
        const nextModals = insertUniqueModal(modal, prev.modals);
        const nextHidden = nextHiddenState(
          props.interModalDelayMillis,
          prev.modals,
          nextModals
        );
        return { modals: nextModals, hidden: nextHidden };
      });
    },
    [setState, props.interModalDelayMillis]
  );

  const removeModal = useCallback(
    (id: UniqueModal["id"]) => {
      setState((prev) => {
        const nextModals = removeUniqueModal(id, prev.modals);
        const nextHidden = nextHiddenState(
          props.interModalDelayMillis,
          prev.modals,
          nextModals
        );
        return { modals: nextModals, hidden: nextHidden };
      });
    },
    [setState, props.interModalDelayMillis]
  );

  const provided = useMemo(
    () => ({ addModal, removeModal }),
    [addModal, removeModal]
  );

  return (
    <Context.Provider value={provided}>
      {props.children}
      {state.modals[0] && !state.hidden ? state.modals[0].content : null}
    </Context.Provider>
  );
};

/**
 * Pure reducer function that will replace or insert the given modal into an existing modal array.
 * The inputs to the function are unchanged following the call (the function treats data as immutable).
 *
 * @param toInsert - the modal you wish to insert
 * @param modals - an existing array of modals
 * @returns - a new updated modal array
 */
function insertUniqueModal(
  toInsert: UniqueModal,
  modals: UniqueModal[]
): UniqueModal[] {
  const { modals: updated, inserted } = modals.reduce(
    (acc, existing) => {
      if (existing.id === toInsert.id) {
        acc.modals.push(toInsert);
        acc.inserted = true;
      } else {
        acc.modals.push(existing);
      }
      return acc;
    },
    { modals: [] as UniqueModal[], inserted: false }
  );

  if (!inserted) {
    updated.push(toInsert);
  }

  return updated;
}

/**
 * Pure reducer function that will remove all modals in the given array that
 * have a matching id.
 *
 * The output is a new array, and the inputs are unchanged.
 *
 * @param toRemove - the id of the modal(s) you wish to remove
 * @param modals - the existing modal array
 * @returns - a new updated modal array
 */
function removeUniqueModal(
  toRemove: UniqueModal["id"],
  modals: UniqueModal[]
): UniqueModal[] {
  return modals.filter((it) => it.id !== toRemove);
}

/**
 * Provides low-level hooks to manipulate the global modal context.
 * You most likely don't want to use this directly. Use the higher level hooks like useConfirmModal, useInfoModal instead.
 *
 * @returns [setModals, removeModal] low level hooks to manipulate the modal context values
 */
function useGlobalModals() {
  const mutators = useContext(Context);

  if (mutators == null) {
    throw new Error("this hook must be used within a GlobalModalProvider");
  }

  return mutators;
}

export type { GlobalModalProviderProps, UniqueModal, MaybeWithId, WithId };

export { GlobalModalProvider, useGlobalModals };
