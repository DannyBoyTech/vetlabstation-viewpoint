import { useCallback } from "react";
import { MaybeWithId, WithId, useGlobalModals } from "../GlobalModals";
import { BasicModal, BasicModalProps } from "../../basic-modal/BasicModal";

type AddBasicModalProps = MaybeWithId<Omit<BasicModalProps, "open">>;

function GlobalBasicModal(props: WithId<AddBasicModalProps>) {
  const { removeModal } = useGlobalModals();

  const callThenRemoveModal = useCallback(
    (fn: () => void) => {
      fn();
      removeModal(props.id);
    },
    [removeModal, props.id]
  );

  return (
    <BasicModal
      data-testid="global-basic-modal"
      {...props}
      open={true}
      onClose={() => callThenRemoveModal(props.onClose)}
    />
  );
}

/**
 * Provides hooks that implement scope-wide basic modals.
 *
 * @returns hooks that enable with scope-wide basic modals
 */
function useBasicModal() {
  const { addModal, removeModal } = useGlobalModals();

  const addBasicModal = useCallback(
    (basicModalProps: AddBasicModalProps) => {
      const id = basicModalProps.id ?? crypto.randomUUID();
      // Since these functions are ultimately provided as return values from hooks, always make sure to use
      // the callback version of setState functions to ensure we don't use a stale value

      addModal({
        id,
        content: <GlobalBasicModal {...basicModalProps} id={id} />,
      });

      return id;
    },
    [addModal]
  );

  return { addBasicModal: addBasicModal, removeBasicModal: removeModal };
}

export type { AddBasicModalProps };
export { useBasicModal };
