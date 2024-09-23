import { Trans, useTranslation } from "react-i18next";
import { ConfirmModal } from "../../../../components/confirm-modal/ConfirmModal";
import { InlineText } from "../../../../components/typography/InlineText";

interface ShutDownModalProps {
  instrumentId: number;
  onClose: () => void;
  onConfirm: () => void;
}

const ShutDownModal = (props: ShutDownModalProps) => {
  const { t } = useTranslation();

  return (
    <ConfirmModal
      {...props}
      open={true}
      dismissable={false}
      headerContent={t(
        "instrumentScreens.proCyteOne.maintenance.shutDownModal.title"
      )}
      bodyContent={
        <Trans
          i18nKey="instrumentScreens.proCyteOne.maintenance.shutDownModal.content"
          components={{
            strong: <InlineText level="paragraph" bold />,
            linebreak: (
              <>
                <br />
                <br />
              </>
            ),
          }}
        />
      }
      cancelButtonContent={t("general.buttons.cancel")}
      confirmButtonContent={t(
        "instrumentScreens.proCyteOne.maintenance.shutDown"
      )}
    />
  );
};

export type { ShutDownModalProps };
export { ShutDownModal };
