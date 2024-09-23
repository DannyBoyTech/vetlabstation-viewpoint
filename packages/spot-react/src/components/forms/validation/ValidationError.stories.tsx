import React from "react";
import { Meta, StoryFn } from "@storybook/react";
import {
  DefaultArgTypes,
  DefaultDecorator,
} from "../../../storybook-utils/storybook-utils";
import SpotValidationError, { ValidationErrorProps } from "./ValidationError";

export default {
  title: "spot-react/Forms/Validation Error",
  component: SpotValidationError,
  argTypes: {
    ...DefaultArgTypes,
    children: {
      defaultValue: "This is the error text",
      type: "string",
    },
  },
  decorators: [DefaultDecorator],
} as Meta;

export const ValidationError: StoryFn<ValidationErrorProps> = (args) => (
  <SpotValidationError {...args} />
);
