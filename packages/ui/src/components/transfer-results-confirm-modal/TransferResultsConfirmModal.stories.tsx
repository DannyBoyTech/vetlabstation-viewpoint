import { useState } from "react";
import { Meta, StoryFn } from "@storybook/react";
import {
  TransferResultsConfirmModal as TransferResultsConfirmModalComponent,
  TransferResultsConfirmModalProps,
} from "./TransferResultsConfirmModal";
import {
  randomLabRequest,
  randomDoctor,
  randomPatientDto,
} from "@viewpoint/test-utils";
import faker from "faker";
import { Button } from "@viewpoint/spot-react";
import { PatientDto } from "@viewpoint/api";

const meta: Meta = {
  title: "viewpoint/Transfer Results",
  component: TransferResultsConfirmModalComponent,
};
export default meta;

type UsageProps = Omit<
  TransferResultsConfirmModalProps,
  "open" | "onConfirm" | "onClose"
>;

const Usage = ({
  labRequest,
  destPatientName,
  destClientFamilyName,
}: UsageProps) => {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <Button onClick={() => setOpen(true)}>Do Transfer</Button>
      <TransferResultsConfirmModalComponent
        open={open}
        labRequest={labRequest}
        destPatientName={destPatientName}
        destClientFamilyName={destClientFamilyName}
        onClose={() => setOpen(false)}
        onConfirm={() => setOpen(false)}
      />
    </div>
  );
};

const TransferResultsConfirmModalTemplate: StoryFn<UsageProps> = (args) => (
  <Usage {...args} />
);

const labRequest = randomLabRequest({
  doctorDto: randomDoctor(),
  requisitionId: faker.datatype.number(999999999999).toString(),
});

const destPatient: PatientDto = randomPatientDto();

export const TransferResultsConfirmModal =
  TransferResultsConfirmModalTemplate.bind({});
TransferResultsConfirmModal.args = {
  labRequest,
  destPatientName: destPatient.patientName,
  destClientFamilyName: destPatient.clientDto?.lastName,
};
