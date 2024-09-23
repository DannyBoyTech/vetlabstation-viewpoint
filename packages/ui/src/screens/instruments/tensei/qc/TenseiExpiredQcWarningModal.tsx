import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { SpotText } from "@viewpoint/spot-react";
import { ConfirmModal } from "../../../../components/confirm-modal/ConfirmModal";

export interface TenseiExpiredQcWarningModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const StyledSpotText = styled(SpotText)`
  padding: 2rem 0;
`;

export function TenseiExpiredQcWarningModal(
  props: TenseiExpiredQcWarningModalProps
) {
  const { t } = useTranslation();

  return (
    <ConfirmModal
      data-testid="tensei-run-qc-expired-qc-warning-modal"
      responsive
      open={props.open}
      onClose={props.onClose}
      onConfirm={props.onConfirm}
      headerContent={t(
        "instrumentScreens.tensei.qualityControl.runQC.expiredQc.header"
      )}
      bodyContent={
        <StyledSpotText level="paragraph">
          {t("instrumentScreens.tensei.qualityControl.runQC.expiredQc.body")}
        </StyledSpotText>
      }
      cancelButtonContent={t("general.buttons.cancel")}
      confirmButtonContent={t("general.buttons.continue")}
    />
  );
}
