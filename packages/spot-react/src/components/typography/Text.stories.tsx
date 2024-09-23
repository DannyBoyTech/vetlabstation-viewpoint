import { Meta, StoryFn } from "@storybook/react";

import { Text as TextComponent, TextProps } from "./Text";
import { LongFormText } from "./LongFormText";
import { Box } from "../layout";

const meta: Meta = {
  title: "spot-react/Typography/Text",
  component: TextComponent,
  argTypes: {
    as: {
      table: {
        disable: true,
      },
    },
    className: {
      table: {
        disable: true,
      },
    },
    fontWeight: {
      options: ["light", "normal", "bold"],
    },
    variant: {
      options: ["body", "secondary", "tertiary"],
    },
  },
};
export default meta;

export const Text: StoryFn<TextProps> = (args) => (
  <TextComponent {...args}>ABCDEFGHIJKLMN</TextComponent>
);

export const LongFormTextDefault: StoryFn = () => (
  <Box>
    <LongFormText>
      <TextComponent>Here is some text</TextComponent>
    </LongFormText>
  </Box>
);
