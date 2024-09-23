import React from "react";

import { Meta, StoryFn } from "@storybook/react";

import { Stack as StackComponent, StackProps } from "./Stack";
import { BlackBox } from "./BlackBox";

const meta: Meta = {
  title: "spot-react/Layout/Stack",
  component: StackComponent,
};

export default meta;

const StackTemplate: StoryFn<StackProps> = (args) => (
  <StackComponent {...args} />
);

export const Stack = StackTemplate.bind({});

Stack.args = {
  gutter: "12px",
  border: "1px solid green",
  padding: "12px",
  children: (
    <>
      <BlackBox />
      <BlackBox />
      <BlackBox />
      <BlackBox />
    </>
  ),
};
