import React, { useState } from "react";
import { Meta, StoryFn } from "@storybook/react";
import { Popover as Component, PopoverProps } from "./Popover";

type PopoverUsageProps = Omit<
  PopoverProps,
  "open" | "onClickAway" | "onClickTarget"
>;

const PopoverUsage = (props: PopoverUsageProps) => {
  const [open, setOpen] = useState(false);
  return (
    <Component
      {...props}
      open={open}
      onClickAway={() => setOpen(false)}
      onClickTarget={() => setOpen(!open)}
    >
      {props.children}
    </Component>
  );
};

const meta: Meta = {
  title: "spot-react/Popover",
  component: PopoverUsage,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    className: {
      type: "string",
    },
    showCaret: {
      type: "boolean",
    },
    popFrom: {
      type: "string",
      control: "radio",
      options: [undefined, "top", "right", "bottom", "left"],
    },
    offsetTo: {
      type: "string",
      control: "radio",
      options: [undefined, "left", "center", "right"],
    },
    caretAlign: {
      type: "string",
      control: "radio",
      options: [undefined, "left", "right"],
    },
    inset: {
      type: "string",
      control: "radio",
      options: [undefined, "small", "medium", "large"],
    },
  },
};
export default meta;

export const Popover: StoryFn<PopoverUsageProps> = (
  args: PopoverUsageProps
) => (
  <PopoverUsage {...args} target={<button>Click for Popover</button>}>
    <>Lorem ipsum dolor sit amet consectetur adipisicing elit. Delectus, rem?</>
  </PopoverUsage>
);
