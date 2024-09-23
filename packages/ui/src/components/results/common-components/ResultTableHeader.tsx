import { InstrumentRunDto, InstrumentType } from "@viewpoint/api";
import styled from "styled-components";
import { useFormatDate, useFormatTime12h } from "../../../utils/hooks/datetime";
import { getInstrumentDisplayImage } from "../../../utils/instrument-utils";
import { SpotText } from "@viewpoint/spot-react";
import { ColumnDivider } from "./result-table-components";
import { Fragment, ReactNode } from "react";
import { RunTableRow } from "./RunTableRow";
import { GraphPanelHeaderRow } from "../graphing/graph-components";

export interface ResultTableHeaderProps {
  run: InstrumentRunDto;
  historicalRuns: InstrumentRunDto[];
  titleCellContent?: ReactNode;
}

export function ResultTableHeader(props: ResultTableHeaderProps) {
  return (
    <RunTableRow
      additionalColumnCount={props.historicalRuns?.length}
      omitBorder
    >
      {props.titleCellContent ?? <div />}
      <InstrumentRunHeaderCell
        testDate={props.run.testDate}
        instrumentType={props.run.instrumentType}
      />
      <div />
      <div />

      {props.historicalRuns?.map((historicalRun, historicalIndex) => (
        <Fragment key={historicalRun.id}>
          {historicalIndex == 0 ? <ColumnDivider /> : <div />}
          <InstrumentRunHeaderCell
            testDate={historicalRun.testDate}
            instrumentType={historicalRun.instrumentType}
          />
        </Fragment>
      ))}
    </RunTableRow>
  );
}

const GraphHeaderContainer = styled.div`
  grid-column: span 4;
  border-left: ${(p) => p.theme.borders?.extraLightPrimary};
  padding-left: 15px;
`;

export interface GraphTableHeaderProps {
  run: InstrumentRunDto;
  onClear: () => void;
  titleCellContent?: ReactNode;
}

export function GraphTableHeader(props: GraphTableHeaderProps) {
  return (
    <RunTableRow additionalColumnCount={2} omitBorder>
      {props.titleCellContent ?? <div />}
      <InstrumentRunHeaderCell
        testDate={props.run.testDate}
        instrumentType={props.run.instrumentType}
      />
      <div />
      <div />
      <GraphHeaderContainer>
        <GraphPanelHeaderRow onCancel={props.onClear} />
      </GraphHeaderContainer>
    </RunTableRow>
  );
}

const RunHeaderRoot = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;
const RunHeaderText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;
const RunHeaderImageWrapper = styled.div`
  max-width: 40px;
`;
const RunHeaderImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
`;

interface InstrumentRunHeaderCellProps {
  testDate: number;
  instrumentType: InstrumentType;
}

function InstrumentRunHeaderCell(props: InstrumentRunHeaderCellProps) {
  const formatDate = useFormatDate();
  const formatTime12h = useFormatTime12h();

  return (
    <RunHeaderRoot>
      <RunHeaderText>
        <SpotText level="secondary">{formatDate(props.testDate)}</SpotText>
        <SpotText level="tertiary">{formatTime12h(props.testDate)}</SpotText>
      </RunHeaderText>

      <RunHeaderImageWrapper style={{ maxWidth: "40px" }}>
        <RunHeaderImage src={getInstrumentDisplayImage(props.instrumentType)} />
      </RunHeaderImageWrapper>
    </RunHeaderRoot>
  );
}
