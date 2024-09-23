import { ReactNode, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useConfirmModal } from "./GlobalConfirmModal";

interface AddInfoModalProps {
  id?: string;
  header: ReactNode;
  content: ReactNode;
  confirmButtonContent?: ReactNode;
  secondaryHeader?: ReactNode;
}

/**
 * Provides hooks that implement scope-wide informational modals.
 *
 * @returns hooks that enable with scope-wide informational modals
 */
function useInfoModal() {
  const { t } = useTranslation();
  const { addConfirmModal, removeConfirmModal } = useConfirmModal();

  const addInfoModal = useCallback(
    (props: AddInfoModalProps) =>
      addConfirmModal({
        "data-testid": "global-info-modal",
        id: props.id,
        dismissable: false,
        bodyContent: props.content,
        headerContent: props.header,
        secondaryHeaderContent: props.secondaryHeader,
        cancelButtonContent: undefined,
        confirmButtonContent: props.confirmButtonContent
          ? props.confirmButtonContent
          : t("general.buttons.ok"),
        onClose: () => {},
        onConfirm: () => {},
      }),
    [addConfirmModal, t]
  );

  return { addInfoModal, removeInfoModal: removeConfirmModal };
}

export type { AddInfoModalProps };
export { useInfoModal };
