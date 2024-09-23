import { EventIds } from "@viewpoint/api";
import type { EventId } from "@viewpoint/api";

export const IvlsClientExchanges = [
  "/exchange/client.push.exchange",
  "/exchange/client.instrument.status.exchange",
  "/exchange/client.instrument.run.response.exchange",
  "/exchange/client.notification.exchange",
];

// The actual root class of the AMQP message sent from IVLS (specified in the DTO class in IVLS)
export const AmqpEventTypes = {
  // Pending list
  UpdatePendingList: "update_pending_list",

  // Lab Requests
  UpdateLabRequestList: "update_lab_request_list",
  LabRequestComplete: "lab-request-complete",

  // Instrument runs
  InstrumentRunComplete: "instrument-run-completed",
  InstrumentRunProgress: "instrument-run-progress",
  InstrumentRunStatus: "instrument-run-status",

  // Instruments
  InstrumentStatus: "instrumentStatusDto",
  DetailedInstrumentStatus: "detailedInstrumentStatusDto",
  InstrumentUpdate: "instrument-update",
} as const;

export type AmqpEventType =
  (typeof AmqpEventTypes)[keyof typeof AmqpEventTypes];

// AMQP -> Viewpoint event mappings
export const AmqpMappings: Record<AmqpEventType, EventId[]> = {
  [AmqpEventTypes.UpdatePendingList]: [EventIds.PendingRequestsUpdated],

  [AmqpEventTypes.UpdateLabRequestList]: [EventIds.RunningLabRequestsUpdated],
  [AmqpEventTypes.InstrumentRunProgress]: [EventIds.RunningLabRequestsUpdated],

  [AmqpEventTypes.LabRequestComplete]: [
    EventIds.RecentResultsUpdated,
    EventIds.RunningLabRequestsUpdated,
  ],
  [AmqpEventTypes.InstrumentRunComplete]: [
    EventIds.RecentResultsUpdated,
    EventIds.RunningLabRequestsUpdated,
  ],
  [AmqpEventTypes.InstrumentRunStatus]: [
    EventIds.RecentResultsUpdated,
    EventIds.RunningLabRequestsUpdated,
  ],

  [AmqpEventTypes.InstrumentStatus]: [EventIds.InstrumentStatusUpdated],
  [AmqpEventTypes.InstrumentUpdate]: [EventIds.InstrumentStatusUpdated],
  [AmqpEventTypes.DetailedInstrumentStatus]: [EventIds.InstrumentStatusUpdated],
};
