import { SpotIcon, SpotIconName } from "@viewpoint/spot-icons/src";
import {
  InstrumentRunConfigurationDto,
  RunConfiguration,
  SampleTypeDto,
} from "@viewpoint/api";
import { useContext } from "react";
import { ViewpointThemeContext } from "../../context/ThemeContext";
import { useTranslation } from "react-i18next";
import { SpotText } from "@viewpoint/spot-react/src";
import styled from "styled-components";

export type ExclusiveRunConfigTypes = Exclude<
  RunConfiguration,
  RunConfiguration.SAMPLE_TYPE
>;
const DilutionRunConfigHeaderLabelRoot = styled.div`
  display: flex;
  gap: 12px;
  margin: 0.75em 0;
  align-items: center;

  &:active {
    opacity: 0.6;
  }
`;

interface RunConfigHeaderLabelProps {
  runConfigType: ExclusiveRunConfigTypes;
  iconName?: SpotIconName;
  config?: InstrumentRunConfigurationDto;
  sampleTypes: SampleTypeDto[];
  onClick?: () => void;
}

export function RunConfigHeaderLabel(props: RunConfigHeaderLabelProps) {
  const { theme } = useContext(ViewpointThemeContext);
  const { t } = useTranslation();

  let label = t(`orderFulfillment.runConfig.${props.runConfigType}.header`);
  if (props.runConfigType === RunConfiguration.DILUTION) {
    label =
      props.config?.sampleTypeId == null
        ? t(`orderFulfillment.runConfig.DILUTION.header`, {
            totalParts: props.config?.dilution,
          }) +
          (props.config?.dilutionType
            ? ` ${t(`dilutionType.${props.config?.dilutionType}`)}`
            : "")
        : t(`orderFulfillment.runConfig.DILUTION.sampleTypeHeader`, {
            sampleType: t(
              `sampleType.${
                props.sampleTypes.find(
                  (st) => st.id === props.config?.sampleTypeId
                )?.name
              }` as any
            ),
            totalParts: props.config?.dilution,
          });
  } else if (props.runConfigType === RunConfiguration.UPC) {
    label = t(`orderFulfillment.runConfig.UPC.header`, {
      totalParts: props.config?.dilution,
    });
  }

  return (
    <DilutionRunConfigHeaderLabelRoot onClick={props.onClick}>
      {props.iconName != null && (
        <SpotIcon
          name={props.iconName}
          color={theme.colors?.interactive?.primary}
          size={20}
        />
      )}
      <SpotText level="secondary" bold>
        {label}
      </SpotText>
    </DilutionRunConfigHeaderLabelRoot>
  );
}
