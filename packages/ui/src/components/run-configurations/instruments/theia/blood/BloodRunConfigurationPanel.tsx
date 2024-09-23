import {
  BloodRunConfigurationDto,
  ExecuteInstrumentRunDto,
  InstrumentRunConfigurationDto,
  InstrumentStatusDto,
  TheiaBloodWorkflow,
  TheiaMatchingRunResultDto,
} from "@viewpoint/api";
import { Button, SpotText, Text } from "@viewpoint/spot-react";
import React, { Fragment, useContext } from "react";
import {
  getInstrumentDisplayImage,
  numberedInstrumentName,
} from "../../../../../utils/instrument-utils";
import styled from "styled-components";
import { SpotIcon } from "@viewpoint/spot-icons/src";
import { ViewpointThemeContext } from "../../../../../context/ThemeContext";
import { useFormatLongDateTime12h } from "../../../../../utils/hooks/datetime";
import { Trans, useTranslation } from "react-i18next";
import {
  CbcValues,
  findConfigurations,
  findHematologyInstruments,
  HematologyConfiguration,
  provideCbcValues,
  provideHematologyInstrumentConfiguration,
  providePatientHistoricalRun,
  toHematologyConfig,
} from "./blood-common";
import { CommonTransComponents } from "../../../../../utils/i18n-utils";

const InstrumentImage = styled.img`
  object-fit: contain;
  height: 30px;
  width: 30px;
`;

const InstrumentConfigurationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 3px 0 3px 0;
`;

const InstrumentImageConfigurationContainer = styled.div`
  display: flex;
  align-items: center;
`;

const AlternativeInstrumentConfigurationContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 5px 0 5px 5px;
`;

const CbcInstrumentConfigurationContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin: 5px 0 5px 5px;
`;

const StyledButton = styled(Button)`
  margin-top: 5px;
`;

const ButtonsContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 10px;
`;

const ButtonContainer = styled.div`
  display: flex;
  align-items: center;
`;

export interface BloodRunConfigurationPanelProps {
  // loaded
  suggestions: TheiaMatchingRunResultDto[];
  // props
  currentConfig: InstrumentRunConfigurationDto;
  // context
  availableInstruments: InstrumentStatusDto[];
  instrumentRunDtos: ExecuteInstrumentRunDto[];
  // handlers
  onConfigStart: () => void;
  onCbcEdit: () => void;
  // handlers
  handleRunConfigChange: (
    bloodRunConfiguration: BloodRunConfigurationDto | undefined
  ) => void;
}

export function BloodRunConfigurationPanel(
  props: BloodRunConfigurationPanelProps
) {
  const formatTime = useFormatLongDateTime12h();
  const { t } = useTranslation();
  const { theme } = useContext(ViewpointThemeContext);

  // all PC instruments
  const hematologyInstruments = findHematologyInstruments(
    props.availableInstruments,
    props.instrumentRunDtos
  );

  // all PC configurations
  const hematologyInstrumentConfigurations = findConfigurations(
    hematologyInstruments,
    props.instrumentRunDtos,
    () => true
  );

  const cbcValues: CbcValues | undefined = provideCbcValues(
    props.currentConfig
  );
  const patientHistoricalRun: TheiaMatchingRunResultDto | undefined =
    providePatientHistoricalRun(props.suggestions, props.currentConfig);
  const hematologyInstrumentConfiguration: HematologyConfiguration | undefined =
    provideHematologyInstrumentConfiguration(
      hematologyInstrumentConfigurations,
      props.currentConfig
    );

  const removeConfiguration = () => {
    props.handleRunConfigChange(
      toHematologyConfig(undefined, undefined, undefined)
    );
  };

  return (
    <Fragment>
      {hematologyInstrumentConfiguration != null && (
        <InstrumentConfigurationContainer>
          <InstrumentImageConfigurationContainer>
            <InstrumentImage
              src={getInstrumentDisplayImage(
                hematologyInstrumentConfiguration.instrument.instrumentType
              )}
            />
            <Text>
              {numberedInstrumentName(
                t,
                hematologyInstrumentConfiguration.instrument.instrumentType,
                hematologyInstrumentConfiguration.instrument.displayNumber,
                true
              )}
            </Text>
          </InstrumentImageConfigurationContainer>
          <ButtonContainer onClick={removeConfiguration}>
            <SpotIcon
              name={"close"}
              size={25}
              style={{ marginLeft: "auto" }}
              color={theme.colors?.interactive?.primary}
            />
          </ButtonContainer>
        </InstrumentConfigurationContainer>
      )}

      {patientHistoricalRun != null && (
        <InstrumentConfigurationContainer>
          <InstrumentImageConfigurationContainer>
            <InstrumentImage
              src={getInstrumentDisplayImage(
                patientHistoricalRun.instrumentType
              )}
            />
            <Text>
              <div>{formatTime(patientHistoricalRun.testDateUtc * 1000)}</div>
            </Text>
          </InstrumentImageConfigurationContainer>
          <ButtonContainer onClick={removeConfiguration}>
            <SpotIcon
              name={"close"}
              size={25}
              style={{ marginLeft: "auto" }}
              color={theme.colors?.interactive?.primary}
            />
          </ButtonContainer>
        </InstrumentConfigurationContainer>
      )}

      {cbcValues != null && (
        <InstrumentConfigurationContainer>
          <CbcInstrumentConfigurationContainer>
            <div>
              <SpotText level="paragraph">
                {t("orderFulfillment.bloodMorphology.confirmPanel.cbc.results")}
              </SpotText>
            </div>
            <div>
              <SpotText level="paragraph">
                <Trans
                  i18nKey="orderFulfillment.bloodMorphology.confirmPanel.cbc.values"
                  values={{
                    rbcValue: cbcValues.rbcValue || "00.00",
                    wbcValue: cbcValues.wbcValue || "00.00",
                    hctValue: cbcValues.hctValue || "00.00",
                  }}
                  components={CommonTransComponents}
                />
              </SpotText>
            </div>
          </CbcInstrumentConfigurationContainer>
          <ButtonsContainer>
            <ButtonContainer onClick={props.onCbcEdit}>
              <SpotIcon
                name={"edit"}
                size={25}
                style={{ marginLeft: "auto" }}
                color={theme.colors?.interactive?.primary}
              />
            </ButtonContainer>
            <ButtonContainer onClick={removeConfiguration}>
              <SpotIcon
                name={"close"}
                size={25}
                style={{ marginLeft: "auto" }}
                color={theme.colors?.interactive?.primary}
              />
            </ButtonContainer>
          </ButtonsContainer>
        </InstrumentConfigurationContainer>
      )}

      {cbcValues == null &&
        patientHistoricalRun == null &&
        hematologyInstrumentConfiguration == null && (
          <AlternativeInstrumentConfigurationContainer>
            <Text>
              <Trans
                i18nKey="orderFulfillment.bloodMorphology.addHematology.instruction"
                components={CommonTransComponents}
              />
            </Text>
            <StyledButton onClick={props.onConfigStart} buttonType="secondary">
              {t("orderFulfillment.bloodMorphology.addHematology.button")}
            </StyledButton>
          </AlternativeInstrumentConfigurationContainer>
        )}
    </Fragment>
  );
}
