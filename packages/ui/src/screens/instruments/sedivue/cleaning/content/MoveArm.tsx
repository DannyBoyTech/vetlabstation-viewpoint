import { SpotText } from "@viewpoint/spot-react";
import { Trans } from "react-i18next";
import { CommonTransComponents } from "../../../../../utils/i18n-utils";
import { LeftColumn, RightColumn, ContentRoot, CommonImg } from "../common";
import { LimitedLoopedVideo } from "../../../../../components/video/LimitedLoopedVideo";
import { getImagesForStep, SvdxCleaningStep } from "../utils";

interface MoveArmProps {
  halfDoor: boolean;
}

export function MoveArm(props: MoveArmProps) {
  return (
    <ContentRoot>
      <LeftColumn>
        {getImagesForStep(SvdxCleaningStep.MoveArm, props.halfDoor)?.map(
          (src) =>
            props.halfDoor ? (
              <LimitedLoopedVideo key={src} src={src} autoPlay loopTimes={3} />
            ) : (
              <CommonImg src={src} key={src} />
            )
        )}
      </LeftColumn>
      <RightColumn>
        <SpotText level="paragraph">
          <Trans
            i18nKey="instrumentScreens.sediVueDx.cleaningWizard.MoveArm.instructions"
            components={{ ...CommonTransComponents, ul: <ul />, li: <li /> }}
          />
        </SpotText>
      </RightColumn>
    </ContentRoot>
  );
}
