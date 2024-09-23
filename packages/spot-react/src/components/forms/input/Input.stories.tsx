import React from "react";
import { Meta, StoryFn } from "@storybook/react";
import {
  DefaultArgTypes,
  DefaultDecorator,
} from "../../../storybook-utils/storybook-utils";
import SpotInput, { InputProps } from "./Input";

export default {
  title: "spot-react/Forms/Input",
  component: SpotInput,
  argTypes: {
    ...DefaultArgTypes,
    placeholder: {
      defaultValue: "Placeholder",
      type: "string",
    },
    onChange: {
      action: "event",
    },
    readOnly: {
      defaultValue: false,
      type: "boolean",
    },
    disabled: {
      defaultValue: false,
      type: "boolean",
    },
  },
  decorators: [DefaultDecorator],
} as Meta;

export const Input: StoryFn<InputProps> = (args) => <SpotInput {...args} />;
