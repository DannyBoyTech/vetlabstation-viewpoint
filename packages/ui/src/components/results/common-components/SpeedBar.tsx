import styled from "styled-components";
import { MagicHigh, MagicLow } from "../result-utils";

import { useResultColors } from "../../../context/ResultsPageContext";
import { Theme } from "../../../utils/StyleConstants";

export interface SpeedBarProps {
  speedBarMax: number;
  speedBarMin: number;
  referenceHigh: number;
  referenceLow: number;
  resultValue: number;
  high?: boolean;
  low?: boolean;
  abnormal?: boolean;
  veryHigh?: boolean;
  veryLow?: boolean;
}

const Bar = styled.div`
  display: flex;
  border: ${(p: { theme: Theme }) =>
    p.theme.borders?.lightSecondary}; // TODO - confirm color choice
  border-radius: 4px;
  width: 85px;
  height: 16px;
  align-items: center;
  z-index: 0;
`;

const Section = styled.div<{ omitBorder?: boolean }>`
  flex: 1;
  height: 100%;
  position: relative;
  ${(p: { theme: Theme; omitBorder?: boolean }) =>
    p.omitBorder
      ? ""
      : `border-right: ${p.theme.borders?.lightSecondary};`}// TODO - confirm color choice
`;

const Marker = styled.div<{ resultPercent: number; color?: string }>`
  background-color: ${(p) => p.color ?? "black"};
  top: 0.5px;
  bottom: 0.5px;
  position: absolute;
  border-radius: 4px;
  left: ${(p) => p.resultPercent}%;
  width: 3px;
  overflow: hidden;
`;

export function SpeedBar(props: SpeedBarProps) {
  const resultColors = useResultColors();
  return (
    <Bar>
      <Section>
        {props.low && (
          <Marker
            resultPercent={calculateSpeedBarPercent(props)}
            color={resultColors?.low}
          />
        )}
      </Section>

      <Section>
        {!props.low && !props.high && (
          <Marker
            resultPercent={calculateSpeedBarPercent(props)}
            color={resultColors?.normal}
          />
        )}
      </Section>
      <Section omitBorder>
        {props.high && (
          <Marker
            resultPercent={calculateSpeedBarPercent(props)}
            color={resultColors?.high}
          />
        )}
      </Section>
    </Bar>
  );
}

export function calculateSpeedBarPercent(props: SpeedBarProps): number {
  if (
    props.high &&
    (props.referenceHigh === props.speedBarMax ||
      props.speedBarMax === MagicHigh)
  ) {
    return 100;
  }
  if (
    props.low &&
    (props.referenceLow === props.speedBarMin || props.speedBarMin === MagicLow)
  ) {
    return 0;
  }

  const low = props.low
    ? props.speedBarMin
    : props.high
    ? props.referenceHigh
    : props.referenceLow;

  const high = props.low
    ? props.referenceLow
    : props.high
    ? props.speedBarMax
    : props.referenceHigh;

  // Difference between High and Low Reference values
  const referenceRange = high - low;

  // Difference between Value and Low Reference
  const valueRange = props.resultValue - low;
  const proportion = valueRange / referenceRange;

  return Math.min(Math.max(proportion * 100, 0), 90);
}
