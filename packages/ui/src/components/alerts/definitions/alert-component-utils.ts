import { AlertDto, InstrumentStatusDto, InstrumentType } from "@viewpoint/api";

export function isAcknowledgeAlert(alertDto: AlertDto) {
  return alertDto.args?.["fault-type"] === "ack";
}

export function canDismissUnmappedAcknowledgeAlert(
  instrumentStatus: InstrumentStatusDto
): boolean {
  // IVLS server is not able to accept the OK action for unmapped SVDx alerts,
  // so we shouldn't show a button that doesn't do anything
  return (
    instrumentStatus.instrument.instrumentType !== InstrumentType.SediVueDx
  );
}

export function getDefaultTextFromAlert(aletDto: AlertDto): string | undefined {
  return aletDto.args?.["default-text"] as string | undefined;
}
