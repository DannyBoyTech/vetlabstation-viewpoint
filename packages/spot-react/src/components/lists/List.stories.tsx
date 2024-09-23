import React, { Fragment } from "react";
import { Meta, StoryFn } from "@storybook/react";
import SpotList, { ListProps } from "./List";
import {
  DefaultArgTypes,
  DefaultDecorator,
} from "../../storybook-utils/storybook-utils";

export default {
  title: "spot-react/List",
  component: SpotList,
  argTypes: { DefaultArgTypes },
  decorators: [DefaultDecorator],
} as Meta;

export const SimpleList: StoryFn<
  ListProps & {
    items: string[];
    includeSeparators: boolean;
    includeIcons: boolean;
  }
> = ({ items, includeSeparators, includeIcons, ...args }) => {
  const [activeItem, setActiveItem] = React.useState<string>();
  return (
    <SpotList {...args}>
      {items.map((item, index) => (
        <SpotList.Item
          key={index}
          active={activeItem === item}
          onClick={() => setActiveItem(item)}
          separator={includeSeparators}
          iconName={includeIcons ? "menu" : undefined}
        >
          {item}
        </SpotList.Item>
      ))}
    </SpotList>
  );
};
SimpleList.args = {
  items: ["Apples", "Bananas", "Oranges", "Grapes"],
  includeSeparators: false,
  includeIcons: false,
} as ListProps;

export const NestedList: StoryFn<
  ListProps & { items: Array<string | string[]> }
> = ({ items, ...args }) => {
  const [activeItem, setActiveItem] = React.useState<string>();
  return (
    <SpotList {...args}>
      {items.map((item, index) => {
        if (typeof item === "string") {
          return (
            <SpotList.Item
              key={index}
              active={activeItem === item}
              onClick={() => setActiveItem(item)}
            >
              {item}
            </SpotList.Item>
          );
        } else {
          return (
            <Fragment key={index}>
              <SpotList.Header iconName="menu">{item[0]}</SpotList.Header>
              <SpotList nested={true}>
                {item.slice(1).map((subItem, index) => (
                  <SpotList.Item
                    key={index}
                    active={activeItem === subItem}
                    onClick={() => setActiveItem(subItem)}
                    nested
                  >
                    {subItem}
                  </SpotList.Item>
                ))}
              </SpotList>
            </Fragment>
          );
        }
      })}
    </SpotList>
  );
};

NestedList.args = {
  items: [
    "Home",
    "About",
    ["Vegetables", "Carrots", "Broccoli", "Asparagus"],
    ["Fruits", "Apples", "Bananas", "Oranges", "Grapes"],
  ],
};
