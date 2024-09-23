import { Meta, StoryFn } from "@storybook/react";
import {
  ManualUAResultEntry as Component,
  ManualUAResultEntryProps,
} from "./ManualUAResultEntry";
import {
  AdditionalAssays,
  ChemistryTypes,
  ManualUAAssays,
} from "@viewpoint/api";

const meta: Meta = {
  title: "viewpoint/ResultEntry",
  component: Component,
};
export default meta;

const Template: StoryFn<ManualUAResultEntryProps> = (args) => (
  <div style={{ maxWidth: "812px", height: "768px", paddingLeft: "300px" }}>
    <Component {...args} />
  </div>
);

export const ManualUAEntry = Template.bind({});
ManualUAEntry.args = {
  availableAssays: (Object.values(ChemistryTypes) as ManualUAAssays[]).concat(
    Object.values(AdditionalAssays)
  ),
};
