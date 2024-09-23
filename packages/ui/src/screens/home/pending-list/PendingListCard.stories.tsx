import { Meta, StoryFn } from "@storybook/react";
import { PendingListCard as PendingListItemComponent } from "./PendingListCard";
import { randomPimsRequestDto } from "@viewpoint/test-utils";
import { PendingListItemProps } from "./PendingListCard";

const meta: Meta = {
  title: "viewpoint/Pending List",
  component: PendingListItemComponent,
};
export default meta;

const PendingListItemTemplate: StoryFn<PendingListItemProps> = (args) => (
  <PendingListItemComponent {...args} />
);

export const PendingListItem = PendingListItemTemplate.bind({});
const args: PendingListItemProps = {
  request: randomPimsRequestDto(),
};
PendingListItem.args = args;
