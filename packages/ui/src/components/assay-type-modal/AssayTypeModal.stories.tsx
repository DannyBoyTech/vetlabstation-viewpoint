import { Meta, StoryFn } from "@storybook/react";
import { Button } from "@viewpoint/spot-react";
import { useState } from "react";
import {
  AssayTypeModal as Component,
  AssayTypeModalProps,
} from "./AssayTypeModal";

const meta: Meta = {
  title: "viewpoint/AssayTypeModal",
  component: Component,
};
export default meta;

const ModalUsage = ({
  categoryKey,
  options,
  patientName,
  speciesKey,
}: AssayTypeModalProps) => {
  const [open, setOpen] = useState(false);
  const onClose = () => setOpen(false);
  const onConfirm = (value: string) => {
    setOpen(false);
    alert(`selected ${value}`);
  };

  return (
    <div>
      <Button onClick={() => setOpen(true)}>Open Modal</Button>
      <Component
        open={open}
        onClose={onClose}
        onConfirm={onConfirm}
        categoryKey={categoryKey}
        options={options}
        patientName={patientName}
        speciesKey={speciesKey}
      />
    </div>
  );
};

const Template: StoryFn<AssayTypeModalProps> = (args) => (
  <ModalUsage {...args} />
);

export const AssayTypeModal = Template.bind({});
AssayTypeModal.args = {
  categoryKey: "Assay.Category.BileAcids",
  options: [
    { key: "Assay.ListName.BA01", value: "217" },
    { key: "Assay.ListName.BA02", value: "260" },
    { key: "Assay.ListName.BA03", value: "259" },
  ],
  patientName: "Maddie",
  speciesKey: "Species.Feline",
};
