import { Meta, StoryFn } from "@storybook/react";
import { StatusPill as Component, StatusPillProps } from "./StatusPill";
import { InstrumentRunStatus } from "@viewpoint/api";

const meta: Meta = {
  title: "viewpoint/InProcess",
  component: Component,
  argTypes: {
    className: {
      table: { disable: true },
    },
    status: {
      defaultValue: InstrumentRunStatus.Complete,
    },
  },
};
export default meta;

const Template: StoryFn<StatusPillProps> = (args) => <Component {...args} />;

export const StatusPill = Template.bind({});
