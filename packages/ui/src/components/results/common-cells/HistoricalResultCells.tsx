import { InstrumentResultDto, InstrumentRunDto } from "@viewpoint/api";
import { SpotPopover } from "../../../components/popover/Popover";
import styled from "styled-components";
import { Fragment, useRef, useState } from "react";
import { ResultCell } from "./ResultCell";
import { hasSpeedBar } from "../result-utils";
import { SpeedBar } from "../common-components/SpeedBar";
import {
  Cell,
  ColumnDivider,
} from "../common-components/result-table-components";
import { ReferenceRangeCell } from "./ReferenceRangeCell";
import { AssayNameCell } from "./AssayNameCell";

const TestId = {
  HistoricalResultTableCell: (assay: string, historicalIndex: number) =>
    `results-page-result-cell-${assay}-historical-${historicalIndex}`,

  HistoricalResultPopover: (assay: string, historicalIndex?: number) =>
    `historical-result-popover-${assay}${
      typeof historicalIndex === "undefined" ? "" : `-${historicalIndex}`
    }`,
  HistoricalAssayInPopover: (assay: string, historicalIndex: number) =>
    `historical-popover-assay-cell-${assay}-${historicalIndex}`,

  HistoricalResultInPopover: (assay: string, historicalIndex: number) =>
    `historical-popover-result-cell-${assay}-${historicalIndex}`,
};

interface HistoricalResultCellsProps {
  result: InstrumentResultDto;
  historicalRuns: InstrumentRunDto[];
  matchResult: GetMatchingHistoricalResultFn;
}

export function HistoricalResultCells(props: HistoricalResultCellsProps) {
  return (
    <>
      {props.historicalRuns.map((historicalRun, historicalIndex) => {
        const matchingResult = historicalRun.instrumentResultDtos?.find(
          (historicalResult) =>
            props.matchResult(props.result, historicalResult)
        );
        return matchingResult ? (
          <Fragment key={matchingResult.id}>
            {historicalIndex == 0 ? <ColumnDivider /> : <Cell />}
            <Cell>
              <HistoricalResultCell
                result={matchingResult}
                historicalIndex={historicalIndex}
              />
            </Cell>
          </Fragment>
        ) : (
          <Fragment key={historicalRun.id}>
            {historicalIndex == 0 ? <ColumnDivider /> : <Cell />}
            <Cell />
          </Fragment>
        );
      })}
    </>
  );
}

const HistoricalPopoverContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  width: 400px;
`;

export interface HistoricalResultCellProps {
  result: InstrumentResultDto;
  historicalIndex: number;
}

export function HistoricalResultCell(props: HistoricalResultCellProps) {
  const [anchorElement, setAnchorElement] = useState<HTMLDivElement>();
  return (
    <div>
      <ResultCell
        onClick={(ev) =>
          setAnchorElement(anchorElement == null ? ev.currentTarget : undefined)
        }
        data-testid={TestId.HistoricalResultTableCell(
          props.result.assay,
          props.historicalIndex
        )}
        key={props.result.id}
        result={props.result}
      />
      <SpotPopover
        anchor={anchorElement}
        onClickAway={() => setAnchorElement(undefined)}
        popFrom="bottom"
        offsetTo="left"
        strategy="absolute"
      >
        <HistoricalPopoverContainer
          data-testid={TestId.HistoricalResultPopover(
            props.result.assay!,
            props.historicalIndex
          )}
        >
          <AssayNameCell
            result={props.result}
            data-testid={TestId.HistoricalAssayInPopover(
              props.result.assay,
              props.historicalIndex
            )}
          />
          <ResultCell
            result={props.result}
            data-testid={TestId.HistoricalResultInPopover(
              props.result.assay,
              props.historicalIndex
            )}
          />
          <ReferenceRangeCell result={props.result} />

          <Cell>
            {hasSpeedBar(props.result) && (
              <SpeedBar
                speedBarMax={props.result.speedBarMax!}
                speedBarMin={props.result.speedBarMin!}
                referenceHigh={props.result.referenceHigh!}
                referenceLow={props.result.referenceLow!}
                resultValue={parseFloat(props.result.result!)}
                low={props.result.outOfRangeLow}
                high={props.result.outOfRangeHigh}
              />
            )}
          </Cell>
        </HistoricalPopoverContainer>
      </SpotPopover>
    </div>
  );
}

export type GetMatchingHistoricalResultFn = (
  currentResult: InstrumentResultDto,
  historicalResult: InstrumentResultDto
) => boolean;
export const defaultMatchResult: GetMatchingHistoricalResultFn = (
  currentResult,
  historicalResult
) => historicalResult.assay === currentResult.assay;
