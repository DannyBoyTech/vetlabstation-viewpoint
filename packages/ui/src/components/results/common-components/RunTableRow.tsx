import { ReactNode } from "react";
import { RunTableRowRoot } from "./result-table-components";
import { RowHistoricalColumnsPlaceholder } from "../common-rows/RowHistoricalColumnsPlaceholder";

export interface RunTableRowProps {
  includePlaceholders?: boolean;
  additionalColumnCount?: number;
  omitBorder?: boolean;
  children?: ReactNode;
}

export function RunTableRow({
  includePlaceholders,
  children,
  ...props
}: RunTableRowProps) {
  return (
    <RunTableRowRoot {...props}>
      {children}
      {includePlaceholders && props.additionalColumnCount != null && (
        <RowHistoricalColumnsPlaceholder
          additionalColumnCount={props.additionalColumnCount}
        />
      )}
    </RunTableRowRoot>
  );
}
