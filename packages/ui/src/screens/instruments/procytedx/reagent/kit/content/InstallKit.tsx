import { CommonImg, ContentRoot, LeftColumn, RightColumn } from "../../common";
import InstallKitImage from "../../../../../../assets/instruments/maintenance/proCyteDx/reagent/kit/install_kit.png";
import { SpotText } from "@viewpoint/spot-react/src";
import { Trans } from "react-i18next";
import { CommonTransComponents } from "../../../../../../utils/i18n-utils";
import React from "react";

export function InstallKit() {
  return (
    <ContentRoot>
      <LeftColumn>
        <CommonImg src={InstallKitImage} key={InstallKitImage} />
      </LeftColumn>
      <RightColumn>
        <SpotText level="paragraph">
          <Trans
            i18nKey={
              "instrumentScreens.proCyteDx.changeReagentWizard.kit.Install.instructions"
            }
            components={CommonTransComponents}
          />
          <br />
          <br />
          <Trans
            i18nKey={
              "instrumentScreens.proCyteDx.changeReagentWizard.kit.Install.note"
            }
            components={CommonTransComponents}
          />
        </SpotText>
      </RightColumn>
    </ContentRoot>
  );
}
