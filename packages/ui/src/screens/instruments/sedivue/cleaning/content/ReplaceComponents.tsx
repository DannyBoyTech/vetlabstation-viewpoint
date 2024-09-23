import { SpotText } from "@viewpoint/spot-react";
import { Trans } from "react-i18next";
import { CommonTransComponents } from "../../../../../utils/i18n-utils";
import { CommonImg, ContentRoot } from "../common";
import styled from "styled-components";
import { getImagesForStep, SvdxCleaningStep } from "../utils";

const StyledRoot = styled(ContentRoot)`
  flex-direction: column;
  gap: 20px;
`;

interface ReplaceComponentsProps {
  halfDoor: boolean;
}

export function ReplaceComponents(props: ReplaceComponentsProps) {
  return (
    <StyledRoot>
      {getImagesForStep(
        SvdxCleaningStep.ReplaceComponents,
        props.halfDoor
      )?.map((img) => (
        <CommonImg key={img} src={img} />
      ))}

      <SpotText level="paragraph">
        <Trans
          i18nKey="instrumentScreens.sediVueDx.cleaningWizard.ReplaceComponents.instructions"
          components={{ ...CommonTransComponents, ul: <ul />, li: <li /> }}
        />
      </SpotText>
    </StyledRoot>
  );
}
