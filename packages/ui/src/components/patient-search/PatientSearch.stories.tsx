import { Meta, StoryFn } from "@storybook/react";
import {
  PatientSearch as PatientSearchComponent,
  PatientSearchProps,
} from "./PatientSearch";
import { randomPatientDto } from "@viewpoint/test-utils";

const meta: Meta = {
  title: "viewpoint/PatientSearch",
  component: PatientSearchComponent,
};
export default meta;

const Template: StoryFn<PatientSearchProps> = (args) => (
  <PatientSearchComponent {...args} />
);

export const PatientSearch = Template.bind({});
PatientSearch.args = {
  results: new Array(20).fill(1).map(randomPatientDto),
};
