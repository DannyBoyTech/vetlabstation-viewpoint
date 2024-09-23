import { Meta, StoryFn } from "@storybook/react";
import {
  DefaultArgTypes,
  DefaultDecorator,
} from "../../storybook-utils/storybook-utils";
import { SpotText as SpotTextComponent, SpotTextProps } from "./Typography";

export default {
  title: "spot-react/Typography/Text",
  component: SpotTextComponent,
  argTypes: DefaultArgTypes,
  decorators: [DefaultDecorator],
} as Meta;

export const SpotText: StoryFn<SpotTextProps> = (args) => (
  <SpotTextComponent {...args} />
);
SpotText.args = {
  children: "Hello World",
};
