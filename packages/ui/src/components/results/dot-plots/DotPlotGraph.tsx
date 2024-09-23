import {
  SpotText,
  SpotTextProps,
} from "@viewpoint/spot-react/src/components/typography/Typography";
import styled from "styled-components";
import { Theme } from "../../../utils/StyleConstants";
import { useTranslation } from "react-i18next";
import { DotPlotApiLegendItem } from "@viewpoint/api";
import { ImageWithPlaceholder } from "../../images/ImageWithPlaceholder";

export interface DotPlotGraphProps {
  imageUrl: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  bordered?: boolean;
  width?: string;
  labelLevel?: SpotTextProps["level"];
  theme?: Theme;
  ["data-testid"]?: string;
}

const ImageContainer = styled.div`
  flex: 1;
`;
const ImageAndYAxisContainer = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
`;
const YAxisContainer = styled.div`
  display: flex;
  flex-direction: column;
  writing-mode: vertical-lr;
  align-items: center;
  transform: rotate(180deg);
`;
const DotPlotGraphContainer = styled.div<{
  width?: string;
  bordered?: boolean;
  extraPadding?: boolean;
  theme?: Theme;
}>`
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  ${(p) =>
    p.width
      ? `
        width: ${p.width};
      `
      : ""}
  ${(p: { bordered?: boolean; theme: Theme }) =>
    p.bordered
      ? `
        padding-top: 10px;
        border-radius: 5px;
        border: ${p.theme.borders?.lightSecondary};
      `
      : ""}
  ${(p) => (p.extraPadding ? `padding: 10px;` : "")}
  .spot-typography__text--tertiary,
  .spot-typography__text--secondary,
  .spot-typography__text--body,
  .spot-typography__heading--level-1,
  .spot-typography__heading--level-2,
  .spot-typography__heading--level-3,
  .spot-typography__heading--level-4,
  .spot-typography__heading--level-5 {
    color: ${(p) => p.theme.colors?.text?.disabled};
  }
`;

export function DotPlotGraph(props: DotPlotGraphProps) {
  return (
    <DotPlotGraphContainer
      width={props.width}
      bordered={props.bordered}
      extraPadding={!props.xAxisLabel && !props.yAxisLabel}
      theme={props.theme}
      data-testid={props["data-testid"]}
    >
      <ImageAndYAxisContainer>
        {props.yAxisLabel && (
          <YAxisContainer>
            <SpotText bold level={props.labelLevel ?? "tertiary"}>
              {props.yAxisLabel}
            </SpotText>
          </YAxisContainer>
        )}
        <ImageContainer>
          <ImageWithPlaceholder src={props.imageUrl} />
        </ImageContainer>
        {/* Duplicate the Y-Axis container but hide it so that the image is centered in the parent container/*/}
        {props.yAxisLabel && (
          <YAxisContainer style={{ visibility: "hidden" }}>
            <SpotText level={props.labelLevel ?? "tertiary"}>
              {props.yAxisLabel}
            </SpotText>
          </YAxisContainer>
        )}
      </ImageAndYAxisContainer>

      {props.xAxisLabel && (
        <SpotText bold level={props.labelLevel ?? "tertiary"}>
          {props.xAxisLabel}
        </SpotText>
      )}
    </DotPlotGraphContainer>
  );
}

export const LegendContainer = styled.div<{ columnCount: number }>`
  display: grid;
  grid-template-columns: repeat(${(p) => p.columnCount}, 1fr);
  column-gap: 10px;
  align-items: center;
`;
export const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;
export const LegendIcon = styled.div<{ color: string }>`
  margin: 10px 0px;
  background-color: ${(p) => p.color};
  width: 20px;
  height: 20px;
  flex-shrink: 0;
`;

interface LegendProps {
  legend: DotPlotApiLegendItem[];
  columnCount: number;
}

export const TestId = {
  LegendIcon: (type: DotPlotApiLegendItem["type"]) =>
    `dot-plot-legend-icon-${type}`,
};

export function Legend(props: LegendProps) {
  const { t } = useTranslation();
  return (
    <LegendContainer columnCount={props.columnCount}>
      {props.legend.map((legend) => (
        <LegendItem key={legend.type}>
          <LegendIcon
            color={`#${legend.color}`}
            data-testid={TestId.LegendIcon(legend.type)}
          />
          <SpotText level="tertiary">
            {t(`dotPlots.cellEvents.${legend.type}`)}
          </SpotText>
        </LegendItem>
      ))}
    </LegendContainer>
  );
}
