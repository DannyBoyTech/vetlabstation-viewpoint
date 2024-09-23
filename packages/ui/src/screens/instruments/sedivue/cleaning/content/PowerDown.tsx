import styled from "styled-components";
import { SpotText, Button } from "@viewpoint/spot-react";
import { useTranslation } from "react-i18next";
import { Theme } from "../../../../../utils/StyleConstants";
import { MaintenanceProcedure } from "@viewpoint/api";
import { useState } from "react";
import { CommonImg, LeftColumn, RightColumn, ContentRoot } from "../common";
import { getImagesForStep, SvdxCleaningStep } from "../utils";
import { useRequestSediVueProcedureMutation } from "../../../../../api/SediVueApi";

const StyledRightColumn = styled(RightColumn)`
  display: flex;
  flex-direction: column;
  gap: 50px;

  ${(p: { theme: Theme }) => `
    .spot-button {
      color: ${p.theme.colors?.feedback?.error};
    }
    .icon {
      fill: ${p.theme.colors?.feedback?.error};
    }
  `}
`;

interface PowerDown {
  halfDoor: boolean;
  instrumentId: number;
  isConnected: boolean;
}

export function PowerDownContent(props: PowerDown) {
  const [requestMade, setRequestMade] = useState(false);
  const { t } = useTranslation();
  const [requestProcedure, requestProcedureStatus] =
    useRequestSediVueProcedureMutation();
  return (
    <ContentRoot>
      <LeftColumn>
        {getImagesForStep(SvdxCleaningStep.PowerDown, props.halfDoor)?.map(
          (src) => (
            <CommonImg key={src} src={src} />
          )
        )}
      </LeftColumn>
      <StyledRightColumn>
        <SpotText level="paragraph">
          {t("instrumentScreens.sediVueDx.cleaningWizard.PowerDown.turnOff")}
        </SpotText>
        <div>
          <Button
            disabled={!props.isConnected || requestMade}
            onClick={() => {
              setRequestMade(true);
              requestProcedure({
                instrumentId: props.instrumentId,
                procedure: MaintenanceProcedure.SHUTDOWN,
              });
            }}
            buttonType="secondary"
            buttonSize="large"
            leftIcon="power"
          >
            {t("instrumentScreens.sediVueDx.cleaningWizard.PowerDown.button")}
          </Button>
        </div>
      </StyledRightColumn>
    </ContentRoot>
  );
}
