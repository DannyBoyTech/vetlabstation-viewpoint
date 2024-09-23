import React from "react";
import { Meta, StoryFn } from "@storybook/react";
import SpotSpinner, { SpinnerProps } from "./Spinner";
import {
  DefaultArgTypes,
  DefaultDecorator,
} from "../../storybook-utils/storybook-utils";

export default {
  title: "spot-react/Spinner",
  component: SpotSpinner,
  argTypes: DefaultArgTypes,
  decorators: [DefaultDecorator],
} as Meta;

export const Spinner: StoryFn<SpinnerProps> = (args) => (
  <SpotSpinner {...args} />
);
