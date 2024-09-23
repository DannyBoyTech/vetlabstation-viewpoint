import classnames from "classnames";
import styled from "styled-components";
import { InstrumentStatus, InstrumentType } from "@viewpoint/api";
import {
  getInstrumentCategory,
  instrumentNameForType,
} from "../../utils/instrument-utils";
import { useTranslation } from "react-i18next";
import { SpotText } from "@viewpoint/spot-react";
import { AnalyzerStatus } from "../../components/analyzer-status/AnalyzerStatus";

export interface AnalyzerProps {
  className?: string;
  name?: string;
  type: InstrumentType;
  status?: InstrumentStatus;
  manualInstrument?: boolean;
  selectedSampleType: number;
}

const AnalyzerContainer = styled.div.attrs((props) => ({
  className: props.className,
}))`
  display: flex;
  gap: 0.75em;
  align-items: center;
  flex: 1;
`;

const Description = styled.div.attrs((props) => ({
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

const StyledAnalyzerStatus = styled(AnalyzerStatus)`
  && .analyzer-img {
    height: 50px;
  }
`;

export const Analyzer = (props: AnalyzerProps) => {
  const classes = classnames("analyzer", props.className);
  const { t } = useTranslation();

  return (
    <AnalyzerContainer className={classes}>
      <StyledAnalyzerStatus
        instrumentType={props.type}
        status={
          props.manualInstrument
            ? "MANUAL"
            : props.status ?? InstrumentStatus.Unknown
        }
      />
      <Description>
        <SpotText level="paragraph" style={{ fontWeight: "bold" }}>
          {props.name ?? instrumentNameForType(t, props.type)}
        </SpotText>
        <SpotText level="tertiary">
          {getInstrumentCategory(t, props.type, props.selectedSampleType)}
        </SpotText>
      </Description>
    </AnalyzerContainer>
  );
};
