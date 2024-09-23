import { SpotText } from "@viewpoint/spot-react";
import { useTranslation } from "react-i18next";
import { ResultTableHeader } from "../common-components/ResultTableHeader";

import { DefaultResultTableResultRow } from "../default-components/DefaultResultTableResultRow";
import { NotesResultTableRow } from "../common-rows/NotesResultTableRow";
import { Fragment } from "react";
import { shouldDisplayCategory } from "../result-utils";
import { CategoryRow } from "../common-rows/CategoryRow";
import {
  Cell,
  ResultTableContentProps,
  RunTable,
} from "../common-components/result-table-components";

export function SnapDeviceResultTableContent(props: ResultTableContentProps) {
  const { t } = useTranslation();
  return (
    <RunTable>
      {!props.omitRunDateHeader && (
        <ResultTableHeader
          run={props.run}
          historicalRuns={props.historicalRuns}
        />
      )}
      <Cell style={{ gridColumn: 1, alignItems: "center" }}>
        <SpotText level="paragraph" bold>
          {props.run.snapDeviceDto != null
            ? t(props.run.snapDeviceDto.displayNamePropertyKey as any)
            : ""}
        </SpotText>
      </Cell>
      {props.run.instrumentResultDtos?.map((result, index) => (
        <Fragment key={result.id}>
          {shouldDisplayCategory(result, props.assayCategoryResultMappings) && (
            <CategoryRow
              category={result.category!}
              additionalColumnCount={props.historicalRuns.length}
            />
          )}
          <DefaultResultTableResultRow
            run={props.run}
            record={props.record}
            result={result}
            historicalRuns={props.historicalRuns}
            assayCategoryResultMappings={props.assayCategoryResultMappings}
            omitBorder={
              index >= props.run.instrumentResultDtos!.length - 1 &&
              (!props.run.runNotes || props.run.runNotes.length === 0)
            }
          />
        </Fragment>
      ))}
      {(props.run.runNotes?.length ?? 0) > 0 && (
        <NotesResultTableRow
          notes={props.run.runNotes}
          additionalColumnCount={props.historicalRuns.length}
          omitBorder
        />
      )}
    </RunTable>
  );
}
