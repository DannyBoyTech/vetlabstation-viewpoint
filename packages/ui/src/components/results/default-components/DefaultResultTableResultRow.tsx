import {
  InstrumentResultDto,
  InstrumentRunDto,
  LabRequestRecordDto,
} from "@viewpoint/api";
import { useDifferential } from "../../../utils/differentials";
import { useState } from "react";
import {
  DifferentialContent,
  DifferentialIcon,
} from "../common-components/Differentials";
import { ResultCell } from "../common-cells/ResultCell";
import { hasSpeedBar, isResultGraphable } from "../result-utils";
import { SpeedBar } from "../common-components/SpeedBar";
import {
  Cell,
  TestOrderResultIdentifier,
} from "../common-components/result-table-components";
import {
  defaultMatchResult,
  GetMatchingHistoricalResultFn,
  HistoricalResultCells,
} from "../common-cells/HistoricalResultCells";
import { ReferenceRangeCell } from "../common-cells/ReferenceRangeCell";
import { AssayNameCell } from "../common-cells/AssayNameCell";
import { RunTableRow } from "../common-components/RunTableRow";
import { GraphIcon } from "../graphing/graph-components";

export interface ResultTableResultRowProps {
  record: LabRequestRecordDto;
  run: InstrumentRunDto;
  result: InstrumentResultDto;
  historicalRuns?: InstrumentRunDto[];
  assayCategoryResultMappings?: Record<string, TestOrderResultIdentifier[]>;
  omitBorder?: boolean;
  getMatchingHistoricalResult?: GetMatchingHistoricalResultFn;
  graphingToggled?: boolean;
  onGraphSelect?: () => void;
}

export function DefaultResultTableResultRow(props: ResultTableResultRowProps) {
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

  return (
    <RunTableRow
      additionalColumnCount={props.historicalRuns?.length}
      omitBorder={props.omitBorder}
    >
      <AssayNameCell
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
            hidden={
              // callback may be undefined if the result table in general
              // does not support graphing (aka qualitative SNAP results)
              // do not show the icon if nothing's going to happen when it's clicked
              props.onGraphSelect == null ||
              !isResultGraphable(props.result, props.record)
            }
            onSelect={props.onGraphSelect}
            selected={props.graphingToggled}
          />
        }
      />
      <ResultCell result={props.result} />
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
      {props.historicalRuns != null && (
        <HistoricalResultCells
          result={props.result}
          historicalRuns={props.historicalRuns}
          matchResult={matchResult}
        />
      )}
      {differential != null && (
        <DifferentialContent open={diffOpen} content={differential} />
      )}
    </RunTableRow>
  );
}
