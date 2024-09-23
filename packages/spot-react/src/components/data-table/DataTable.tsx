import classNames from "classnames";
import React, {
  ComponentPropsWithoutRef,
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Column,
  useTable,
  useSortBy,
  UseSortByColumnOptions,
  RowPropGetter,
} from "react-table";

interface TableProps extends ComponentPropsWithoutRef<"table"> {
  size?: "default" | "small" | "large";
  textAlign?: "default" | "center" | "right";
  sortable?: boolean;
  clickable?: true | "default" | "multi";
  onRowsSelected?: (indexes: number[]) => void;
}

const Table = forwardRef<HTMLTableElement, TableProps>(
  (
    {
      className,
      size = "default",
      textAlign = "default",
      sortable = false,
      clickable,
      ...props
    },
    ref
  ) => {
    return (
      <table
        className={classNames("spot-data-table", className, {
          "spot-data-table--small-spacing": size === "small",
          "spot-data-table--large-spacing": size === "large",
          "spot-data-table--center-aligned": textAlign === "center",
          "spot-data-table--right-aligned": textAlign === "right",
          "spot-data-table--sortable": sortable,
          "spot-data-table--clickable":
            clickable === "default" || clickable === true,
          "spot-data-table--multi-clickable": clickable === "multi",
        })}
        {...props}
        ref={ref}
      />
    );
  }
);

interface TableRowProps extends ComponentPropsWithoutRef<"tr"> {
  rowInRange?: boolean;
  clicked?: boolean;
}

const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ rowInRange, className, clicked, ...props }, ref) => {
    return (
      <tr
        className={classNames(className, {
          "spot-data-table__row--in-range": rowInRange === true,
          "spot-data-table__row--out-of-range": rowInRange === false,
          "spot-data-table__row--clicked": clicked === true,
        })}
        {...props}
        ref={ref}
      />
    );
  }
);

interface TableHeaderCellProps extends ComponentPropsWithoutRef<"th"> {
  sortDirection?: "asc" | "desc";
  sortDisabled?: boolean;
}

const TableHeaderCell = forwardRef<HTMLTableCellElement, TableHeaderCellProps>(
  ({ className, sortDirection, sortDisabled = false, ...props }, ref) => {
    return (
      <th
        className={classNames(className, {
          "spot-data-table__col--sort-ascending": sortDirection === "asc",
          "spot-data-table__col--sort-descending": sortDirection === "desc",
          "spot-data-table__col--active": sortDirection !== undefined,
          "spot-data-table__col--sort-disabled": sortDisabled,
        })}
        {...props}
        ref={ref}
      />
    );
  }
);

export type DataTableColumn<T extends object> = Column<T> &
  UseSortByColumnOptions<T>;

export interface DataTableProps<T = unknown>
  extends Omit<TableProps, "children"> {
  columns: DataTableColumn<Record<string, T>>[];
  data: Record<string, T>[];
  getRowProps?: RowPropGetter<Record<string, T>>;
  rowValidation?: (row: Record<string, T>) => boolean | undefined;
}

/**
 * @deprecated use StatelessDataTable instead
 */
export const DataTable = forwardRef<HTMLTableElement, DataTableProps>(
  (props, ref) => {
    const [selectedRows, setSelectedRows] = useState<number[]>([]);
    return (
      <StatelessDataTable
        {...props}
        selectedRowIndexes={selectedRows}
        onRowsSelected={(rows) => {
          setSelectedRows(rows);
          props.onRowsSelected?.(rows);
        }}
      />
    );
  }
);

export interface StatelessDataTableProps<T = unknown>
  extends DataTableProps<T> {
  selectedRowIndexes?: number[];
}

export const StatelessDataTable = forwardRef<
  HTMLTableElement,
  StatelessDataTableProps
>(
  (
    {
      columns,
      data: tableData,
      rowValidation,
      clickable,
      onRowsSelected,
      selectedRowIndexes = [],
      getRowProps = (props) => ({ ...props }),
      ...props
    },
    ref
  ) => {
    const sorter = props.sortable === true ? useSortBy : () => undefined;

    const tableInstance = useTable({ columns, data: tableData }, sorter);
    const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
      tableInstance;

    const handleRowsClicked = useCallback(
      (newRowsClicked: number[]) => {
        onRowsSelected?.(
          newRowsClicked?.filter((index) => index != null) as number[]
        );
      },
      [onRowsSelected]
    );

    const toggleRowClicked = useCallback(
      (rowIndex: number) => () => {
        switch (clickable) {
          case "multi": {
            if (rowIndex != null) {
              const newRowsClicked = selectedRowIndexes.includes(rowIndex)
                ? selectedRowIndexes.filter((index) => index !== rowIndex)
                : [...selectedRowIndexes, rowIndex];
              handleRowsClicked(newRowsClicked);
            }
            return;
          }
          case true:
          case "default": {
            const newRowsClicked = selectedRowIndexes.includes(rowIndex)
              ? []
              : [rowIndex];
            handleRowsClicked(newRowsClicked);
            return;
          }
          default: {
            return;
          }
        }
      },
      [clickable, handleRowsClicked, selectedRowIndexes]
    );

    const previousTableData = useRef(tableData);
    useEffect(() => {
      if (previousTableData.current.length !== tableData.length) {
        // reset selection if rows change
        onRowsSelected?.([]);
      }
      previousTableData.current = tableData;
    }, [tableData, onRowsSelected]);

    return (
      <Table {...props} clickable={clickable} {...getTableProps()} ref={ref}>
        <thead>
          {headerGroups.map((headerGroup) => (
            // eslint-disable-next-line react/jsx-key
            <TableRow {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => {
                const sortDirection = column.isSorted
                  ? column.isSortedDesc
                    ? "desc"
                    : "asc"
                  : undefined;

                return (
                  // eslint-disable-next-line react/jsx-key
                  <TableHeaderCell
                    {...column.getHeaderProps(
                      props.sortable === true
                        ? column.getSortByToggleProps()
                        : undefined
                    )}
                    sortDirection={sortDirection}
                    sortDisabled={column.canSort === false}
                  >
                    {column.render("Header")}
                  </TableHeaderCell>
                );
              })}
            </TableRow>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map((row) => {
            prepareRow(row);
            const rowIndex = row.index;
            const rowInRange = rowValidation?.(row.original);
            const rowClicked = selectedRowIndexes.includes(rowIndex);
            return (
              // eslint-disable-next-line react/jsx-key
              <TableRow
                {...row.getRowProps(getRowProps)}
                rowInRange={rowInRange}
                clicked={rowClicked}
                onClick={toggleRowClicked(rowIndex)}
              >
                {row.cells.map((cell) => {
                  return (
                    // eslint-disable-next-line react/jsx-key
                    <td {...cell.getCellProps()}>{cell.render("Cell")}</td>
                  );
                })}
              </TableRow>
            );
          })}
        </tbody>
      </Table>
    );
  }
);

DataTable.displayName = "DataTable";
