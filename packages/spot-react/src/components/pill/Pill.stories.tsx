import React from "react";
import { Meta, StoryFn } from "@storybook/react";
import {
  DefaultArgTypes,
  DefaultDecorator,
} from "../../storybook-utils/storybook-utils";
import SpotPill, { PillProps } from "./Pill";

export default {
  title: "spot-react/Pill",
  component: SpotPill,
  argTypes: {
    ...DefaultArgTypes,
  },
  decorators: [DefaultDecorator],
} as Meta;

export const Pill: StoryFn<PillProps> = (args) => <SpotPill {...args} />;

Pill.args = {
  children: "I'm a pill!",
};
