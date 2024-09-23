import type { ISSENotifier } from "./sse-router";
import type { MessageHandler, Subscriber } from "./amqp-subscriber";
import { AssayTypeIdentificationRequestEvent, Event, EventId, EventIds, ReagentStatusChangedDto } from "@viewpoint/api";
import { getLogger } from "./logger";
import type { ConsumeMessage } from "amqplib";
import { parseStringPromise } from "xml2js";
import { parseNumbers, parseBooleans } from "xml2js/lib/processors";

const logger = getLogger();

async function forwardClientEvents(subscriber: Subscriber, sseNotifier: ISSENotifier) {
  const vpSseHandler = createViewpointSSEMessageHandler(sseNotifier);

  subscriber.setExchangeHandlers({
    "client.instrument.run.response.exchange": vpSseHandler,
    "client.instrument.status.exchange": vpSseHandler,
    "client.mediaburner.exchange": vpSseHandler,
    "client.notification.exchange": vpSseHandler,
    "client.push.exchange": vpSseHandler,
    "client.usb.exchange": vpSseHandler,
  });

  await subscriber.resubscribe();
}

const IvlsEventIds = {
  // Pending list
  UpdatePendingList: "update_pending_list",
  UpdateCensusList: "update_census_list",

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
  InstrumentRemoved: "instrument-removed",
  InstrumentSettingResponse: "instrument-setting-response",
  InstrumentWaitingDto: "instrumentWaitingDto",
  SnapProInstrumentStatusDto: "snapProInstrumentStatusDto",
  SnapProInstrumentUpdateDto: "snappro-instrument-update",

  // User Prompt
  AssayTypeIdentificationRequest: "assay-type-identification-request",

  CuvetteStatusResponseDto: "cuvetteStatusResponseDto",

  // Fluid status
  FluidPackStatus: "fluidPackStatusResponseDto",

  // Instrument maintenance responses
  InstrumentMaintenanceResult: "instrumentMaintenanceResultDto",

  // Instrument procedure request acknowledges
  ProcedureAcceptedDto: "procedureAcceptedDto",

  // Instrument status updates
  Progress: "progress",

  // Instrument upgrade status updates
  InstrumentSoftwareUpgradeCompletedDto: "instrumentSoftwareUpgradeCompletedDto",

  // IVLS Setting events
  IvlsSettingUpdated: "propertyDto",

  // smart qc result events
  SmartQCResultDto: "smartQCResultDto",
  CatOneSmartQCResultDto: "catOneSmartQCResultDto",
  CatDxSmartQCResultDto: "catalystDxSmartQCResultDto",

  // catalyst smart QC reminder events
  CatalystSmartQcReminder: "catalystSmartQCReminderDto",

  // PCDx connection request
  ConnectionApprovalRequest: "connection-approval-request",

  ReagentStatusChanged: "reagentStatusChangedDto",

  PatientJobAccepted: "patient-job-accepted",

  // PIMS Results
  UnsentRunCount: "unsent-run-count",

  // USB Copy progress
  UsbCopyProgress: "usbCopyProgressDto",

  // Upgrade is available
  UpgradeAvailable: "upgrade",

  // Procedure was rejected
  ProcedureRejected: "procedureRejectedDto",

  // SmartService status
  SmartServiceStatus: "smartServiceAgentStatusDto",

  // SmartService offline notification
  SmartServiceAgentNotification: "smartServiceAgentNotificationDto",

  ConfigureRouterStatus: "configure_router_status",

  NotificationDto: "notificationDto",

  ShutDownDto: "shutDownDto",

  RemoteRestoreRequestDto: "remoteRestoreRequestDto",

  CalibrationOnlyRestoreDto: "calibrationOnlyRestoreDto",

  CalibrationResultDto: "calibrationResultDto",

  // SNAP timer
  InstrumentRunTimerFinished: "instrument-run-timer-finished",

  // Restart notification
  RestartNotificationDto: "restartNotificationDto",

  // File Upload to jackalope
  InstrumentRunFileUploadCompleteDto: "instrumentRunFileUploadCompleteDto",

  FeatureFlagStatusDto: "featureFlagStatusDto",

  ResultStatusNotificationDto: "resultStatusNotificationDto",
} as const;

const IvlsEventIdsSet = new Set(Object.values(IvlsEventIds) as string[]);

type IvlsEventId = (typeof IvlsEventIds)[keyof typeof IvlsEventIds];

const IvlsToVPEventMappings: Record<IvlsEventId, EventId[]> = {
  [IvlsEventIds.UpdatePendingList]: [EventIds.PendingRequestsUpdated],
  [IvlsEventIds.UpdateCensusList]: [EventIds.PendingRequestsUpdated],

  [IvlsEventIds.UpdateLabRequestList]: [EventIds.RunningLabRequestsUpdated],
  [IvlsEventIds.InstrumentRunProgress]: [EventIds.RunningLabRequestsUpdated, EventIds.InstrumentRunProgress],

  [IvlsEventIds.LabRequestComplete]: [
    EventIds.RecentResultsUpdated,
    EventIds.RunningLabRequestsUpdated,
    EventIds.LabRequestComplete,
  ],
  [IvlsEventIds.InstrumentRunComplete]: [EventIds.RecentResultsUpdated, EventIds.RunningLabRequestsUpdated],
  [IvlsEventIds.InstrumentRunStatus]: [EventIds.RecentResultsUpdated, EventIds.RunningLabRequestsUpdated],

  [IvlsEventIds.InstrumentStatus]: [EventIds.InstrumentStatusUpdated],
  [IvlsEventIds.InstrumentUpdate]: [EventIds.InstrumentStatusUpdated],
  [IvlsEventIds.DetailedInstrumentStatus]: [EventIds.InstrumentStatusUpdated, EventIds.DetailedInstrumentStatusUpdated],
  [IvlsEventIds.InstrumentRemoved]: [EventIds.InstrumentStatusUpdated],
  [IvlsEventIds.InstrumentWaitingDto]: [EventIds.InstrumentWaiting],

  [IvlsEventIds.AssayTypeIdentificationRequest]: [EventIds.AssayTypeIdentificationRequest],
  [IvlsEventIds.InstrumentSettingResponse]: [EventIds.InstrumentSettingsUpdated],
  [IvlsEventIds.InstrumentSoftwareUpgradeCompletedDto]: [EventIds.InstrumentSoftwareUpgradeCompleted],

  [IvlsEventIds.CuvetteStatusResponseDto]: [EventIds.CuvetteStatusUpdate],

  [IvlsEventIds.FluidPackStatus]: [EventIds.FluidPackStatusUpdate],

  [IvlsEventIds.InstrumentMaintenanceResult]: [EventIds.InstrumentMaintenanceResult],
  [IvlsEventIds.ProcedureAcceptedDto]: [EventIds.MaintenanceProcedureAccepted],
  [IvlsEventIds.Progress]: [EventIds.InstrumentProgress],

  [IvlsEventIds.IvlsSettingUpdated]: [EventIds.IvlsSettingUpdated],
  [IvlsEventIds.SmartQCResultDto]: [EventIds.SmartQCResult],
  [IvlsEventIds.CatOneSmartQCResultDto]: [EventIds.CatalystSmartQCResult],
  [IvlsEventIds.CatDxSmartQCResultDto]: [EventIds.CatalystSmartQCResult],
  [IvlsEventIds.CatalystSmartQcReminder]: [EventIds.CatalystSmartQcReminder],

  [IvlsEventIds.ConnectionApprovalRequest]: [EventIds.ConnectionApprovalRequest],

  [IvlsEventIds.ReagentStatusChanged]: [EventIds.ReagentStatusChanged],

  [IvlsEventIds.PatientJobAccepted]: [EventIds.PatientJobAccepted],
  [IvlsEventIds.SnapProInstrumentStatusDto]: [EventIds.SnapProInstrumentStatusUpdated],
  [IvlsEventIds.SnapProInstrumentUpdateDto]: [EventIds.SnapProInstrumentSoftwareUpdated],

  [IvlsEventIds.UsbCopyProgress]: [EventIds.UsbCopyProgress],

  [IvlsEventIds.UpgradeAvailable]: [EventIds.UpgradeAvailable],
  [IvlsEventIds.ProcedureRejected]: [EventIds.ProcedureRejected],

  [IvlsEventIds.SmartServiceStatus]: [EventIds.SmartServiceStatus],
  [IvlsEventIds.SmartServiceAgentNotification]: [EventIds.SmartServiceAgentNotification],

  [IvlsEventIds.ConfigureRouterStatus]: [EventIds.RouterConfigResult],

  [IvlsEventIds.NotificationDto]: [EventIds.MessageUpdated],

  [IvlsEventIds.ShutDownDto]: [EventIds.IvlsShuttingDown],

  [IvlsEventIds.RemoteRestoreRequestDto]: [EventIds.RemoteRestoreRequest],

  [IvlsEventIds.CalibrationOnlyRestoreDto]: [EventIds.CalibrationRestore],

  [IvlsEventIds.CalibrationResultDto]: [EventIds.CalibrationResult],

  [IvlsEventIds.UnsentRunCount]: [EventIds.PimsUnsentRunCount],

  [IvlsEventIds.InstrumentRunTimerFinished]: [EventIds.InstrumentRunTimerComplete],

  [IvlsEventIds.RestartNotificationDto]: [EventIds.RestartNotification],

  [IvlsEventIds.InstrumentRunFileUploadCompleteDto]: [EventIds.FileUploadComplete],

  [IvlsEventIds.FeatureFlagStatusDto]: [EventIds.FeatureFlagStatus],

  [IvlsEventIds.ResultStatusNotificationDto]: [EventIds.ResultStatusNotification],
};

const customEventConversions: Partial<Record<EventId, (ivlsEvent: any, eventId: EventId) => Event>> = {
  [EventIds.AssayTypeIdentificationRequest]: objToAssayTypeIdentificationRequestEvent,
  [EventIds.InstrumentSettingsUpdated]: objToSpreadEvent,
  [EventIds.InstrumentSoftwareUpgradeCompleted]: objToSpreadEvent,
  [EventIds.CuvetteStatusUpdate]: objToSpreadEvent,
  [EventIds.FluidPackStatusUpdate]: objToSpreadEvent,
  [EventIds.InstrumentMaintenanceResult]: objToSpreadEvent,
  [EventIds.MaintenanceProcedureAccepted]: objToSpreadEvent,
  [EventIds.InstrumentProgress]: (ivlsEvent) => ({
    ...objToSpreadEvent(ivlsEvent, EventIds.InstrumentProgress),
    progressType: ivlsEvent.progress["progress-type"],
  }),
  [EventIds.InstrumentWaiting]: objToSpreadEvent,
  [EventIds.SmartQCResult]: objToSpreadEvent,
  [EventIds.CatalystSmartQCResult]: objToSpreadEvent,
  [EventIds.ConnectionApprovalRequest]: objToSpreadEvent,
  [EventIds.PatientJobAccepted]: objToSpreadEvent,
  [EventIds.InstrumentRunProgress]: (ivlsEvent) => ({
    ...objToSpreadEvent(ivlsEvent, EventIds.InstrumentRunProgress),
    progressType: ivlsEvent["instrument-run-progress"]["progress-type"],
    instrumentRunId: ivlsEvent["instrument-run-progress"]["instrumentrun-id"],
  }),
  [EventIds.ReagentStatusChanged]: (ivlsEvent) => {
    const spread: ReagentStatusChangedDto = objToSpreadEvent(ivlsEvent, "reagent_status_changed");
    if (spread.reminderKeys != null && !Array.isArray(spread.reminderKeys)) {
      spread.reminderKeys = [spread.reminderKeys];
    }
    return spread;
  },
  [EventIds.SnapProInstrumentStatusUpdated]: objToSpreadEvent,
  [EventIds.SnapProInstrumentSoftwareUpdated]: objToSpreadEvent,
  [EventIds.UsbCopyProgress]: (ivlsEvent) => ({
    ...objToSpreadEvent(ivlsEvent, "usb_copy_progress"),
    copyId: ivlsEvent.usbCopyProgressDto.id,
  }),
  [EventIds.UpgradeAvailable]: objToSpreadEvent,
  [EventIds.ProcedureRejected]: objToSpreadEvent,
  [EventIds.SmartServiceStatus]: objToSpreadEvent,
  [EventIds.SmartServiceAgentNotification]: objToSpreadEvent,
  [EventIds.RouterConfigResult]: objToSpreadEvent,
  [EventIds.IvlsSettingUpdated]: objToSpreadEvent,
  [EventIds.MessageUpdated]: (ivlsEvent) => {
    const { guid, ...rest } = objToSpreadEvent<any>(ivlsEvent, EventIds.MessageUpdated);
    return {
      ...rest,
      guid: `${guid}`, // Ensure GUID is always a string,
    };
  },
  [EventIds.LabRequestComplete]: (ivlsEvent) => {
    const { "lab-request-id": labRequestId, ...entriesToKeep } = objToSpreadEvent<any>(
      ivlsEvent,
      "lab_request_complete"
    );
    return {
      ...entriesToKeep,
      labRequestId,
    };
  },
  [EventIds.IvlsShuttingDown]: objToSpreadEvent,
  [EventIds.RemoteRestoreRequest]: objToSpreadEvent,
  [EventIds.CalibrationRestore]: objToSpreadEvent,
  [EventIds.CalibrationResult]: objToSpreadEvent,
  [EventIds.InstrumentRunTimerComplete]: (ivlsEvent) => {
    const { "labrequest-dto": labRequestDto, "instrumentrun-dto": instrumentRunDto } = objToSpreadEvent<any>(
      ivlsEvent,
      EventIds.InstrumentRunTimerComplete
    );
    return { id: EventIds.InstrumentRunTimerComplete, labRequestDto, instrumentRunDto };
  },
  [EventIds.RestartNotification]: objToSpreadEvent,
  [EventIds.FileUploadComplete]: objToSpreadEvent,
  [EventIds.FeatureFlagStatus]: objToSpreadEvent,
  [EventIds.DetailedInstrumentStatusUpdated]: objToSpreadEvent,
  [EventIds.ResultStatusNotification]: objToSpreadEvent,
  [EventIds.CatalystSmartQcReminder]: objToSpreadEvent,
};

function entries(obj?: object): [string, unknown][] | null {
  if (typeof obj !== "object") {
    return null;
  }

  return Object.entries(obj);
}

function findIvlsEventIdInObj(obj?: object): IvlsEventId | null {
  const [firstChildName] = entries(obj)?.[0] ?? [];
  return firstChildName != null && IvlsEventIdsSet.has(firstChildName) ? (firstChildName as IvlsEventId) : null;
}

function ivlsEventIdToVpEventIds(ivlsEvt?: IvlsEventId): EventId[] {
  if (ivlsEvt != null) {
    const eventIds = IvlsToVPEventMappings[ivlsEvt];

    if (eventIds != null) {
      return [...eventIds];
    }
  }
  return [];
}

function objToAssayTypeIdentificationRequestEvent(obj: any, eventId: EventId): AssayTypeIdentificationRequestEvent {
  if (eventId !== EventIds.AssayTypeIdentificationRequest) {
    throw new Error(`illegal argument passed for eventId: ${eventId}`);
  }

  const expectedIvlsEventId = IvlsEventIds.AssayTypeIdentificationRequest;

  const ivlsEventId = findIvlsEventIdInObj(obj);

  if (ivlsEventId == null || ivlsEventId != expectedIvlsEventId) {
    throw new Error(`failed to convert event to ${eventId} because event is not ${expectedIvlsEventId}`);
  }

  const instrumentRunId = Number(obj[ivlsEventId]?.["instrumentrun-id"]);

  return { id: eventId, instrumentRunId };
}

/**
 * Creates a new Event from an existing ivls event object.
 *
 * IMPORTANT: This method will only work correctly if the output event has exactly
 * the same fields and types as the input (minus the id field), and therefore, the data is a
 * 'spread' of the original object (hence the name).
 *
 * @param obj
 * @param eventId
 * @returns an Event formed by spreading the input ivls event props into a new event with the given eventId
 *
 */
function objToSpreadEvent<T extends Event>(obj: any, eventId: T["id"]): T {
  const supportedIvlsEventIds = Object.entries(IvlsToVPEventMappings)
    .filter(([_, toEventIds]) => toEventIds.includes(eventId))
    .reduce((acc, [ivlsEventId]) => acc.add(ivlsEventId as IvlsEventId), new Set<IvlsEventId>());

  const ivlsEventId = findIvlsEventIdInObj(obj);

  if (ivlsEventId == null || !supportedIvlsEventIds.has(ivlsEventId)) {
    throw new Error(`failed to convert event to ${eventId} because conversion from ${ivlsEventId} is not supported`);
  }

  return {
    ...obj[ivlsEventId],
    id: eventId,
  };
}

function objToDefaultEvent(obj: any, eventId: EventId): Event {
  const ivlsEventId = findIvlsEventIdInObj(obj);
  if (ivlsEventId == null) {
    throw new Error(`failed to convert event to ${eventId} because event: couldn't locate event id`);
  }

  return { id: eventId };
}

function ivlsEventToVpEvent(obj: any, eventId: EventId): Event {
  const conversion = customEventConversions[eventId] ?? objToDefaultEvent;
  return conversion(obj, eventId);
}

function ivlsEventObjToVpEvents(obj: any): Event[] {
  const ivlsEventId = findIvlsEventIdInObj(obj);
  if (ivlsEventId != null) {
    const vpEventIds = ivlsEventIdToVpEventIds(ivlsEventId);
    return vpEventIds?.map((eventId) => ivlsEventToVpEvent(obj, eventId)) ?? [];
  }
  logger.debug(`unknown event: ${JSON.stringify(obj)}`);
  return [];
}

async function convertXmlToObject(xmlStr?: string): Promise<object | undefined> {
  if (xmlStr === undefined) return undefined;

  return await parseStringPromise(xmlStr, {
    valueProcessors: [parseNumbers, parseBooleans],
    emptyTag: undefined,
    explicitArray: false,
  });
}

async function ivlsEventXmlToVpEvents(xmlEvt: string): Promise<Event[]> {
  try {
    const obj = await convertXmlToObject(xmlEvt);
    if (obj != null) {
      return ivlsEventObjToVpEvents(obj);
    }
  } catch (e) {
    logger.warn(`error processing ${xmlEvt}: ${e}`);
  }
  return [];
}

async function msgToVpEvents(msg: ConsumeMessage) {
  const xmlStr = msg.content.toString("utf8");
  return await ivlsEventXmlToVpEvents(xmlStr);
}

function createViewpointSSEMessageHandler(sseNotifier: ISSENotifier): MessageHandler {
  return async (msg: ConsumeMessage) => {
    (await msgToVpEvents(msg)).forEach((e) => {
      logger.debug(`event on ${msg.fields.exchange}: ${JSON.stringify(e)}`);
      sseNotifier.notifyListeners(JSON.stringify(e), e.id);
    });
  };
}

export { forwardClientEvents, ivlsEventXmlToVpEvents };
