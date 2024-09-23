import React from "react";
import { Meta, StoryFn } from "@storybook/react";
import { DataTable, DataTableProps } from "./DataTable";

const columns = [
  {
    Header: "Header 1",
    accessor: "col1",
  },
  {
    Header: "Header 2",
    accessor: "col2",
  },
  {
    Header: "Header 3",
    accessor: "col3",
  },
];

const data = [
  {
    col1: "Row 1 Col 1",
    col2: "Row 1 Col 2",
    col3: "Row 1 Col 3",
  },
  {
    col1: "Row 2 Col 1",
    col2: "Row 2 Col 2",
    col3: "Row 2 Col 3",
  },
  {
    col1: "Row 3 Col 1",
    col2: "Row 3 Col 2",
    col3: "Row 3 Col 3",
  },
];

export default {
  title: "spot-react/DataTable",
  component: DataTable,
  args: {
    columns,
    data,
  },
  argTypes: {
    columns: {
      control: "none",
    },
    data: {
      control: "none",
    },
    rowValidation: {
      control: "none",
    },
    sortable: {
      control: "none",
    },
    clickable: {
      control: {
        type: "select",
        options: ["", "default", "multi"],
      },
    },
  },
} as Meta;

const BasicTemplate: StoryFn<DataTableProps> = (args) => (
  <DataTable {...args} />
);
const SortableTemplate: StoryFn<DataTableProps> = (args) => (
  <DataTable sortable {...args} />
);

export const BasicDataTable = BasicTemplate.bind({});
export const ClickableRows = BasicTemplate.bind({});
ClickableRows.args = {
  clickable: "default",
};
ClickableRows.argTypes = {
  clickable: {
    control: "none",
  },
};
export const MultiClickableRows = BasicTemplate.bind({});
MultiClickableRows.args = {
  clickable: "multi",
};
MultiClickableRows.argTypes = {
  clickable: {
    control: "none",
  },
};

export const WithRowValidation = BasicTemplate.bind({});
WithRowValidation.args = {
  rowValidation: (row) => {
    if (row.col1 === "Row 1 Col 1") {
      return undefined;
    }
    if (row.col1 === "Row 3 Col 1") {
      return false;
    }
    return true;
  },
};

const sortColumns = [
  {
    Header: "ID",
    accessor: "idCol",
  },
  {
    Header: "Pet Name",
    accessor: "petNameCol",
  },
  {
    Header: "Owner",
    accessor: "ownerCol",
  },
  {
    Header: "Date",
    accessor: "dateCol",
    disableSortBy: true,
  },
  {
    Header: "Balance",
    accessor: "balanceCol",
    sortType: (rowA, rowB) => {
      const a = parseFloat(rowA.original.balanceCol.replace("$", ""));
      const b = parseFloat(rowB.original.balanceCol.replace("$", ""));
      return a - b;
    },
  },
];

const sortData = [
  {
    idCol: 1,
    petNameCol: "Charlie",
    ownerCol: "Leeann Trombetta",
    dateCol: "04/20/2017",
    balanceCol: "$ 99.99",
  },
  {
    idCol: 2,
    petNameCol: "Buddy",
    ownerCol: "Enriqueta Scarlett",
    dateCol: "09/22/2017",
    balanceCol: "$ 88.88",
  },
  {
    idCol: 3,
    petNameCol: "Coco",
    ownerCol: "Lionel Wax",
    dateCol: "11/18/2017",
    balanceCol: "$ 77.77",
  },
  {
    idCol: 4,
    petNameCol: "Max",
    ownerCol: "Annie Sauceda",
    dateCol: "11/19/2017",
    balanceCol: "$ 33.54",
  },
  {
    idCol: 5,
    petNameCol: "Bela",
    ownerCol: "Tomasa Charles",
    dateCol: "12/12/2017",
    balanceCol: "$ 44.44",
  },
  {
    idCol: 6,
    petNameCol: "Luna",
    ownerCol: "Verlene Nosal",
    dateCol: "12/12/2017",
    balanceCol: "$ 54.45",
  },
  {
    idCol: 7,
    petNameCol: "Ollie",
    ownerCol: "Chantelle Winburn",
    dateCol: "12/20/2017",
    balanceCol: "$ 65.34",
  },
  {
    idCol: 8,
    petNameCol: "Lolla",
    ownerCol: "Maurice Tuohy",
    dateCol: "01/11/2018",
    balanceCol: "$ 55.55",
  },
  {
    idCol: 9,
    petNameCol: "Jack",
    ownerCol: "Maurice Tuohy",
    dateCol: "02/23/2018",
    balanceCol: "$ 23.54",
  },
];

export const SortableDataTable = SortableTemplate.bind({});
SortableDataTable.args = {
  columns: sortColumns,
  data: sortData,
};
