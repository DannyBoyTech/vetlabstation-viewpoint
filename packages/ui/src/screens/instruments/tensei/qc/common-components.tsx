import { QcLotDto } from "@viewpoint/api";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { SpotText } from "@viewpoint/spot-react";

export interface ModalContentProps {
  qcLotInfo: QcLotDto;
}

export const RunQCModalContentRoot = styled.div`
  width: 700px;
  display: flex;
  flex-direction: column;
  height: 310px;

  ol {
    margin: 0;
  }

  li {
    margin: 20px 0;
  }
`;

export const TestId = {
  Lot: "lot-info-lot-number",
  Level: "lot-info-level",
};

const InfoContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  row-gap: 20px;
  width: 50%;
  margin-bottom: 30px;
`;

export function LotInfo(props: ModalContentProps) {
  const { t } = useTranslation();
  return (
    <InfoContainer>
      <SpotText level="paragraph" bold>
        {t("instrumentScreens.tensei.qualityControl.runQC.labels.lot")}
      </SpotText>
      <SpotText level="paragraph" data-testid={TestId.Lot}>
        {props.qcLotInfo.lotNumber}
      </SpotText>
      <SpotText level="paragraph" bold>
        {t("instrumentScreens.tensei.qualityControl.runQC.labels.level")}
      </SpotText>
      <SpotText level="paragraph" data-testid={TestId.Level}>
        {props.qcLotInfo.level}
      </SpotText>
    </InfoContainer>
  );
}
