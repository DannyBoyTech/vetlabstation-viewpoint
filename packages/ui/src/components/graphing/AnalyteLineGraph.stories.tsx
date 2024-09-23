import { Meta, StoryFn } from "@storybook/react";
import {
  AnalyteLineGraph as Component,
  AnalyteLineGraphProps,
} from "./AnalyteLineGraph";
import { InstrumentType } from "@viewpoint/api";
import React from "react";
import { LightModeResultColors } from "../results/result-utils";

const meta: Meta = {
  title: "viewpoint/Graphing",
  component: Component,
};

const Template: StoryFn<AnalyteLineGraphProps> = (args) => (
  <Component {...args} />
);

const AnalyteLineGraph = Template.bind({});

AnalyteLineGraph.args = {
  name: "Hematocrit",
  refLow: 37.3,
  refHigh: 61.7,
  resultColors: {
    low: LightModeResultColors.Red,
    high: LightModeResultColors.Red,
  },
  data: [
    {
      date: 1593517670000,
      value: 56.9,
      label: "56.9 %",
      source: InstrumentType.SediVueDx,
    },
    {
      date: 1594986470000,
      value: 51.2,
      label: "51.2 %",
      source: InstrumentType.SediVueDx,
    },
    {
      date: 1607317200000,
      value: 41.7,
      label: "41.7 %",
      source: InstrumentType.SNAPPro,
    },
    {
      date: 1610946000000,
      value: 38,
      label: "38.0 %",
      source: InstrumentType.VetLyte,
    },
    {
      date: 1612933200000,
      value: 43.6,
      label: "43.6 %",
      source: InstrumentType.ProCyteDx,
    },
    {
      date: 1619436800693,
      value: 42.9,
      label: "42.9 %",
      source: InstrumentType.ProCyteDx,
    },
  ].sort((a, b) => {
    return a.date - b.date;
  }),
  showYAxis: true,
};

export default meta;
export { AnalyteLineGraph };
