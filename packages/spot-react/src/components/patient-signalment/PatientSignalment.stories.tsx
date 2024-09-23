import React from "react";
import { Meta, StoryFn } from "@storybook/react";
import {
  DefaultArgTypes,
  DefaultDecorator,
} from "../../storybook-utils/storybook-utils";
import SpotPatientSignalment, {
  PatientSignalmentProps,
} from "./PatientSignalment";

export default {
  title: "spot-react/Patient Signalment",
  component: SpotPatientSignalment,
  argTypes: {
    ...DefaultArgTypes,
    allowPhotoUpload: {
      defaultValue: true,
      type: "boolean",
    },
    photoUrl: {
      defaultValue: undefined,
      type: "string",
    },
    size: {
      options: ["large", "medium", "small", "xs"],
      defaultValue: undefined,
    },
    // Doesn't seem to be a ton of value having the event handlers render in the table -- instead we'll just add
    // custom boolean args to determine whether or not to define the on* event handlers
    onClickPatient: {
      table: {
        disable: true,
      },
    },
    onClickImage: {
      table: {
        disable: true,
      },
    },
  },
  decorators: [DefaultDecorator],
} as Meta;

interface Args extends PatientSignalmentProps {
  includeOnClickPatient: boolean;
  includeOnClickImage: boolean;
}

const args: Args = {
  patient: {
    name: "Fluffy",
    speciesName: "Canine",
    age: "13y",
    breed: "Boxer",
    patientId: "PAT12345",
    gender: "Male",
  },
  additionalPatientDetail: undefined,
  client: {
    familyName: "Jones",
  },
  size: "large",
  includeOnClickPatient: false,
  includeOnClickImage: false,
};

export const PatientSignalment: StoryFn<Args> = ({
  onClickPatient,
  onClickImage,
  ...args
}) => (
  <div style={{ display: "flex" }}>
    <SpotPatientSignalment
      {...args}
      onClickPatient={args.includeOnClickPatient ? onClickPatient : undefined}
      onClickImage={args.includeOnClickImage ? onClickImage : undefined}
    />
  </div>
);

PatientSignalment.args = {
  ...args,
};
