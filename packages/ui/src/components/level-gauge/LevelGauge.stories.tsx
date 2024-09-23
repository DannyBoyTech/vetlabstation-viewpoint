import { Meta, StoryFn } from "@storybook/react";
import { LevelGauge as Component, LevelGaugeProps } from "./LevelGauge";
import { SheathGauge, SheathGaugeProps } from "./SheathGauge";
import { ReagentGauge, ReagentGaugeProps } from "./ReagentGauge";

const meta: Meta = {
  title: "viewpoint/LevelGauge",
  component: Component,
  argTypes: {
    className: {
      table: { disable: true },
    },
  },
};
export default meta;

const Template: StoryFn<LevelGaugeProps> = (args) => <Component {...args} />;

export const LevelGauge = Template.bind({});
LevelGauge.args = {
  percentFull: 34,
};

export const LoadingLevelGauge = Template.bind({});
LoadingLevelGauge.args = {
  percentFull: undefined,
};

export const SheathGaugeStory: StoryFn<SheathGaugeProps> = (args) => (
  <SheathGauge {...args} />
);
SheathGaugeStory.storyName = "Sheath Gauge";
SheathGaugeStory.args = {
  percentFull: 77,
};

export const ReagentGaugeStory: StoryFn<ReagentGaugeProps> = (args) => (
  <ReagentGauge {...args} />
);
ReagentGaugeStory.storyName = "Reagent Gauge";
ReagentGaugeStory.args = {
  percentFull: 33.3,
};
