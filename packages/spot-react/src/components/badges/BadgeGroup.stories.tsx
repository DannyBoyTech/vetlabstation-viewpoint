import React from "react";
import { Meta, StoryFn } from "@storybook/react";
import { BadgeGroup as Component, BadgeGroupProps } from "../badges/BadgeGroup";
import { SpotIcon } from "@viewpoint/spot-icons";

const meta: Meta = {
  title: "spot-react/Badges/BadgeGroup",
  component: Component,
  argTypes: {
    placement: {
      defaultValue: "top-right",
    },
    visible: {
      defaultValue: true,
    },
    negative: {
      defaultValue: true,
    },
    badgeContent: {
      table: { disable: true },
    },
  },
};
export default meta;

const Template: StoryFn<BadgeGroupProps> = (args) => (
  <Component {...args}>
    <SpotIcon name="email" color="#00a7b5" size="2em" />
  </Component>
);

export const DotBadgeGroup = Template.bind({});
DotBadgeGroup.args = {
  type: "dot",
};

export const NumberBadgeGroup = Template.bind({});
NumberBadgeGroup.args = {
  badgeContent: 3,
  type: "short-text",
  color: "primary",
};

export const ShortTextBadgeGroup = Template.bind({});
ShortTextBadgeGroup.args = {
  badgeContent: "2k+",
  type: "short-text",
};

export const IconBadgeGroup = Template.bind({});
IconBadgeGroup.args = {
  badgeContent: (
    <SpotIcon name="alert-notification" size="1em" color="white"></SpotIcon>
  ),
  type: "short-text",
  color: "red",
};
