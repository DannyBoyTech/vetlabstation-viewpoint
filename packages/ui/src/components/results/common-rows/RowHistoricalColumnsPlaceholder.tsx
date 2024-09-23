import {
  Cell,
  ColumnDivider,
} from "../common-components/result-table-components";
import { Fragment } from "react";

export function RowHistoricalColumnsPlaceholder(props: {
  additionalColumnCount: number;
}) {
  const elements = [];
  for (
    let historicalIndex = 0;
    historicalIndex < props.additionalColumnCount;
    historicalIndex++
  ) {
    elements.push(
      historicalIndex == 0 ? (
        <ColumnDivider key={historicalIndex} />
      ) : (
        <Cell key={historicalIndex} />
      )
    );
  }
  return <Fragment>{elements}</Fragment>;
}
