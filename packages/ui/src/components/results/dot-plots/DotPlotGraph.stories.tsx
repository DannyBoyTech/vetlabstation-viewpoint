import { Meta, StoryFn } from "@storybook/react";
import {
  DotPlotGraph as DotPlotGraphComponent,
  DotPlotGraphProps,
} from "./DotPlotGraph";

const meta: Meta = {
  title: "viewpoint/Dot Plots",
  component: DotPlotGraphComponent,
};
export default meta;

const RecentResultCardTemplate: StoryFn<DotPlotGraphProps> = (args) => (
  <div style={{ maxWidth: "500px" }}>
    <DotPlotGraphComponent {...args} />
  </div>
);

export const DotPlotGraph = RecentResultCardTemplate.bind({});
const args: DotPlotGraphProps = {
  imageUrl: "/dot-plots/d9f96a29-54d4-4ada-b831-508e4337631f.png",
  xAxisLabel: "Complexity",
  yAxisLabel: "Size",
  bordered: true,
  labelLevel: "paragraph",
};
DotPlotGraph.args = args;
