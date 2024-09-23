import React from "react";
import { Meta, StoryFn } from "@storybook/react";
import {
  Badge,
  BadgeProps,
  BADGE_COLOR_LIST,
  BADGE_PLACEMENT_LIST,
} from "./Badge";
import { SpotIcon } from "@viewpoint/spot-icons/src";

export default {
  title: "spot-react/Badges/Badge",
  component: Badge,
  args: {
    color: BADGE_COLOR_LIST[0],
    badgeContent: "5",
    children: <SpotIcon name="email" />,
    as: "span",
  },
  argTypes: {
    children: { control: false },
    as: { options: ["span", "div"], control: "radio" },

    color: {
      options: BADGE_COLOR_LIST,
      control: {
        type: "radio",
      },
    },
    placement: {
      options: BADGE_PLACEMENT_LIST,
      control: {
        type: "radio",
      },
    },
    variant: {
      options: ["default", "dot"],
      control: {
        type: "select",
      },
    },
    size: {
      options: ["default", "small", "large"],
      control: {
        type: "select",
      },
    },
    textSize: {
      options: ["default", "short"],
      control: {
        type: "select",
      },
    },
    hideBadge: {
      control: {
        type: "boolean",
      },
    },
  },
} as Meta;

const SingleTemplate: StoryFn<BadgeProps> = (args) => <Badge {...args} />;

const GroupTemplate: StoryFn<BadgeProps> = (args) => (
  <div className="example-list">
    {BADGE_COLOR_LIST.map((color) => (
      <Badge key={`badge-${color}`} {...args} color={color} />
    ))}
  </div>
);

export const BadgeComponent = SingleTemplate.bind({});

export const BadgeWithIcon = SingleTemplate.bind({});
BadgeWithIcon.args = {
  badgeContent: <SpotIcon name="alert-notification" />,
};
BadgeWithIcon.argTypes = {
  badgeContent: { control: false },
};

export const AllColors = GroupTemplate.bind({});
AllColors.argTypes = {
  color: {
    control: false,
  },
};
