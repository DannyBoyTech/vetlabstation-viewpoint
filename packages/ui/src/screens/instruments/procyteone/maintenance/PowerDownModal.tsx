import { Trans, useTranslation } from "react-i18next";
import { ConfirmModal } from "../../../../components/confirm-modal/ConfirmModal";
import { InlineText } from "../../../../components/typography/InlineText";

interface PowerDownModalProps {
  instrumentId: number;
  onClose: () => void;
  onConfirm: () => void;
}

const PowerDownModal = (props: PowerDownModalProps) => {
  const { t } = useTranslation();

  return (
    <ConfirmModal
      {...props}
      open={true}
      dismissable={false}
      headerContent={t(
        "instrumentScreens.proCyteOne.maintenance.powerDownModal.title"
      )}
      bodyContent={
        <Trans
          i18nKey="instrumentScreens.proCyteOne.maintenance.powerDownModal.content"
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
        "instrumentScreens.proCyteOne.maintenance.powerDown"
      )}
    />
  );
};

export type { PowerDownModalProps };
export { PowerDownModal };
