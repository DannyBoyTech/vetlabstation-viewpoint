import { SpotText } from "@viewpoint/spot-react";
import { Trans } from "react-i18next";
import { CommonTransComponents } from "../../../../../utils/i18n-utils";
import { LeftColumn, RightColumn, ContentRoot } from "../common";
import { LimitedLoopedVideo } from "../../../../../components/video/LimitedLoopedVideo";
import { getImagesForStep, SvdxCleaningStep } from "../utils";

interface CentrifugeArmProps {
  halfDoor: boolean;
}

export function CentrifugeArm(props: CentrifugeArmProps) {
  return (
    <ContentRoot>
      <LeftColumn>
        {getImagesForStep(SvdxCleaningStep.CentrifugeArm, props.halfDoor)?.map(
          (src) => (
            <LimitedLoopedVideo key={src} src={src} autoPlay loopTimes={3} />
          )
        )}
      </LeftColumn>
      <RightColumn>
        <SpotText level="paragraph">
          <Trans
            i18nKey="instrumentScreens.sediVueDx.cleaningWizard.CentrifugeArm.instructions"
            components={{ ...CommonTransComponents, ul: <ul />, li: <li /> }}
          />
        </SpotText>
      </RightColumn>
    </ContentRoot>
  );
}
