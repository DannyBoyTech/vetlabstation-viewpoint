import { useEffect, useState } from "react";
import { Meta, StoryFn } from "@storybook/react";
import { BasicModal as Component, BasicModalProps } from "./BasicModal";
import { Button } from "@viewpoint/spot-react";

const meta: Meta = {
  title: "viewpoint/BasicModal",
  component: Component,
  argTypes: {
    className: {
      table: { disable: true },
    },
  },
};
export default meta;

const ModalUsage = (props: Partial<BasicModalProps>) => {
  const [open, setOpen] = useState<boolean | undefined>(false);
  const onClose = () => setOpen(false);

  useEffect(() => setOpen(props.open), [props.open]);

  return (
    <div>
      <Button onClick={() => setOpen(true)}>Open Basic Modal</Button>
      <Component
        onClose={onClose}
        bodyContent="hi"
        headerContent="This is the header"
        footerContent="This is the footer"
        {...props}
        open={!!open}
      />
    </div>
  );
};

const Template: StoryFn<BasicModalProps> = (args) => <ModalUsage {...args} />;

export const BasicModal = Template.bind({});
BasicModal.args = {};
