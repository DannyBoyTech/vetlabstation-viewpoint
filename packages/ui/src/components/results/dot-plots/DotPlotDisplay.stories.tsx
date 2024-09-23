import { Meta, StoryFn } from "@storybook/react";
import {
  DotPlotDisplay as DotPlotDisplayComponent,
  DotPlotDisplayProps,
} from "./DotPlotDisplay";
import {
  DotPlotNodeDataResponse,
  InstrumentType,
  SampleTypeEnum,
  SpeciesType,
} from "@viewpoint/api";

const meta: Meta = {
  title: "viewpoint/Dot Plots",
  component: DotPlotDisplayComponent,
};
export default meta;

const RecentResultCardTemplate: StoryFn<DotPlotDisplayProps> = (args) => (
  <div style={{ maxWidth: "500px" }}>
    <DotPlotDisplayComponent {...args} />
  </div>
);

export const DotPlotDisplay = RecentResultCardTemplate.bind({});
const args: DotPlotDisplayProps = {
  metadata: {
    axisX: "COMPLEXITY",
    axisY: "SIZE",
    imageUrl: "/dot-plots/d9f96a29-54d4-4ada-b831-508e4337631f.png",
    sampleType: SampleTypeEnum.WHOLEBLOOD,
    legend: [
      { type: "RETICS", color: "ff00ff", translation: "RETICS" },
      {
        type: "RBC_FRAG",
        color: "ff8080",
        translation: "RBC Frags",
      },
      { type: "PLT", color: "0000ff", translation: "PLT" },
      {
        type: "WBC",
        color: "00c0c0",
        translation: "WBC",
      },
      { type: "RBC", color: "ff0000", translation: "RBC" },
    ],
    scattergramType: "RBC",
    dateCreated: new Date(),
  } as unknown as DotPlotNodeDataResponse,
  speciesType: SpeciesType.Canine,
  instrumentType: InstrumentType.ProCyteOne,
} as DotPlotDisplayProps;
DotPlotDisplay.args = args;
