import { Meta, StoryFn } from "@storybook/react";
import {
  AnalyzerStatus as Component,
  AnalyzerStatusProps,
} from "./AnalyzerStatus";
import { InstrumentStatus, InstrumentType } from "@viewpoint/api";

const meta: Meta = {
  title: "viewpoint/AnalyzerStatus",
  component: Component,
};
export default meta;

const Template: StoryFn<AnalyzerStatusProps> = (args) => (
  <div style={{ display: "flex" }}>
    <Component {...args} />
  </div>
);

export const AnalyzerStatus = Template.bind({});

AnalyzerStatus.args = {
  status: InstrumentStatus.Ready,
  instrumentType: InstrumentType.ProCyteDx,
  instrumentName: "ProCyte Dx",
};
