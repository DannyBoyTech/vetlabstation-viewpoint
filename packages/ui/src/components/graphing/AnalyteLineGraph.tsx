import styled from "styled-components";
import { ActiveDot, CustomDot, DotSize } from "./CustomDot";
import { GraphableData } from "./graphing-types";
import dayjs from "dayjs";
import {
  Line,
  LineChart,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useContext, useMemo, useRef } from "react";
import { ViewpointThemeContext } from "../../context/ThemeContext";
import { useFormatDate } from "../../utils/hooks/datetime";
import { DarkTheme } from "../../utils/StyleConstants";

const GraphContainer = styled.div`
  margin-top: 0;
`;

const Graph = styled.div`
  font-size: 12px;
`;

const GraphHeader = styled.h2`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  font-size: 15px;
  font-weight: 400;
  margin: 0 0 12px;
  color: ${(p) => p.theme.colors?.text?.primary};
`;

export interface GraphData {
  date: number;
  value: number;
  label: string;
  source: string;
}

export const customTicks = (data: GraphData[]) => {
  const dates = data.map((g) => g.date);

  const minDate = Math.min(...dates);
  const maxDate = Math.max(...dates);

  const months = dayjs(maxDate).diff(dayjs(minDate), "months");

  if (minDate === maxDate) {
    return [minDate];
  } else if (months <= 2) {
    return [minDate, maxDate];
  } else if (months === 3) {
    return [minDate, minDate + (maxDate - minDate), maxDate];
  } else {
    const interval = (maxDate - minDate) / 3;
    return [minDate, minDate + interval, maxDate - interval, maxDate];
  }
};

export interface AnalyteLineGraphProps extends GraphableData {
  close?: () => void;
  dateFormat?: string;
  dotSize?: DotSize;
  labelSize?: string;
  onClick?: VoidFunction;
  hideYAxis?: boolean;
  showYAxis?: boolean; // do we need both of these?
  portalTarget?: HTMLElement;
  resultColors: { low: string; high: string };
  disableDotClick?: boolean;
  darkMode?: boolean;
}

export const AnalyteLineGraph = (props: AnalyteLineGraphProps) => {
  const {
    name,
    data,
    refHigh,
    refLow,
    critHigh,
    critLow,
    onClick,
    labelSize,
    portalTarget,
    resultColors,
    dotSize = "normal",
    hideRefRange = false,
  } = props;
  const { theme: appTheme } = useContext(ViewpointThemeContext);
  const theme = props.darkMode ? DarkTheme : appTheme;

  const containerRef = useRef<HTMLDivElement | null>(null);

  const values = useMemo(() => data.map((d) => d.value), [data]);
  const valueHigh = useMemo(() => Math.max(...values), [values]);
  const valueLow = useMemo(() => Math.min(...values), [values]);

  // find the lower data point between the reference range low and the lowest value
  const dataLow = Math.min(refLow ?? valueLow, valueLow);

  // find the higher data point between the reference range high and the highest value
  const dataHigh = Math.max(refHigh ?? valueHigh, valueHigh);

  // add 15% of range difference for high point of graph
  const high = dataHigh + (dataHigh - dataLow) * 0.15;

  // subtract 15% of range difference for low point of graph
  const low = dataLow - (dataHigh - dataLow) * 0.15;

  // if that calculated value is LOWER than the critical high, use that as the y-axis high
  // otherwise use the critical high value
  const yAxisHigh = critHigh ? Math.min(high, critHigh) : high;

  // if that calculated value is HIGHER than the critical low, use that as the y-axis low
  // otherwise use the critical low value
  const yAxisLow = critLow ? Math.max(low, critLow) : low;

  const lineChartMargin = dotSize === "normal" ? 5 : 8;

  const handleClick = () => {
    onClick?.();
  };

  const formatDate = useFormatDate();

  return (
    <GraphContainer onClick={handleClick} ref={containerRef}>
      <Graph>
        <GraphHeader>
          <>{name}</>
        </GraphHeader>
        <ResponsiveContainer aspect={1.88}>
          <LineChart
            data={data}
            margin={{
              top: lineChartMargin,
              bottom: lineChartMargin,
              left: lineChartMargin,
              right: lineChartMargin,
            }}
          >
            {!hideRefRange && (
              <ReferenceArea
                ifOverflow="extendDomain"
                y1={refLow}
                y2={refHigh}
                strokeWidth={0}
                fillOpacity={0.6}
                fill={theme.colors?.background?.secondary}
                radius={[4, 4, 4, 4]}
              />
            )}
            <Tooltip wrapperStyle={{ display: "none" }} />
            <YAxis hide={true} domain={[yAxisLow, yAxisHigh]} />
            <Line
              dataKey="value"
              stroke={theme.colors?.borders?.primary}
              strokeWidth={1.5}
              dot={
                <CustomDot
                  size={dotSize}
                  refLow={refLow ?? valueLow}
                  refHigh={refHigh ?? valueHigh}
                  hideRefRange={hideRefRange}
                  outOfRangeHighColor={resultColors.high}
                  outOfRangeLowColor={resultColors.low}
                  portalTarget={
                    portalTarget ?? containerRef.current ?? undefined
                  }
                  disableClick={props.disableDotClick}
                />
              }
              activeDot={<ActiveDot />}
              connectNulls={true}
              direction={"ltr"}
              animationDuration={750}
            />
            <XAxis
              dataKey="date"
              axisLine={true}
              tickLine={true}
              interval="preserveStartEnd"
              domain={["dataMin", "dataMax"]}
              type="number"
              height={30}
              stroke={theme.colors?.background?.secondary}
              strokeWidth={1}
              dy={12}
              tick={{
                fontSize: labelSize ?? "12px",
                fill: theme.colors?.text?.secondary,
              }}
              ticks={customTicks(data)}
              tickFormatter={(resultDate: number) =>
                formatDate(resultDate) ?? ""
              }
            />
          </LineChart>
        </ResponsiveContainer>
      </Graph>
    </GraphContainer>
  );
};
