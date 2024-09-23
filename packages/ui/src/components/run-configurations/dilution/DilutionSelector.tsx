import { Button, Radio, SpotText } from "@viewpoint/spot-react";
import styled from "styled-components";
import { Theme } from "../../../utils/StyleConstants";
import { useContext } from "react";
import { ViewpointThemeContext } from "../../../context/ThemeContext";
import {
  DilutionDisplayConfig,
  DilutionTypeEnum,
  InstrumentRunConfigurationDto,
  ValidDilutionType,
} from "@viewpoint/api";
import { useTranslation } from "react-i18next";

const Root = styled.div`
  border: ${(p: { theme: Theme }) => p.theme.borders?.lightPrimary};
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 2fr;
  align-items: center;
  justify-content: center;
  row-gap: 0.25em;
  margin: 1em 0;
`;

const DisabledText = styled(SpotText)`
  /* increase specificity to override spot text color */
  && {
    color: ${(p: { theme: Theme }) => p.theme.colors?.text?.disabled};
  }
  text-align: center;
  grid-column: span 3;
`;
const EnabledText = styled(SpotText)`
  text-align: center;
`;

const Label = styled(SpotText)`
  margin-left: 0.75em;
`;

const ButtonWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Divider = styled.div`
  grid-column: 1/5;
  border: ${(p: { theme: Theme }) => p.theme.borders?.lightPrimary};
  margin: 0.75em 0em;
`;

const DilutionTypeContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: start;
  gap: 2em;
  padding: 1.25em 0 0 1.25em;

  .spot-form__radio {
    align-items: center;
    justify-content: start;
  }
`;

export const TestId = {
  Root: "dilution-panel-root",
  AutomatedRadio: "automated-radio-button",
  ManualRadio: "manual-radio-button",
  UpcRadio: "upc-radio-button",
  AddButton: "add-button",
  SubtractButton: "subtract-button",
  PartsDiluentValue: "parts-diluent-value",
  TotalPartsValue: "total-parts-value",
};

export type DilutionConfig = Pick<
  InstrumentRunConfigurationDto,
  "dilution" | "dilutionType"
>;

export interface DilutionSelectorProps {
  modifiable?: boolean;
  dilutionType: ValidDilutionType;
  totalParts: number;
  onDilutionChanged: (config: DilutionConfig) => void;
  partsDiluentConfig: DilutionDisplayConfig;
}

export function DilutionSelector(props: DilutionSelectorProps) {
  const validPartsDiluent = props.partsDiluentConfig[props.dilutionType];
  const partsDiluentIndex =
    validPartsDiluent?.indexOf(props.totalParts - 1) ?? 0;

  const { theme } = useContext(ViewpointThemeContext);

  const { t } = useTranslation();

  const supportsAutomated =
    !!props.partsDiluentConfig[DilutionTypeEnum.AUTOMATIC];
  const supportsManual = !!props.partsDiluentConfig[DilutionTypeEnum.MANUAL];
  const supportsUpc = !!props.partsDiluentConfig[DilutionTypeEnum.UPCAUTOMATIC];

  const supportsMultiple = Object.keys(props.partsDiluentConfig).length > 2; // defaultType is required so should always be present

  function handleTypeChanged(type: ValidDilutionType) {
    props.onDilutionChanged({
      dilutionType: type,
      dilution: 2, // resetting to default total parts when the dilution type is changed
    });
  }

  function incrementParts() {
    props.onDilutionChanged({
      dilutionType: props.dilutionType,
      dilution:
        (validPartsDiluent?.[
          Math.min(partsDiluentIndex + 1, validPartsDiluent.length - 1)
        ] ?? 0) + 1,
    });
  }

  function decrementParts() {
    props.onDilutionChanged({
      dilutionType: props.dilutionType,
      dilution:
        (validPartsDiluent?.[Math.max(partsDiluentIndex - 1, 0)] ?? 0) + 1,
    });
  }

  return (
    <Root data-testid={TestId.Root}>
      {supportsMultiple && (
        <DilutionTypeContainer>
          {supportsAutomated && (
            <Radio
              label={t("dilutionType.AUTOMATIC")}
              checked={props.dilutionType === DilutionTypeEnum.AUTOMATIC}
              onChange={() => handleTypeChanged(DilutionTypeEnum.AUTOMATIC)}
              data-testid={TestId.AutomatedRadio}
            />
          )}
          {supportsManual && (
            <Radio
              label={t("dilutionType.MANUAL")}
              checked={props.dilutionType === DilutionTypeEnum.MANUAL}
              onChange={() => handleTypeChanged(DilutionTypeEnum.MANUAL)}
              data-testid={TestId.ManualRadio}
            />
          )}
          {supportsUpc && (
            <Radio
              label={t("dilutionType.UPC_AUTOMATIC")}
              checked={props.dilutionType === DilutionTypeEnum.UPCAUTOMATIC}
              onChange={() => handleTypeChanged(DilutionTypeEnum.UPCAUTOMATIC)}
              data-testid={TestId.UpcRadio}
            />
          )}
        </DilutionTypeContainer>
      )}

      <Grid>
        <DisabledText level="h3" bold>
          1
        </DisabledText>
        <Label level="secondary">
          {t("orderFulfillment.runConfig.dilution.partSample")}
        </Label>

        <ButtonWrapper>
          {props.modifiable && partsDiluentIndex > 0 && (
            <Button
              iconOnly
              leftIcon="minus"
              buttonType="link"
              iconColor={theme.colors?.text?.secondary}
              onClick={decrementParts}
              data-testid={TestId.SubtractButton}
            />
          )}
        </ButtonWrapper>
        <EnabledText level="h3" bold data-testid={TestId.PartsDiluentValue}>
          {props.totalParts - 1}
        </EnabledText>
        <ButtonWrapper>
          {props.modifiable &&
            partsDiluentIndex <
              (validPartsDiluent?.length ?? Number.MAX_SAFE_INTEGER) - 1 && (
              <Button
                iconOnly
                leftIcon="plus"
                buttonType="link"
                onClick={incrementParts}
                data-testid={TestId.AddButton}
              />
            )}
        </ButtonWrapper>

        <Label level="secondary">
          {t("orderFulfillment.runConfig.dilution.partDiluent")}
        </Label>

        <Divider />

        <DisabledText level="h3" bold data-testid={TestId.TotalPartsValue}>
          {props.totalParts}
        </DisabledText>
        <Label level="secondary">
          {t("orderFulfillment.runConfig.dilution.totalParts")}
        </Label>
      </Grid>
    </Root>
  );
}
