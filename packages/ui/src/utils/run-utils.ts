import { LabRequestDto, QualityControlRunDto } from "@viewpoint/api";

export function isQcRequest(req?: LabRequestDto): boolean {
  return req?.patientDto.controlIndicator ?? false;
}

export function qcLotNumber(req?: LabRequestDto): string | undefined {
  if (!isQcRequest(req)) {
    return undefined;
  }
  return (req?.instrumentRunDtos?.[0] as QualityControlRunDto | undefined)
    ?.qualityControl?.lotNumber;
}
