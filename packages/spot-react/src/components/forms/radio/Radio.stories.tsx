import React from "react";
import { Meta, StoryFn } from "@storybook/react";
import {
  DefaultArgTypes,
  DefaultDecorator,
} from "../../../storybook-utils/storybook-utils";
import SpotRadio, { RadioProps } from "./Radio";

export default {
  title: "spot-react/Forms/Radio",
  component: SpotRadio,
  argTypes: {
    ...DefaultArgTypes,
    onChange: {
      action: "event",
    },
    disabled: {
      defaultValue: false,
      type: "boolean",
    },
    label: {
      defaultValue: "Pick me",
    },
  },
  decorators: [DefaultDecorator],
} as Meta;

export const Radio: StoryFn<RadioProps> = (args) => <SpotRadio {...args} />;
