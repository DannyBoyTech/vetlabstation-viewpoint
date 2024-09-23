import styled from "styled-components";
import { Trans, useTranslation } from "react-i18next";
import QcAdapter from "../../../../assets/instruments/qc/proCyteDx/pdx-qc-adapter.png";
import { SpotText } from "@viewpoint/spot-react";
import { EventIds, InstrumentRunProgressDto, QcLotDto } from "@viewpoint/api";
import { useEventListener } from "../../../../context/EventSourceContext";
import { useGlobalModals } from "../../../../components/global-modals/GlobalModals";
import { LotInfo, RunQCModalContentRoot } from "./common-components";

const RunQcLoadInstructionsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 30px;
`;
const ImageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;

  img {
    height: 150px;
  }
`;

export const TestId = {
  ContentRoot: "tensei-start-qc-instructions-root",
};

export interface TenseiStartQcInstructionsProps {
  qcLotInfo: QcLotDto;
  instrumentId: number;
  modalId: string;
}

export function TenseiStartQcInstructions(
  props: TenseiStartQcInstructionsProps
) {
  const { t } = useTranslation();
  const { removeModal } = useGlobalModals();

  useEventListener(EventIds.InstrumentRunProgress, (msg) => {
    const data: InstrumentRunProgressDto = JSON.parse(msg.data);
    if (data.instrumentId === props.instrumentId) {
      removeModal(props.modalId);
    }
  });

  return (
    <RunQCModalContentRoot data-testid={TestId.ContentRoot}>
      <LotInfo qcLotInfo={props.qcLotInfo} />

      <SpotText level="paragraph" bold>
        {t("instrumentScreens.tensei.qualityControl.runQC.pageTwo.header")}
      </SpotText>

      <RunQcLoadInstructionsContainer>
        <ol>
          <li>
            <Trans i18nKey="instrumentScreens.tensei.qualityControl.runQC.pageTwo.stepOne" />
          </li>
          <li>
            <Trans i18nKey="instrumentScreens.tensei.qualityControl.runQC.pageTwo.stepTwo" />
          </li>
          <li>
            <Trans i18nKey="instrumentScreens.tensei.qualityControl.runQC.pageTwo.stepThree" />
          </li>
        </ol>

        <ImageContainer>
          <img src={QcAdapter} alt="qc-adapter" />
          <SpotText level="tertiary">
            {t(
              "instrumentScreens.tensei.qualityControl.runQC.pageTwo.imageLabel"
            )}
          </SpotText>
        </ImageContainer>
      </RunQcLoadInstructionsContainer>
    </RunQCModalContentRoot>
  );
}
