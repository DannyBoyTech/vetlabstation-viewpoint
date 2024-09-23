import { LabRequestRecordDto } from "@viewpoint/api";

export function getPatientName(patientName: string, clientLastName?: string) {
  return `${patientName}${clientLastName ? ` ${clientLastName}` : ""}`;
}

export function sortRecords(
  records?: LabRequestRecordDto[]
): LabRequestRecordDto[] | undefined {
  if (records == null) {
    return undefined;
  }
  const sorted = [...records];
  sorted.sort(
    (recordTwo, recordOne) =>
      recordOne.labRequestDate - recordTwo.labRequestDate
  );
  return sorted;
}
