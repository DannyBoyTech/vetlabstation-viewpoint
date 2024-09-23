import { Fragment } from "react";
import { ResultTableHeader } from "../common-components/ResultTableHeader";
import { CategoryRow } from "../common-rows/CategoryRow";

import { DefaultResultTableResultRow } from "./DefaultResultTableResultRow";
import { NotesResultTableRow } from "../common-rows/NotesResultTableRow";
import { shouldDisplayCategory } from "../result-utils";
import {
  ResultTableContentProps,
  RunTable,
} from "../common-components/result-table-components";

/**
 * Table content for a generic instrument run. Most instruments will fall into
 * this category -- includes the run header, actual result rows, and run notes
 * if they are available in the run
 */
export function DefaultResultTableContent(props: ResultTableContentProps) {
  return (
    <RunTable key={props.run.id}>
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
            run={props.run}
            historicalRuns={props.historicalRuns}
            assayCategoryResultMappings={props.assayCategoryResultMappings}
            omitBorder={
              index >= props.run.instrumentResultDtos!.length - 1 &&
              (!props.run.runNotes || props.run.runNotes.length === 0)
            }
            graphingToggled={props.resultsBeingGraphed?.includes(result.id)}
            onGraphSelect={() => props.onGraphResultSelect?.(result.id)}
          />
        </Fragment>
      ))}

      {(props.run.runNotes?.length ?? 0) > 0 && (
        <NotesResultTableRow
          omitBorder
          notes={props.run.runNotes}
          additionalColumnCount={props.historicalRuns.length}
        />
      )}
    </RunTable>
  );
}
