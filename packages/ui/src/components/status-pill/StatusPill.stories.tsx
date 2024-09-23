import { Meta, StoryFn } from "@storybook/react";
import { StatusPill as Component, StatusPillProps } from "./StatusPill";
import { InstrumentStatus } from "@viewpoint/api";

const meta: Meta = {
  title: "viewpoint/AnalyzerCard",
  component: Component,
  argTypes: {
    className: {
      table: { disable: true },
    },
    status: {
      defaultValue: InstrumentStatus.Ready,
    },
  },
};
export default meta;

const Template: StoryFn<StatusPillProps> = (args) => <Component {...args} />;

export const StatusPill = Template.bind({});
