import React from "react";
import { Meta, StoryFn } from "@storybook/react";
import SpotProgressBar, { ProgressBarProps } from "./ProgressBar";
import {
  DefaultArgTypes,
  DefaultDecorator,
} from "../../storybook-utils/storybook-utils";

export default {
  title: "spot-react/Progress Bar",
  component: SpotProgressBar,
  argTypes: DefaultArgTypes,
  decorators: [DefaultDecorator],
} as Meta;

export const ProgressBar: StoryFn<ProgressBarProps> = (args) => (
  <div style={{ width: "300px", height: "100px" }}>
    <SpotProgressBar {...args} />
  </div>
);
