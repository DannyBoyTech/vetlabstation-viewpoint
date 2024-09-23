import React from "react";
import { Meta, StoryFn } from "@storybook/react";
import {
  DefaultArgTypes,
  DefaultDecorator,
} from "../../../storybook-utils/storybook-utils";
import SpotSelect, { SelectProps } from "./Select";

export default {
  title: "spot-react/Forms/Select",
  component: SpotSelect,
  argTypes: {
    ...DefaultArgTypes,
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

export const Select: StoryFn<SelectProps> = (args) => (
  <SpotSelect {...args}>
    <SpotSelect.Option>Select an option</SpotSelect.Option>
    <SpotSelect.Option value="option_1">Option 1</SpotSelect.Option>
    <SpotSelect.Option value="option_2">Option 2</SpotSelect.Option>
    <SpotSelect.Option value="option_3">Option 3</SpotSelect.Option>
  </SpotSelect>
);
