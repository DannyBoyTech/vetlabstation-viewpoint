import { Meta, StoryFn } from "@storybook/react";

import { Heading } from "./Heading";

import { Stack } from "../layout/Stack";

const meta: Meta = {
  title: "spot-react/Typography/Heading",
  component: Heading,
};
export default meta;

const Template: StoryFn = () => (
  <Stack gutter="12px">
    <Heading size={1}>Heading 1</Heading>
    <Heading size={2}>Heading 2</Heading>
    <Heading size={3}>Heading 3</Heading>
    <Heading size={4}>Heading 4</Heading>
    <Heading size={5}>Heading 5</Heading>
  </Stack>
);

export const TemplateName = Template.bind({});
TemplateName.args = {};
