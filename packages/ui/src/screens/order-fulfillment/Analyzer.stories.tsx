import { Meta, StoryFn } from "@storybook/react";
import { Analyzer as Component, AnalyzerProps } from "./Analyzer";
import { InstrumentStatus, InstrumentType } from "@viewpoint/api";

const meta: Meta = {
  title: "viewpoint/AnalyzerCard",
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

const Template: StoryFn<AnalyzerProps> = (args) => <Component {...args} />;

export const Analyzer = Template.bind({});
Analyzer.args = {};
