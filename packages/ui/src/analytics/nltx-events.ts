/**
 * @file Exposes vendor-agnostic functions for tracking interesting events for analytics.
 */

import {
  ExecuteLabRequestDto,
  InstrumentStatusDto,
  InstrumentType,
  MaintenanceProcedure,
  MaintenanceResult,
  Settings,
} from "@viewpoint/api";
import { instrumentTypesById } from "../utils/instrument-utils";
import dayjs from "dayjs";

/**
 * A function that either sends analytics or does nothing, based on
 * whether the analytics API client is available.
 *
 * @param event
 * @param properties
 * @returns
 */
function nltxEvent(event: string, properties?: object) {
  return (window.heap?.track ?? (() => {}))(event, properties);
}

const NltxEventIds = {
  AppLoad: "app-load",
  LabRequest: "lab-request",
  LabRequestRun: "lab-request-run",
  MaintenanceResult: "maintenance-result",
  ResultPrinted: "result-printed",
  ResultTransferSuccess: "result-transfer-success",
  VideoEnded: "video-ended",
  VideoPause: "video-pause",
  VideoPlay: "video-play",
} as const;
type NltxEventId = (typeof NltxEventIds)[keyof typeof NltxEventIds];

/**
 * Records a simple event and logs success or failure.
 * NOTE: no exceptions are thrown from this function.
 *
 * @param event
 * @param properties
 */
function trackEvent(event: NltxEventId, properties?: object) {
  try {
    nltxEvent(event, properties);
    console.debug(`tracked ${event}`);
  } catch (e) {
    console.debug(`unable to track ${event}`, e);
  }
}

/**
 * Tracks a lab request submission and its contents.
 *
 * @param labReq
 * @param availableInstruments
 */
export function trackLabRequest(properties: {
  reqType: "new" | "add-append" | "add-merge" | "add-new";
  labReq: Partial<ExecuteLabRequestDto>;
  availableInstruments?: InstrumentStatusDto[];
}) {
  const { reqType, labReq, availableInstruments } = properties;

  try {
    const _instrumentTypesById = instrumentTypesById(availableInstruments);

    const eventId = crypto.randomUUID();
    const localTime = dayjs().format();
    const utcTime = dayjs().utc().format();

    nltxEvent(NltxEventIds.LabRequest, {
      id: eventId,
      reqType,
      requisitionId: labReq.requisitionId,
      patientId: labReq.patientId,
      localTime,
      utcTime,
    });

    const runDetails = labReq.instrumentRunDtos
      ?.map((run) => ({
        instrumentType: _instrumentTypesById[run.instrumentId],
        snapDeviceId: run.snapDeviceId,
      }))
      .filter((it) => it.instrumentType != null);

    runDetails?.forEach(({ instrumentType, snapDeviceId }) => {
      nltxEvent(NltxEventIds.LabRequestRun, {
        id: eventId,
        instrumentType,
        snapDeviceId,
      });
    });

    console.debug("tracked labreq");
  } catch (e) {
    console.debug("unable to track labreq", e);
  }
}

/**
 * Tracks the moment a video ends.
 * @param properties
 */
export function trackVideoEnded(properties?: { src?: string }) {
  trackEvent(NltxEventIds.VideoEnded, properties);
}

/**
 * Tracks the moment a video is paused.
 * @param properties
 */
export function trackVideoPause(properties?: { src?: string }) {
  trackEvent(NltxEventIds.VideoPause, properties);
}

/**
 * Tracks the moment a video plays.
 * @param properties
 */
export function trackVideoPlay(properties?: { src?: string }) {
  trackEvent(NltxEventIds.VideoPlay, properties);
}

export function trackResultPrinted(properties?: {
  type: "manual" | "auto";
  copies: number;
}) {
  trackEvent(NltxEventIds.ResultPrinted, properties);
}

export function trackResultTransferSuccess(properties: {
  labReqId: number;
  destPatientId: number;
}) {
  trackEvent(NltxEventIds.ResultTransferSuccess, properties);
}

export function trackMaintenanceResult(properties: {
  instrumentType: InstrumentType;
  procedure: MaintenanceProcedure;
  result: MaintenanceResult;
}) {
  trackEvent(NltxEventIds.MaintenanceResult, properties);
}

/**
 * Tracks a load (or reload) of the app.
 * @param settings - app settings
 */
export function trackAppLoad(settings: Settings) {
  trackEvent(NltxEventIds.AppLoad, settings);
}
