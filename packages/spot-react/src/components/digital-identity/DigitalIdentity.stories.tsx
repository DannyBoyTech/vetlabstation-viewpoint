import React from "react";
import { Meta, StoryFn } from "@storybook/react";
import {
  DigitalIdentity as Component,
  DigitalIdentityProps,
} from "./DigitalIdentity";

const meta: Meta = {
  title: "spot-react/Digital Identity",
  component: Component,
};
export default meta;

const Template: StoryFn<DigitalIdentityProps> = (args) => (
  <Component {...args} />
);

export const DigitalIdentity = Template.bind({});
DigitalIdentity.args = {
  name: "Johnny Appleseed",
};
