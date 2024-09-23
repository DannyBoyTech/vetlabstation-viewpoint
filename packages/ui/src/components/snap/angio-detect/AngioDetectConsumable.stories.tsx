import { Meta, StoryObj } from "@storybook/react";
import { AngioDetectConsumable as AngioDetectConsumableComponent } from "./AngioDetectConsumable";

const meta: Meta<typeof AngioDetectConsumableComponent> = {
  title: "viewpoint/SNAP/Angio Detect/AngioDetectConsumable",
  component: AngioDetectConsumableComponent,
  argTypes: {
    onIndicatorClick: { action: "onIndicatorClick" },
  },
};
export default meta;

type Story = StoryObj<typeof AngioDetectConsumableComponent>;

export const AngioDetectConsumable: Story = {
  args: {},
};
