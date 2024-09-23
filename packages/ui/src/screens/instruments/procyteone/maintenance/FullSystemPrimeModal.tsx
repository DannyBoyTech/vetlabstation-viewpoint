import { Trans, useTranslation } from "react-i18next";
import { ConfirmModal } from "../../../../components/confirm-modal/ConfirmModal";
import { InlineText } from "../../../../components/typography/InlineText";

interface FullSystemPrimeModalProps {
  instrumentId: number;
  onClose: () => void;
  onConfirm: () => void;
}

const FullSystemPrimeModal = (props: FullSystemPrimeModalProps) => {
  const { t } = useTranslation();

  return (
    <ConfirmModal
      {...props}
      open={true}
      dismissable={false}
      headerContent={t(
        "instrumentScreens.proCyteOne.maintenance.fullSystemPrimeModal.title"
      )}
      bodyContent={
        <Trans
          i18nKey="instrumentScreens.proCyteOne.maintenance.fullSystemPrimeModal.content"
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
      confirmButtonContent={t("instrumentScreens.proCyteOne.maintenance.prime")}
    />
  );
};

export type { FullSystemPrimeModalProps };
export { FullSystemPrimeModal };
