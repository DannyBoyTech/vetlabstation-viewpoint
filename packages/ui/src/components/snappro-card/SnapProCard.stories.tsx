import { Meta, StoryFn } from "@storybook/react";
import { SnapProCard as Component, SnapProCardProps } from "./SnapProCard";
import { InstrumentStatus, InstrumentType } from "@viewpoint/api";

const meta: Meta = {
  title: "viewpoint/SnapProCard",
  component: Component,
};
export default meta;

const Template: StoryFn<SnapProCardProps> = (args) => <Component {...args} />;

export const SnapProCard = Template.bind({});
SnapProCard.args = {
  selected: true,
  status: {
    connected: true,
    instrumentStatus: InstrumentStatus.Ready,
    lastConnectedDate: 23423423423,
    instrument: {
      id: 12345,
      displayOrder: 1,
      maxQueueableRuns: 2,
      instrumentType: InstrumentType.SNAPPro,
      supportedRunConfigurations: [],
      instrumentSerialNumber: "a1234",
      softwareVersion: "1.0.1",
    },
  },
};
