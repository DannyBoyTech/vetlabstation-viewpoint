import React from "react";
import { Meta, StoryFn } from "@storybook/react";

import { SpotIcon } from "@viewpoint/spot-icons";

import { Link, LinkProps } from "./Link";

const meta: Meta = {
  title: "spot-react/Link",
  component: Link,
  argTypes: {
    size: {
      options: ["small", "medium", "large"],
      table: { defaultValue: "medium" },
    },
    iconLeft: {
      table: { disable: true },
    },
    iconRight: {
      table: { disable: true },
    },
  },
};
export default meta;

const LinkTemplate: StoryFn<LinkProps> = (args) => <Link {...args} />;

export const Links = LinkTemplate.bind({});
Links.args = {
  children: "Link",
  href: "#",
};

export const WithLeftIcon = LinkTemplate.bind({});
WithLeftIcon.args = {
  children: "Link",
  href: "#",
  iconLeft: <SpotIcon name="settings" />,
};

export const WithRightIcon = LinkTemplate.bind({});
WithRightIcon.args = {
  children: "Link",
  href: "#",
  iconRight: <SpotIcon name="caret-down" />,
};
