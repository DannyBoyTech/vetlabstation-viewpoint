import { Trans } from "react-i18next";
import { CommonTransComponents } from "../../../../../../utils/i18n-utils";
import { SpotText } from "@viewpoint/spot-react/src";
import React from "react";
import { ContentRoot } from "../../common";

export function DisposeKit() {
  return (
    <ContentRoot>
      <SpotText level="paragraph">
        <Trans
          i18nKey={
            "instrumentScreens.proCyteDx.changeReagentWizard.kit.Dispose.instructions"
          }
          components={CommonTransComponents}
        />
      </SpotText>
    </ContentRoot>
  );
}
