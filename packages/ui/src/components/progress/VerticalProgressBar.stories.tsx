import type { Meta, StoryObj } from "@storybook/react";
import { VerticalProgressBar } from "./VerticalProgressBar";
import React from "react";

const meta: Meta<typeof VerticalProgressBar> = {
  component: VerticalProgressBar,
  decorators: [
    (Story) => (
      <div style={{ height: "300px" }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof VerticalProgressBar>;

export const Primary: Story = {
  args: {
    progress: 0.1,
  },
};
