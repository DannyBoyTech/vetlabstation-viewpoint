import { Meta, StoryObj } from "@storybook/react";
import { SNAPColumn as SNAPColumnComponent } from "./SNAPColumn";
import { SNAPSpotPicker } from "./SNAPSpotPicker";
import { SpotText } from "@viewpoint/spot-react";

const meta: Meta<typeof SNAPColumnComponent> = {
  title: "viewpoint/SNAP/SNAPColumn",
  component: SNAPColumnComponent,
  argTypes: {},
};
export default meta;

type Story = StoryObj<typeof SNAPColumnComponent>;

export const Negative: Story = {
  args: {
    abnormal: false,
    label: <SpotText level="paragraph">Negative</SpotText>,
    image: (
      <SNAPSpotPicker
        onDotClicked={() => {}}
        dots={[
          {
            position: "TopCenter",
            selected: true,
            dotId: "1",
            filledColor: "#255e7f",
          },
        ]}
      />
    ),
  },
};

export const PositiveLowAntigen: Story = {
  args: {
    abnormal: true,
    label: (
      <>
        <div>Positive</div>
        <div>(Low Antigen)</div>
      </>
    ),
    image: (
      <SNAPSpotPicker
        onDotClicked={() => {}}
        dots={[
          {
            position: "TopCenter",
            selected: true,
            dotId: "1",
            filledColor: "#255e7f",
          },
          {
            position: "MiddleRight",
            selected: true,
            dotId: "3",
            filledColor: "#9db4cc",
          },
        ]}
      />
    ),
  },
};

export const PositiveHighAntigen: Story = {
  args: {
    abnormal: true,
    label: (
      <>
        <div>Positive</div>
        <div>(High Antigen)</div>
      </>
    ),
    image: (
      <SNAPSpotPicker
        onDotClicked={() => {}}
        dots={[
          {
            position: "TopCenter",
            selected: true,
            dotId: "1",
            filledColor: "#255e7f",
          },
          {
            position: "MiddleLeft",
            selected: true,
            dotId: "2",
            filledColor: "#9db4cc",
          },
          {
            position: "MiddleRight",
            selected: true,
            dotId: "3",
            filledColor: "#255e7f",
          },
        ]}
      />
    ),
  },
};
