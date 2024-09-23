import { Meta, StoryFn } from "@storybook/react";
import {
  PatientSearchResult as PatientSearchResultComponent,
  PatientSearchResultProps,
} from "./PatientSearchResult";
import { randomPatientDto } from "@viewpoint/test-utils";

const meta: Meta = {
  title: "viewpoint/PatientSearch",
  component: PatientSearchResultComponent,
};
export default meta;

const Template: StoryFn<PatientSearchResultProps> = (args) => (
  <PatientSearchResultComponent {...args} />
);

export const PatientSearchResult = Template.bind({});
PatientSearchResult.args = {
  patient: randomPatientDto(),
};
