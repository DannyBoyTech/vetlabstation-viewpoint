import { DataTable, DataTableProps } from "@viewpoint/spot-react";
import styled from "styled-components";
import { Theme } from "../../utils/StyleConstants";

export const StickyHeaderTableWrapper = styled.div`
  flex: auto;
  max-height: 100%;

  display: flex;
  flex-direction: column;

  overflow-y: auto;

  > table {
    margin-left: 0;
    margin-right: 0;

    border-spacing: 0;
    border-collapse: separate;
  }

  > table thead {
    position: sticky;
    top: 0;
    z-index: 2;
    background-color: ${(p: { theme: Theme }) =>
      p.theme.colors?.background?.primary};
  }
`;

interface StickyHeaderDataTableProps extends DataTableProps {
  className?: string;
  "data-testid"?: string;
}

export function StickyHeaderDataTable(props: StickyHeaderDataTableProps) {
  const { "data-testid": dataTestId, className, ...dataTableProps } = props;
  return (
    <StickyHeaderTableWrapper className={className} data-testid={dataTestId}>
      <DataTable {...dataTableProps} />
    </StickyHeaderTableWrapper>
  );
}
