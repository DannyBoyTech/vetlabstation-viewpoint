import { SpotIcon } from "@viewpoint/spot-icons";
import styled from "styled-components";
import { Theme } from "../../../utils/StyleConstants";
import { useContext } from "react";
import {
  GraphParams,
  useResultColors,
} from "../../../context/ResultsPageContext";
import { AnalyteLineGraph } from "../../graphing/AnalyteLineGraph";
import SpinnerOverlay from "../../overlay/SpinnerOverlay";
import { Trans, useTranslation } from "react-i18next";
import { PopoverContext } from "../../popover/popover-context";
import { SpotText } from "@viewpoint/spot-react";
import { getLocalizedAssayName, MagicHigh, MagicLow } from "../result-utils";
import { CommonTransComponents } from "../../../utils/i18n-utils";
import { GraphIconImage } from "./GraphIconImage";
import { useGetGraphDataQuery } from "../../../api/GraphApi";
import dayjs from "dayjs";

const GraphIconRoot = styled.div<{ $selected?: boolean; $hidden?: boolean }>`
  ${(p) => (p.$hidden ? "visibility: hidden" : "")};
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  padding: 6px;
  margin: 0 4px;

  ${(p) =>
    p.$selected
      ? `background-color: ${p.theme.colors?.interactive?.hoverSecondary};`
      : ""}
  > svg {
    fill: ${(p: { theme: Theme }) => p.theme.colors?.interactive?.primary};
  }
`;

export interface GraphIconProps {
  hidden: boolean;
  selected?: boolean;
  onSelect?: () => void;
}

export function GraphIcon(props: GraphIconProps) {
  return (
    <GraphIconRoot
      onClick={props.hidden ? () => {} : props.onSelect}
      $selected={props.selected}
      $hidden={props.hidden}
    >
      <GraphIconImage />
    </GraphIconRoot>
  );
}

const GraphPanelRoot = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-right: 8px;
  padding: 0 15px;
  border-left: ${(p: { theme: Theme }) => p.theme.borders?.extraLightPrimary};

  flex: auto;

  background-color: ${(p: { theme: Theme }) =>
    p.theme.colors?.background?.primary};
`;

const GraphPanelHeader = styled.div`
  display: flex;
  align-items: center;

  > .spot-icon {
    border-radius: 50%;
    margin-left: auto;
    fill: ${(p) => p.theme.colors?.interactive?.primary};

    :active {
      opacity: 0.5;
    }
  }
`;

const GraphPanelTitle = styled.div`
  display: flex;
  flex-direction: column;
`;

export interface GraphPanelHeaderRowProps {
  onCancel: () => void;
}

export function GraphPanelHeaderRow(props: GraphPanelHeaderRowProps) {
  const { t } = useTranslation();
  return (
    <GraphPanelHeader>
      <GraphPanelTitle>
        <SpotText level="paragraph" bold>
          {t("resultsPage.graphing.title")}
        </SpotText>
        <SpotText level="secondary">
          {t("resultsPage.graphing.inHouse")}
        </SpotText>
      </GraphPanelTitle>
      <SpotIcon name="cancel" size={24} onClick={props.onCancel} />
    </GraphPanelHeader>
  );
}

export interface GraphPanelProps {
  requestedGraphs: GraphParams[];
  onGraphClick: (graphKey: string) => void;
}

export function GraphPanel(props: GraphPanelProps) {
  return (
    <GraphPanelRoot>
      {props.requestedGraphs.map((req) => (
        <GraphContent
          key={req.graphKey}
          graphParams={req}
          onGraphClick={() => props.onGraphClick(req.graphKey)}
        />
      ))}
    </GraphPanelRoot>
  );
}

const GraphContentRoot = styled.div`
  position: relative;
  border-bottom: ${(p: { theme: Theme }) => p.theme.borders?.extraLightPrimary};
  min-height: 170px;
`;

export interface GraphContentProps {
  graphParams: GraphParams;
  onGraphClick: () => void;
}

export function GraphContent(props: GraphContentProps) {
  const { t } = useTranslation();
  const { getPortalTarget } = useContext(PopoverContext);
  const colors = useResultColors();

  const { data: graphData, isLoading } = useGraphData({
    graphParams: props.graphParams,
    timeframe: GraphTimeframe.All,
  });
  return (
    <GraphContentRoot>
      <SpotText level="secondary" bold>
        <Trans
          i18nKey={
            `Assay.extended.${props.graphParams.assayIdentityName}` as any
          }
          defaults={getLocalizedAssayName(
            t,
            props.graphParams.assayIdentityName,
            props.graphParams.assayIdentityName
          )}
          components={CommonTransComponents}
        />
      </SpotText>
      {isLoading && <SpinnerOverlay />}
      {graphData != null && (
        <AnalyteLineGraph
          {...graphData}
          disableDotClick
          labelSize={"10px"}
          onClick={props.onGraphClick}
          resultColors={colors}
          portalTarget={getPortalTarget() ?? undefined}
        />
      )}
    </GraphContentRoot>
  );
}

export const GraphTimeframe = {
  All: "all",
  Day: "day",
  Week: "week",
  Month: "month",
  Year: "year",
} as const;
export type GraphTimeframe =
  (typeof GraphTimeframe)[keyof typeof GraphTimeframe];

export interface UseGraphDataProps {
  graphParams: GraphParams;
  timeframe?: GraphTimeframe;
  skipQuery?: boolean;
}

export function useGraphData(props: UseGraphDataProps) {
  const { timeframe, skipQuery, graphParams } = props;
  return useGetGraphDataQuery(
    {
      ...graphParams,
      fromDate:
        timeframe != null && timeframe !== GraphTimeframe.All
          ? dayjs().subtract(1, timeframe).startOf("day").format("YYYY-MM-DD")
          : undefined,
    },
    {
      skip: skipQuery,
      selectFromResult: (res) => ({
        ...res,
        data:
          res.data == null
            ? undefined
            : {
                refLow:
                  res.data.refLow === MagicLow ? undefined : res.data.refLow,
                refHigh:
                  res.data.refHigh === MagicHigh ? undefined : res.data.refHigh,
                critLow:
                  res.data.critLow === MagicLow ? undefined : res.data.critLow,
                critHigh:
                  res.data.critHigh === MagicHigh
                    ? undefined
                    : res.data.critHigh,
                data: res.data.points.map((p) => ({
                  ...p,
                  date: p.date * 1000,
                })),
              },
      }),
    }
  );
}
