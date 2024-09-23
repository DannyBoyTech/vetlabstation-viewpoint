import React from "react";
import { Meta, StoryFn } from "@storybook/react";
import {
  DefaultArgTypes,
  DefaultDecorator,
} from "../../../storybook-utils/storybook-utils";
import SpotLabel, { LabelProps } from "./Label";

export default {
  title: "spot-react/Forms/Label",
  component: SpotLabel,
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
    text: {
      defaultValue: "Label text",
    },
  },
  decorators: [DefaultDecorator],
} as Meta;

export const Label: StoryFn<LabelProps & { text: string }> = ({
  text,
  ...args
}) => <SpotLabel {...args}>{text}</SpotLabel>;
