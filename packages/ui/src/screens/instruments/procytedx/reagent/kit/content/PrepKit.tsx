import { CommonImg, ContentRoot, LeftColumn, RightColumn } from "../../common";
import PrepKitImage from "../../../../../../assets/instruments/maintenance/proCyteDx/reagent/kit/prep_kit.png";
import { SpotText } from "@viewpoint/spot-react/src";
import { Trans } from "react-i18next";
import { CommonTransComponents } from "../../../../../../utils/i18n-utils";
import React from "react";

export function PrepKit() {
  return (
    <ContentRoot>
      <LeftColumn>
        <CommonImg src={PrepKitImage} key={PrepKitImage} />
      </LeftColumn>
      <RightColumn>
        <SpotText level="paragraph">
          <Trans
            i18nKey={
              "instrumentScreens.proCyteDx.changeReagentWizard.kit.Prep.instructions"
            }
            components={CommonTransComponents}
          />
        </SpotText>
      </RightColumn>
    </ContentRoot>
  );
}
