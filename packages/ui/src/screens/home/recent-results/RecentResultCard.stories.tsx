import { Meta, StoryFn } from "@storybook/react";
import {
  RecentResultCard as RecentResultCardComponent,
  RecentResultCardProps,
} from "./RecentResultCard";
import { InstrumentType, SpeciesType } from "@viewpoint/api";
import dayjs from "dayjs";

const meta: Meta = {
  title: "viewpoint/Recent Results",
  component: RecentResultCardComponent,
};
export default meta;

const RecentResultCardTemplate: StoryFn<RecentResultCardProps> = (args) => (
  <RecentResultCardComponent {...args} />
);

export const RecentResultCard = RecentResultCardTemplate.bind({});
const args: RecentResultCardProps = {
  result: {
    labRequestId: 1,
    patientName: "Maddie",
    pimsPatientId: "PAT9319",
    speciesName: SpeciesType.Canine,
    speciesId: 1,
    clientFirstName: "James",
    clientLastName: "May",
    clientId: "12345",
    testTypes: ["DeviceType.Urinalysis"],
    instrumentTypes: [InstrumentType.UAAnalyzer],
    dateRequested: new Date(Date.parse("2022-01-06 20:15:15.150Z")).getTime(),
    mostRecentRunDate: dayjs("2022-01-10T18:15:15.150Z").unix(),
    controlPatient: false,
  },
  skipAnimation: false,
  onClick: () => {},
};
RecentResultCard.args = args;
