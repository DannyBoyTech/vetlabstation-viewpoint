import { Meta, StoryFn } from "@storybook/react";
import { Expander as Component, ExpanderProps } from "./Expander";

const meta: Meta = {
  title: "viewpoint/collapse/Expander",
  component: Component,
  argTypes: {
    onClick: {
      table: { disable: true },
    },
  },
};
export default meta;

const Template: StoryFn<ExpanderProps> = (args) => <Component {...args} />;

export const Expander = Template.bind({});
Expander.args = {
  expanded: true,
};
