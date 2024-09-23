import React from "react";
import { Meta, StoryFn } from "@storybook/react";
import {
  DefaultArgTypes,
  DefaultDecorator,
} from "../../../storybook-utils/storybook-utils";
import SpotToggle, { ToggleProps } from "./Toggle";

export default {
  title: "spot-react/Forms/Toggle",
  component: SpotToggle,
  argTypes: {
    ...DefaultArgTypes,
    placeholder: {
      defaultValue: "Placeholder",
      type: "string",
    },
    onChange: {
      action: "event",
    },
    disabled: {
      defaultValue: false,
      type: "boolean",
    },
  },
  decorators: [DefaultDecorator],
} as Meta;

export const Toggle: StoryFn<ToggleProps> = (args) => <SpotToggle {...args} />;

Toggle.args = {
  label: "Toggle me",
};
