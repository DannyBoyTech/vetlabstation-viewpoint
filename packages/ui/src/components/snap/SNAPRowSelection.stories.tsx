import { Meta, StoryFn } from "@storybook/react";
import {
  SNAPRowSelection as SNAPRowSelectionComponent,
  SNAPRowSelectionProps,
} from "./SNAPRowSelection";
import { useState } from "@storybook/preview-api";
import { fPLDefinition } from "../result-entry/snap/definitions/fPL";
import { FoalIgGDefinition } from "../result-entry/snap/definitions/FoalIgG";

const meta: Meta = {
  title: "viewpoint/SNAP",
  component: SNAPRowSelectionComponent,
};
export default meta;

const SNAPRowSelectionTemplate: StoryFn<SNAPRowSelectionProps> = (props) => {
  const [selectedRowId, setSelectedRowId] = useState(props.selectedRowId);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        maxWidth: "500px",
        maxHeight: "650px",
      }}
    >
      <SNAPRowSelectionComponent
        {...props}
        selectedRowId={selectedRowId}
        onRowSelected={(rowId) => {
          console.log(rowId);
          setSelectedRowId(rowId);
        }}
      />
    </div>
  );
};

export const TwoRowSNAPSelection = SNAPRowSelectionTemplate.bind({});

TwoRowSNAPSelection.args = {
  exampleInstructions: fPLDefinition.example.instructions,
  exampleImage: fPLDefinition.example.dots,
  rows: fPLDefinition.rows,
};

export const ThreeRowSNAPSelection = SNAPRowSelectionTemplate.bind({});
ThreeRowSNAPSelection.args = {
  exampleInstructions: FoalIgGDefinition.example.instructions,
  exampleImage: FoalIgGDefinition.example.dots,
  rows: FoalIgGDefinition.rows,
};
