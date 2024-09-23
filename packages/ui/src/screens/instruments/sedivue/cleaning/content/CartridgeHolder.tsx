import { SpotText } from "@viewpoint/spot-react";
import { Trans } from "react-i18next";
import { CommonTransComponents } from "../../../../../utils/i18n-utils";
import { LimitedLoopedVideo } from "../../../../../components/video/LimitedLoopedVideo";
import { LeftColumn, RightColumn, ContentRoot } from "../common";
import { getImagesForStep, SvdxCleaningStep } from "../utils";

interface CartridgeHolderProps {
  halfDoor: boolean;
}

export function CartridgeHolder(props: CartridgeHolderProps) {
  return (
    <ContentRoot>
      <LeftColumn>
        {getImagesForStep(
          SvdxCleaningStep.CartridgeHolder,
          props.halfDoor
        )?.map((src) => (
          <LimitedLoopedVideo key={src} src={src} loopTimes={3} autoPlay />
        ))}
      </LeftColumn>
      <RightColumn>
        <SpotText level="paragraph">
          <Trans
            i18nKey="instrumentScreens.sediVueDx.cleaningWizard.CartridgeHolder.instructions"
            components={{ ...CommonTransComponents, ul: <ul />, li: <li /> }}
          />
        </SpotText>
      </RightColumn>
    </ContentRoot>
  );
}
