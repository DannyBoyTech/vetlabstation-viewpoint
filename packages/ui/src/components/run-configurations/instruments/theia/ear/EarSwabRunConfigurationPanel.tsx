import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { Checkbox, SpotText } from "@viewpoint/spot-react";
import {
  EarSwabRunConfigurationDto,
  ExecuteInstrumentRunDto,
  TheiaClinicalSigns,
  TheiaSampleLocation,
} from "@viewpoint/api";
import { createEarSwabRunConfig } from "./ear-swab-utils";

export const TestId = {
  OptionalClinicalSignsCheckBoxId: "optional-clinical-signs-checkbox",
};

export interface EarSwabRunConfigurationPanelProps {
  run: ExecuteInstrumentRunDto;
  currentEarSwabConfigs?: EarSwabRunConfigurationDto[];
  onEarSwabConfigChanged?: (changes: EarSwabRunConfigurationDto[]) => void;
}

export function EarSwabRunConfigurationPanel(
  props: EarSwabRunConfigurationPanelProps
) {
  const { t } = useTranslation();
  const { onEarSwabConfigChanged } = props;

  return (
    <OptionalContainer>
      <StyledCheckbox
        checked={props.currentEarSwabConfigs?.every((cfg) =>
          cfg.theiaClinicalSigns.includes(TheiaClinicalSigns.PRESENT)
        )}
        onChange={(ev) => {
          onEarSwabConfigChanged?.([
            createEarSwabRunConfig(TheiaSampleLocation.LEFT, ev.target.checked),
            createEarSwabRunConfig(
              TheiaSampleLocation.RIGHT,
              ev.target.checked
            ),
          ]);
        }}
        data-testid={TestId.OptionalClinicalSignsCheckBoxId}
      />
      <StyledLabel>
        <SpotText level="paragraph">
          {t("theia.optionalClinicalSigns.label" as any)}
        </SpotText>
        <SpotText level="tertiary">
          {t("theia.optionalClinicalSigns.subLabel" as any)}
        </SpotText>
      </StyledLabel>
    </OptionalContainer>
  );
}

const StyledCheckbox = styled(Checkbox)`
  margin-top: 15px;

  &&& > .spot-form__checkbox-inner {
    box-shadow: none;
  }
`;

const StyledLabel = styled.div.attrs((props) => ({
  className: props.className,
}))`
  display: flex;
  flex-direction: column;
  min-width: 0px;
  overflow: hidden;
  text-overflow: ellipsis;

  .spot-typography__text--body {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .spot-typography__text--tertiary {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const OptionalContainer = styled.div`
  display: flex;
  gap: 0.25em;
  align-items: center;
  flex: 1;
`;
