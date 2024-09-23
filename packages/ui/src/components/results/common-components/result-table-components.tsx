import styled from "styled-components";
import { InstrumentRunDto, LabRequestRecordDto } from "@viewpoint/api";

export type TestOrderResultIdentifier = {
  testOrderId: number;
  resultId: number;
};

export interface ResultTableContentProps {
  record: LabRequestRecordDto;
  run: InstrumentRunDto;
  historicalRuns: InstrumentRunDto[];
  assayCategoryResultMappings: Record<string, TestOrderResultIdentifier[]>;
  omitRunDateHeader?: boolean;
  resultsBeingGraphed?: number[];
  onGraphResultSelect?: (resultId: number) => void;
}

/**
 * Root component for an individual run table. Is intended to be used within
 * a larger "service category" table.
 */
export const RunTable = styled.div`
  display: flex;
  flex-direction: column;
`;

/**
 * Root component for a normal row within a run/result table. Note that rows are themselves
 * individual CSS grid components with common column counts and widths. This means
 * it is important to provide the correct number of additional columns needed
 */
export const RunTableRowRoot = styled.div<{
  additionalColumnCount?: number;
  omitBorder?: boolean;
}>`
  display: grid;
  padding: 4px 0;
  grid-template-columns: 15em 8em 8em 10em ${(p) =>
      p.additionalColumnCount != null && p.additionalColumnCount > 0
        ? `repeat(${p.additionalColumnCount}, 10px 8em)`
        : ""};

  ${(p) =>
    p.omitBorder
      ? ""
      : `
        border-bottom: ${p.theme.borders?.extraLightPrimary};
      `}
`;

/**
 * Generic cell to be used within the RunTableRow component
 */
export const Cell = styled.div.attrs({ className: "result-table-cell" })`
  display: flex;
  align-items: center;
`;

/**
 * Divider used between run tables within the Service Category table to provide
 * visual separation between run tables
 */
export const RunDivider = styled.div`
  grid-column: 1 / -1;
  border-bottom: ${(p) => p.theme.borders?.lightPrimary};
  margin: 15px 0;
`;

export const ColumnDivider = styled.div`
  border-left: ${(p) => p.theme.borders?.extraLightPrimary};
`;
