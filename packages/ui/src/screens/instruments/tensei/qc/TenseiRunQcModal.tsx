import { Trans, useTranslation } from "react-i18next";
import { SpotText } from "@viewpoint/spot-react";
import { QcLotDto } from "@viewpoint/api";
import { ConfirmModal } from "../../../../components/confirm-modal/ConfirmModal";
import {
  LotInfo,
  ModalContentProps,
  RunQCModalContentRoot,
} from "./common-components";

export interface TenseiRunQcModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  qcLotInfo: QcLotDto;
}

export function TenseiRunQcModal(props: TenseiRunQcModalProps) {
  const { t } = useTranslation();

  return (
    <ConfirmModal
      data-testid="tensei-run-qc-modal"
      responsive
      open={props.open}
      onClose={props.onClose}
      onConfirm={props.onConfirm}
      bodyContent={<ModalContent qcLotInfo={props.qcLotInfo} />}
      cancelButtonContent={t("general.buttons.cancel")}
      confirmButtonContent={t("general.buttons.next")}
      headerContent={t("instrumentScreens.tensei.qualityControl.runQC.header")}
    />
  );
}

function ModalContent(props: ModalContentProps) {
  const { t } = useTranslation();
  return (
    <RunQCModalContentRoot>
      <LotInfo qcLotInfo={props.qcLotInfo} />

      <SpotText level="paragraph" bold>
        {t("instrumentScreens.tensei.qualityControl.runQC.pageOne.header")}
      </SpotText>

      <ol>
        <li data-testid="tensei-run-qc-step-1">
          <Trans i18nKey="instrumentScreens.tensei.qualityControl.runQC.pageOne.stepOne" />
        </li>
        <li data-testid="tensei-run-qc-step-2">
          <Trans i18nKey="instrumentScreens.tensei.qualityControl.runQC.pageOne.stepTwo" />
        </li>
      </ol>
    </RunQCModalContentRoot>
  );
}
