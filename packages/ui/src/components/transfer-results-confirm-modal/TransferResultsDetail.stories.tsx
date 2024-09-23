import { Meta, StoryFn } from "@storybook/react";
import {
  TransferResultsDetail as TransferResultDetailComponent,
  TransferResultsDetailProps,
} from "./TransferResultsDetail";
import { randomDoctor, randomLabRequest } from "@viewpoint/test-utils";
import { LabRequestDto } from "@viewpoint/api";
import faker from "faker";

const meta: Meta = {
  title: "viewpoint/Transfer Results",
  component: TransferResultDetailComponent,
};
export default meta;

const TransferResultDetailTemplate: StoryFn<TransferResultsDetailProps> = (
  args
) => <TransferResultDetailComponent {...args} />;

export const TransferResultDetail = TransferResultDetailTemplate.bind({});

const labRequest: LabRequestDto = randomLabRequest({
  doctorDto: randomDoctor(),
  requisitionId: faker.datatype.number(999999999999).toString(),
});

TransferResultDetail.args = {
  labRequest,
};
