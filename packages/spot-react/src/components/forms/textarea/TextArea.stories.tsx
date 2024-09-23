import React from "react";
import { Meta, StoryFn } from "@storybook/react";
import {
  DefaultArgTypes,
  DefaultDecorator,
} from "../../../storybook-utils/storybook-utils";
import SpotTextArea, { TextAreaProps } from "./TextArea";

export default {
  title: "spot-react/Forms/Text Area",
  component: SpotTextArea,
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
  },
  decorators: [DefaultDecorator],
} as Meta;

export const TextArea: StoryFn<TextAreaProps> = (args) => (
  <SpotTextArea {...args} />
);
