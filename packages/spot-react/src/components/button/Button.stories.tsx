import React from "react";
import { Meta, StoryFn } from "@storybook/react";
import SpotButton, { ButtonProps } from "./Button";
import {
  DefaultArgTypes,
  DefaultDecorator,
} from "../../storybook-utils/storybook-utils";

export default {
  title: "spot-react/Buttons/Button",
  component: SpotButton,
  argTypes: DefaultArgTypes,
  decorators: [DefaultDecorator],
} as Meta;

export const Button: StoryFn<ButtonProps> = (args) => <SpotButton {...args} />;
Button.args = {
  buttonType: "primary",
  buttonSize: "default",
  children: "Hello World",
};
