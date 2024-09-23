import { Meta, StoryFn } from "@storybook/react";
import { PatientPanel as Component, PatientPanelProps } from "./PatientPanel";
import {
  PatientWeightUnitsEnum,
  ReferenceClassType,
  SpeciesType,
} from "@viewpoint/api";
import { randomPatientDto, randomDoctor } from "@viewpoint/test-utils";

const meta: Meta = {
  title: "viewpoint/Patient Panel",
  component: Component,
  argTypes: {},
};
export default meta;

const Template: StoryFn<PatientPanelProps> = (args) => {
  return <Component {...args} />;
};

export const PatientPanel = Template.bind({});
PatientPanel.args = {
  patient: randomPatientDto({
    speciesDto: {
      id: 1,
      speciesName: SpeciesType.Canine,
      speciesClass: ReferenceClassType.LifeStage,
    },
  }),
  availableDoctors: new Array(5).fill(0).map(randomDoctor),
  displaySettings: {
    displayWeight: true,
    displayDoctorName: true,
    displayReasonForTesting: true,
    requireRequisitionId: true,
    displayRequisitionId: true,
  },
  weightUnits: PatientWeightUnitsEnum.POUNDS,
  availableRefClasses: [
    { refClassName: `Puppy`, id: 0, refClassSubTypeCode: "" },
    { refClassName: `Adult Canine`, id: 0, refClassSubTypeCode: "" },
    { refClassName: `Geriatric Canine`, id: 0, refClassSubTypeCode: "" },
  ],
} as PatientPanelProps;
