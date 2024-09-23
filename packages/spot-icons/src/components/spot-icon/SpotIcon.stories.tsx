import React from "react";
import { Meta, StoryFn } from "@storybook/react";
import { SpotIcon as SpotIconComponent, SpotIconProps } from "./SpotIcon";
import {
  DefaultArgTypes,
  DefaultDecorator,
} from "../../storybook-utils/storybool-utils";

export default {
  title: "spot-icons/Spot Icon",
  component: SpotIconComponent,
  argTypes: DefaultArgTypes,
  decorators: [DefaultDecorator],
} as Meta;

const Template: StoryFn<SpotIconProps> = (args) => (
  <SpotIconComponent {...args} />
);

export const SpotIcon = Template.bind({});
SpotIcon.args = {
  name: "add",
  color: "#00a7b5",
};
