import { SpotText } from "@viewpoint/spot-react";
import { Trans } from "react-i18next";
import { CommonTransComponents } from "../../../../../utils/i18n-utils";
import { CommonImg, LeftColumn, RightColumn, ContentRoot } from "../common";
import { getImagesForStep, SvdxCleaningStep } from "../utils";

interface PipettingWindowProps {
  halfDoor: boolean;
}

export function PipettingWindow(props: PipettingWindowProps) {
  return (
    <ContentRoot>
      <LeftColumn>
        {getImagesForStep(
          SvdxCleaningStep.PipettingWindow,
          props.halfDoor
        )?.map((src) => (
          <CommonImg key={src} src={src} />
        ))}
      </LeftColumn>
      <RightColumn>
        <SpotText level="paragraph">
          <Trans
            i18nKey="instrumentScreens.sediVueDx.cleaningWizard.PipettingWindow.instructions"
            components={{ ...CommonTransComponents, ul: <ul />, li: <li /> }}
          />
        </SpotText>
      </RightColumn>
    </ContentRoot>
  );
}
