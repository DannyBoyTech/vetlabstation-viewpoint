import { Trans, useTranslation } from "react-i18next";
import { SpotText } from "@viewpoint/spot-react";
import { QcLotDto } from "@viewpoint/api";
import { ConfirmModal } from "../../../../components/confirm-modal/ConfirmModal";
import { InlineText } from "../../../../components/typography/InlineText";
import { SediVueDxQcInstructionsBody } from "./SediVueDxQcInstructionsBody";

export interface SediVueDxRunQcModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  qcLotInfo: QcLotDto;
}

export function SediVueDxPrepareQcModal(props: SediVueDxRunQcModalProps) {
  const { t } = useTranslation();

  return (
    <ConfirmModal
      dismissable={false}
      open={props.open}
      onClose={props.onClose}
      onConfirm={props.onConfirm}
      headerContent={
        <SpotText level="h3" className="spot-modal__title">
          {t("instrumentScreens.sediVueDx.qc.runQc.title")}
        </SpotText>
      }
      bodyContent={<Body qcLotInfo={props.qcLotInfo} />}
      confirmButtonContent={t("general.buttons.next")}
      cancelButtonContent={t("general.buttons.cancel")}
    />
  );
}

interface BodyProps {
  qcLotInfo: QcLotDto;
}

export function Body(props: BodyProps) {
  const { t } = useTranslation();
  return (
    <SediVueDxQcInstructionsBody qcLotInfo={props.qcLotInfo}>
      <SpotText level="paragraph" bold>
        {t(`instrumentScreens.sediVueDx.qc.runQc.prepare.header`)}
      </SpotText>
      <ol>
        <Trans
          i18nKey={`instrumentScreens.sediVueDx.qc.runQc.prepare.instructions`}
          components={{
            li: <li />,
            linebreak: (
              <>
                <br />
                <br />
              </>
            ),
            strong: <InlineText level="paragraph" bold />,
          }}
        />
      </ol>
    </SediVueDxQcInstructionsBody>
  );
}
