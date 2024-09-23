import React from "react";
import { Meta, StoryFn } from "@storybook/react";
import {
  DefaultArgTypes,
  DefaultDecorator,
} from "../../../storybook-utils/storybook-utils";
import SpotCheckbox, { CheckboxProps } from "./Checkbox";

export default {
  title: "spot-react/Forms/Checkbox",
  component: SpotCheckbox,
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

export const Checkbox: StoryFn<CheckboxProps> = (args) => (
  <SpotCheckbox {...args} />
);

Checkbox.args = {
  label: "Check me",
};
