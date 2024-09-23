import { useResultColors } from "../../../context/ResultsPageContext";
import {
  getOutOfRangeColor,
  hasSpeedBar,
  isResultGraphable,
} from "../result-utils";
import { useState } from "react";
import { SampleTypeEnum } from "@viewpoint/api";
import { SpeedBar } from "../common-components/SpeedBar";
import { Cell } from "../common-components/result-table-components";
import { SpotText } from "@viewpoint/spot-react";
import { ReferenceRangeCell } from "../common-cells/ReferenceRangeCell";
import { AssayNameCell } from "../common-cells/AssayNameCell";
import styled from "styled-components";
import {
  defaultMatchResult,
  GetMatchingHistoricalResultFn,
  HistoricalResultCells,
} from "../common-cells/HistoricalResultCells";
import { useDifferential } from "../../../utils/differentials";
import { ResultTableResultRowProps } from "../default-components/DefaultResultTableResultRow";
import { DifferentialIcon } from "../common-components/Differentials";
import { RunTableRow } from "../common-components/RunTableRow";
import { ResultCell } from "../common-cells/ResultCell";
import { GraphIcon } from "../graphing/graph-components";

const TextNotesCell = styled(Cell)`
  grid-column: 3 / 5;
  display: flex;
  flex-direction: column;
  align-items: start;
  justify-content: center;
`;

export function TheiaResultRow(props: ResultTableResultRowProps) {
  const matchResult: GetMatchingHistoricalResultFn =
    props.getMatchingHistoricalResult ?? defaultMatchResult;

  const { differential } = useDifferential(
    props.result.assayIdentityName,
    props.result.instrumentType,
    props.result.sampleType
  );

  const [diffOpen, setDiffOpen] = useState(false);

  const handleDifferentialClick = () => setDiffOpen((open) => !open);

  const shouldIndentAssay =
    (props.result.displayCategory && props.result.category != null) ||
    props.result.crimsonIndentedAssay;
  const shouldShowIndexes = props.run.testOrders?.some((testOrder) =>
    testOrder.instrumentResultDtos.some(
      (result) => result.noteIndexes != null && result.noteIndexes.length > 0
    )
  );

  const resultColors = useResultColors();
  const rowColor = getOutOfRangeColor(props.result, resultColors);

  return (
    <RunTableRow additionalColumnCount={props.historicalRuns?.length}>
      <AssayNameCell
        useAbnormalColoring
        result={props.result}
        indented={shouldIndentAssay}
        assayIcon={
          <DifferentialIcon
            filled={diffOpen}
            hidden={differential == null}
            onClick={handleDifferentialClick}
          />
        }
        graphIcon={
          <GraphIcon
            hidden={!isResultGraphable(props.result, props.record)}
            onSelect={props.onGraphSelect}
            selected={props.graphingToggled}
          />
        }
      />
      <ResultCell result={props.result} showIndexes={shouldShowIndexes} />

      {props.result.sampleType === SampleTypeEnum.EAR_SWAB ? (
        <TextNotesCell>
          {props.result.resultNotes !== undefined &&
            props.result.resultNotes.length > 0 &&
            props.result.resultNotes.map((note) => (
              <SpotText
                key={note.hashId}
                level="secondary"
                bold={props.result.abnormal}
                style={{ color: rowColor }}
              >
                {note.note}
              </SpotText>
            ))}
        </TextNotesCell>
      ) : (
        <>
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
        </>
      )}
      {props.historicalRuns != null && props.historicalRuns.length > 0 && (
        <HistoricalResultCells
          result={props.result}
          historicalRuns={props.historicalRuns}
          matchResult={matchResult}
        />
      )}
    </RunTableRow>
  );
}
