import { SpotText } from "@viewpoint/spot-react";
import { Trans } from "react-i18next";
import HalfDoorShieldWasteBinOne from "../../../../../assets/instruments/maintenance/sediVueDx/cleaning/halfDoor/HD_Shield_waste_bin_1.png";
import HalfDoorShieldWasteBinTwo from "../../../../../assets/instruments/maintenance/sediVueDx/cleaning/halfDoor/HD_Shield_waste_bin_2.png";
import { CommonTransComponents } from "../../../../../utils/i18n-utils";
import { CommonImg, ContentRoot } from "../common";
import styled from "styled-components";
import { getImagesForStep, SvdxCleaningStep } from "../utils";
import { LimitedLoopedVideo } from "../../../../../components/video/LimitedLoopedVideo";

const LeftColumn = styled.div`
  flex: 2;
  display: flex;
  gap: 10px;
`;

const RightColumn = styled.div`
  flex: 1;
`;

const NonListText = styled(SpotText)`
  margin-left: 10px;
  margin-bottom: 20px;
`;

const ImageContainer = styled.div``;

interface ShieldAndWasteBinProps {
  halfDoor: boolean;
}

export function ShieldAndWasteBin(props: ShieldAndWasteBinProps) {
  return (
    <ContentRoot>
      <LeftColumn>
        {getImagesForStep(
          SvdxCleaningStep.ShieldAndWasteBin,
          props.halfDoor
        )?.map((src) =>
          props.halfDoor ? (
            <ImageContainer key={src}>
              <CommonImg src={src} />
            </ImageContainer>
          ) : (
            <ImageContainer key={src}>
              <LimitedLoopedVideo loopTimes={3} autoPlay src={src} />
            </ImageContainer>
          )
        )}
      </LeftColumn>
      <RightColumn>
        <NonListText level="paragraph">
          <Trans
            i18nKey="instrumentScreens.sediVueDx.cleaningWizard.ShieldAndWasteBin.title"
            components={CommonTransComponents}
          />
        </NonListText>
        <SpotText level="paragraph">
          <Trans
            i18nKey="instrumentScreens.sediVueDx.cleaningWizard.ShieldAndWasteBin.instructions"
            components={{ ...CommonTransComponents, ul: <ul />, li: <li /> }}
          />
        </SpotText>
        <NonListText level="paragraph">
          <Trans
            i18nKey="instrumentScreens.sediVueDx.cleaningWizard.ShieldAndWasteBin.note"
            values={{ replaceStep: props.halfDoor ? 10 : 9 }}
            components={CommonTransComponents}
          />
        </NonListText>
      </RightColumn>
    </ContentRoot>
  );
}
