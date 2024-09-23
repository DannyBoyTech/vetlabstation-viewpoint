import React from "react";
import { Meta, StoryFn } from "@storybook/react";
import {
  DefaultArgTypes,
  DefaultDecorator,
} from "../../../storybook-utils/storybook-utils";
import SpotRadio, {
  RadioGroup as RadioGroupComponent,
  RadioGroupProps,
} from "./Radio";

export default {
  title: "spot-react/Forms/Radio Group",
  component: RadioGroupComponent,
  argTypes: {
    ...DefaultArgTypes,
    label: {
      defaultValue: "Select one of the options",
    },
    small: {
      defaultValue: false,
      type: "boolean",
    },
  },
  decorators: [DefaultDecorator],
} as Meta;

export const RadioGroup: StoryFn<RadioGroupProps & { small: boolean }> = ({
  small,
  ...args
}) => (
  <RadioGroupComponent {...args}>
    <SpotRadio label="Option 1" small={small} />
    <SpotRadio label="Option 2" small={small} />
    <SpotRadio label="Option 3" small={small} />
    <SpotRadio label="Option 4" small={small} />
  </RadioGroupComponent>
);
