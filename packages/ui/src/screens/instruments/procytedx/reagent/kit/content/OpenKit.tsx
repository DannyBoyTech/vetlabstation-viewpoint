import OpenKitVideo from "../../../../../../assets/instruments/maintenance/proCyteDx/reagent/kit/open_kit.webm";
import { LimitedLoopedVideo } from "../../../../../../components/video/LimitedLoopedVideo";
import { ContentRoot, LeftColumn, RightColumn } from "../../common";
import React from "react";
import { Trans } from "react-i18next";
import { CommonTransComponents } from "../../../../../../utils/i18n-utils";
import { SpotText } from "@viewpoint/spot-react/src";

export function OpenKit() {
  return (
    <ContentRoot>
      <LeftColumn>
        <LimitedLoopedVideo loopTimes={3} autoPlay={true} src={OpenKitVideo} />
      </LeftColumn>
      <RightColumn>
        <SpotText level="paragraph">
          <Trans
            i18nKey={
              "instrumentScreens.proCyteDx.changeReagentWizard.kit.Open.instructions"
            }
            components={CommonTransComponents}
          />
        </SpotText>
      </RightColumn>
    </ContentRoot>
  );
}
