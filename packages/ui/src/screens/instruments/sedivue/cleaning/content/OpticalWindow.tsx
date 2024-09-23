import { SpotText } from "@viewpoint/spot-react";
import { Trans } from "react-i18next";
import { CommonTransComponents } from "../../../../../utils/i18n-utils";
import { LeftColumn, RightColumn, ContentRoot } from "../common";
import { LimitedLoopedVideo } from "../../../../../components/video/LimitedLoopedVideo";
import { getImagesForStep, SvdxCleaningStep } from "../utils";

interface OpticalWindowProps {
  halfDoor: boolean;
}

export function OpticalWindow(props: OpticalWindowProps) {
  return (
    <ContentRoot>
      <LeftColumn>
        {getImagesForStep(SvdxCleaningStep.OpticalWindow, props.halfDoor)?.map(
          (src) => (
            <LimitedLoopedVideo key={src} src={src} loopTimes={3} autoPlay />
          )
        )}
      </LeftColumn>
      <RightColumn>
        <SpotText level="paragraph">
          <Trans
            i18nKey={`instrumentScreens.sediVueDx.cleaningWizard.OpticalWindow.${
              props.halfDoor ? "halfDoor" : "fullDoor"
            }.instructions`}
            components={{ ...CommonTransComponents, ul: <ul />, li: <li /> }}
          />
        </SpotText>
      </RightColumn>
    </ContentRoot>
  );
}
