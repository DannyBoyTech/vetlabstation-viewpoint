import { useCallback } from "react";
import {
  ConfirmModal,
  ConfirmModalProps,
} from "../../confirm-modal/ConfirmModal";
import { MaybeWithId, WithId, useGlobalModals } from "../GlobalModals";

type AddConfirmModalProps = MaybeWithId<Omit<ConfirmModalProps, "open">>;

function GlobalConfirmModal(props: WithId<AddConfirmModalProps>) {
  const { removeModal } = useGlobalModals();

  const callThenRemoveModal = useCallback(
    (fn: () => void) => {
      fn();
      removeModal(props.id);
    },
    [removeModal, props.id]
  );

  return (
    <ConfirmModal
      data-testid="global-confirm-modal"
      {...props}
      open={true}
      onClose={() => callThenRemoveModal(props.onClose)}
      onConfirm={() => callThenRemoveModal(props.onConfirm)}
    />
  );
}

/**
 * Provides hooks that implement scope-wide confirmation modals.
 *
 * @returns hooks that enable with scope-wide confirmation modals
 */
function useConfirmModal() {
  const { addModal, removeModal } = useGlobalModals();

  const addConfirmModal = useCallback(
    (confirmModalProps: AddConfirmModalProps) => {
      const id = confirmModalProps.id ?? crypto.randomUUID();
      // Since these functions are ultimately provided as return values from hooks, always make sure to use
      // the callback version of setState functions to ensure we don't use a stale value

      addModal({
        id,
        content: <GlobalConfirmModal {...confirmModalProps} id={id} />,
      });

      return id;
    },
    [addModal]
  );

  return { addConfirmModal, removeConfirmModal: removeModal };
}

export type { AddConfirmModalProps };
export { useConfirmModal };
