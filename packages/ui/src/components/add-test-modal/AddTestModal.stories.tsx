import { useState } from "react";
import { Meta, StoryFn } from "@storybook/react";
import { AddTestModal as Component, AddTestModalProps } from "./AddTestModal";
import {
  InstrumentStatus,
  InstrumentType,
  LabRequestRunType,
} from "@viewpoint/api";
import { Button } from "@viewpoint/spot-react";

const meta: Meta = {
  title: "viewpoint/AddTestModal",
  component: Component,
  argTypes: {
    className: {
      table: { disable: true },
    },
    type: {
      defaultValue: InstrumentType.SediVueDx,
    },
    status: {
      defaultValue: InstrumentStatus.Busy,
    },
  },
};
export default meta;

const ModalUsage = (props: AddTestModalProps) => {
  const [open, setOpen] = useState(props.open);
  const onClose = () => setOpen(false);

  return (
    <div>
      <Button onClick={() => setOpen(true)}>Add Test</Button>
      <Component
        open={open}
        onClose={onClose}
        addTestValidations={[
          {
            runType: LabRequestRunType.MERGE,
            supported: true,
            reasons: [],
          },
          {
            runType: LabRequestRunType.APPEND,
            supported: true,
            reasons: [],
          },
          {
            runType: LabRequestRunType.NEW,
            supported: true,
            reasons: [],
          },
        ]}
      />
    </div>
  );
};

const Template: StoryFn<AddTestModalProps> = (args) => <ModalUsage {...args} />;

export const AddTestModal = Template.bind({});
AddTestModal.args = {};
