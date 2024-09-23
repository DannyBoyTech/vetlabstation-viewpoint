import React from "react";
import { Meta, StoryFn } from "@storybook/react";
import {
  DefaultArgTypes,
  DefaultDecorator,
} from "../../storybook-utils/storybook-utils";
import {
  SearchBar as Component,
  SearchBarProps as ComponentProps,
} from "./SearchBar";
import { SearchBarInput } from "./SearchBarInput";
import { SearchBarButton } from "./SearchBarButton";

const meta: Meta = {
  title: "spot-react/Search Bar",
  component: Component,
  argTypes: {
    ...DefaultArgTypes,
    disabled: {
      defaultValue: false,
      type: "boolean",
    },
    lowPriority: {
      defaultValue: false,
      type: "boolean",
    },
    error: {
      defaultValue: false,
      type: "boolean",
    },
  },
  decorators: [DefaultDecorator],
};
export default meta;

const Template: StoryFn<ComponentProps> = (args) => (
  <Component
    {...args}
    onSubmit={(e) => {
      e.preventDefault();
      alert("submitted");
    }}
  >
    <SearchBarInput type="text" placeholder="Some nice placeholder" />
    <SearchBarButton type="submit" />
  </Component>
);

export const SearchBar = Template.bind({});
SearchBar.args = {};
