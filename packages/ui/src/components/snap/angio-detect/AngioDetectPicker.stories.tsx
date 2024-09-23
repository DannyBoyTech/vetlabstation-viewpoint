import { Meta, StoryObj } from "@storybook/react";
import { AngioDetectPicker as AngioDetectPickerComponent } from "./AngioDetectPicker";

const meta: Meta<typeof AngioDetectPickerComponent> = {
  title: "viewpoint/SNAP/Angio Detect/AngioDetectPicker",
  component: AngioDetectPickerComponent,
  argTypes: {
    onIndicatorClick: { action: "onIndicatorClick" },
  },
};
export default meta;

type Story = StoryObj<typeof AngioDetectPickerComponent>;

export const AngioDetectPicker: Story = {
  args: {},
};
