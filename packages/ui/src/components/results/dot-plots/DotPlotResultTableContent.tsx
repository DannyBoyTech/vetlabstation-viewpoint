import { DotPlotResultRows } from "./DotPlotResultRows";
import { ResultTableHeader } from "../common-components/ResultTableHeader";

import { DefaultResultTableResultRow } from "../default-components/DefaultResultTableResultRow";
import { NotesResultTableRow } from "../common-rows/NotesResultTableRow";
import { Fragment } from "react";
import { shouldDisplayCategory } from "../result-utils";
import { CategoryRow } from "../common-rows/CategoryRow";
import {
  ResultTableContentProps,
  RunTable,
} from "../common-components/result-table-components";

export function DotPlotResultTableContent(props: ResultTableContentProps) {
  return (
    <RunTable>
      {!props.omitRunDateHeader && (
        <ResultTableHeader
          run={props.run}
          historicalRuns={props.historicalRuns}
        />
      )}

      {props.run.instrumentResultDtos?.map((result, index) => (
        <Fragment key={result.id}>
          {shouldDisplayCategory(result, props.assayCategoryResultMappings) && (
            <CategoryRow
              category={result.category!}
              additionalColumnCount={props.historicalRuns.length}
            />
          )}
          <DefaultResultTableResultRow
            result={result}
            record={props.record}
            historicalRuns={props.historicalRuns}
            run={props.run}
            assayCategoryResultMappings={props.assayCategoryResultMappings}
            graphingToggled={props.resultsBeingGraphed?.includes(result.id)}
            onGraphSelect={() => props.onGraphResultSelect?.(result.id)}
          />
        </Fragment>
      ))}
      {props.run.hasDotPlots && props.run.uuid && (
        <DotPlotResultRows
          runUuid={props.run.uuid}
          omitBorder={
            props.run.runNotes == null || props.run.runNotes.length === 0
          }
          additionalColumnCount={props.historicalRuns.length}
        />
      )}
      {(props.run.runNotes?.length ?? 0) > 0 && (
        <NotesResultTableRow
          notes={props.run.runNotes}
          omitBorder
          additionalColumnCount={props.historicalRuns.length}
        />
      )}
    </RunTable>
  );
}
