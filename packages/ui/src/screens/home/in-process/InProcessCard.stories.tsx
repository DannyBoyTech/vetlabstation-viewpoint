import { Meta, StoryFn } from "@storybook/react";
import {
  randomRunningInstrumentRun,
  randomRunningLabRequest,
  randomInstrumentStatus,
  randomFrom,
} from "@viewpoint/test-utils";
import {
  InProcessCard as Component,
  InProcessCardProps,
} from "./InProcessCard";
import {
  InstrumentRunStatus,
  InstrumentStatus,
  WorkRequestStatus,
} from "@viewpoint/api";
const meta: Meta = {
  title: "viewpoint/InProcess",
  component: Component,
};
export default meta;

const Template: StoryFn<InProcessCardProps> = (args) => {
  return (
    <div style={{ maxWidth: "315px", marginLeft: "50px" }}>
      <Component {...args} />
    </div>
  );
};

const instrumentStatuses = new Array(5).fill(0).map(() =>
  randomInstrumentStatus({
    instrumentStatus: randomFrom([
      InstrumentStatus.Busy,
      InstrumentStatus.Alert,
      InstrumentStatus.Offline,
      InstrumentStatus.Ready,
    ]),
  })
);
const instrumentRunDtos = instrumentStatuses.map((is) =>
  randomRunningInstrumentRun({
    instrumentId: is.instrument.id,
    status: randomFrom([
      InstrumentRunStatus.Running,
      InstrumentRunStatus.Alert,
    ]),
  })
);
const workRequestStatuses = instrumentRunDtos.reduce(
  (prev, curr) => ({
    ...prev,
    [curr.id]: { runStartable: true, runCancellable: false },
  }),
  {} as Record<number, WorkRequestStatus>
);
export const InProcessCard = Template.bind({});
InProcessCard.args = {
  labRequest: randomRunningLabRequest({
    instrumentRunDtos,
  }),
  instrumentStatuses,
  workRequestStatuses,
};
