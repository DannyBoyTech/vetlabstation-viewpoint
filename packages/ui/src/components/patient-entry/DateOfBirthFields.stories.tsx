import { Meta, StoryFn } from "@storybook/react";
import {
  DateOfBirthFields as Component,
  DateOfBirthFieldsProps,
} from "./DateOfBirthFields";

const meta: Meta = {
  title: "viewpoint/DateOfBirthFields",
  component: Component,
};
export default meta;

const Template: StoryFn<DateOfBirthFieldsProps> = (args) => (
  <Component {...args} />
);

export const DateOfBirthFields = Template.bind({});

DateOfBirthFields.args = {
  dobInputValues: {
    month: "1",
    day: "1",
    year: "2023",
  },
  onChange: (dob) => console.log(dob),
};
