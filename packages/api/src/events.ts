import type {
  CuvetteStatusResponseDto,
  InstrumentDto,
  InstrumentWaitingReason,
  MaintenanceProcedureCode,
  ProgressType,
  RunningInstrumentRunDto,
  RunningLabRequestDto,
  SmartQCResult,
  SnapProInstrumentStatusDto,
  SnapProInstrumentUpdateDto,
  SettingTypeEnum,
  SmartServiceStatus,
  RestoreRequestDto,
  ModeEnum,
  RestoreSource,
  Message,
  LabRequestCompleteDto,
  CalibrationResultDto,
  FeatureFlagName,
  DetailedInstrumentStatusDto,
  ResultStatusNotificationDto,
} from "./ivls/generated/ivls-api";
import type { QcLotDto } from "./quality-control";

const EventIds = {
  PendingRequestsUpdated: "pending_requests_updated",
  PimsUnsentRunCount: "unsent-run-count",
  InstrumentStatusUpdated: "instrument_status_updated",
  InstrumentSoftwareUpgradeCompleted: "instrument_software_upgrade_completed",
  RecentResultsUpdated: "recent_results_updated",
  RunningLabRequestsUpdated: "running_lab_requests_updated",
  AssayTypeIdentificationRequest: "assay_type_identification_request",
  InstrumentSettingsUpdated: "instrument_settings_updated",
  CuvetteStatusUpdate: "cuvette_status_update",
  FluidPackStatusUpdate: "fluid_pack_status_update",
  InstrumentMaintenanceResult: "instrument_maintenance_result",
  MaintenanceProcedureAccepted: "maintenance_procedure_accepted",
  InstrumentProgress: "instrument_progress",
  InstrumentRunProgress: "instrument_run_progress",
  IvlsSettingUpdated: "ivls_setting_updated",
  SmartQCResult: "smart_qc_result",
  CatalystSmartQCResult: "catalyst_smart_qc_result",
  ConnectionApprovalRequest: "connection_approval_request",
  ReagentStatusChanged: "reagent_status_changed",
  PatientJobAccepted: "patient_job_accepted",
  InstrumentWaiting: "instrument_waiting",
  SnapProInstrumentStatusUpdated: "snap_pro_instrument_status_updated",
  SnapProInstrumentSoftwareUpdated: "snap_pro_instrument_software_updated",
  UsbCopyProgress: "usb_copy_progress",
  UpgradeAvailable: "upgrade_available",
  ProcedureRejected: "procedure_rejected",
  RouterConfigResult: "router_config_result",
  SmartServiceStatus: "smart-service-status",
  IvlsConnectionStatus: "ivls-connection-status",
  MessageUpdated: "message_updated",
  IvlsShuttingDown: "ivls_shutting_down",
  LabRequestComplete: "lab_request_complete",
  RemoteRestoreRequest: "remote_restore_request",
  CalibrationRestore: "calibration_restore",
  CalibrationResult: "calibration_result",
  InstrumentRunTimerComplete: "instrument_run_timer_complete",
  RestartNotification: "restart_notification",
  FileUploadComplete: "file_upload_complete",
  SmartServiceAgentNotification: "smart_service_agent_notification",
  FeatureFlagStatus: "feature_flag_status",
  DetailedInstrumentStatusUpdated: "detailed_instrument_status_updated",
  ResultStatusNotification: "result_status_notification",
  CatalystSmartQcReminder: "catalyst_smart_qc_reminder",
} as const;

type EventId = (typeof EventIds)[keyof typeof EventIds];

interface Event {
  id: EventId;
}

interface PendingRequestUpdatedEvent extends Event {
  id: "pending_requests_updated";
}

interface PimsUnsentRunCount extends Event {
  id: "unsent-run-count";
}

interface InstrumentStatusUpdatedEvent extends Event {
  id: "instrument_status_updated";
}

interface InstrumentUpgradeStatusCompletedEvent extends Event {
  id: "instrument_software_upgrade_completed";
  instrument: InstrumentDto;
  success: boolean;
  hasUpgradeLetter: boolean;
  upgradeLetterTransferSuccess: boolean;
}

interface RecentResultsUpdatedEvent extends Event {
  id: "recent_results_updated";
}

interface RunningLabRequestUpdatedEvent extends Event {
  id: "running_lab_requests_updated";
}

interface AssayTypeIdentificationRequestEvent extends Event {
  id: "assay_type_identification_request";
  instrumentRunId: number;
}

type CuvetteStatusUpdateEvent = {
  id: "cuvette_status_update";
} & CuvetteStatusResponseDto;

interface FluidPackStatusResponseDto extends Event {
  id: "fluid_pack_status_update";
  instrumentId: number;
  packType: "Sheath" | "Reagent";
  daysLeft?: number;
  percentLeft?: number;
  runsLeft?: number;
}

interface MaintenanceProcedureAcceptedEvent extends Event {
  id: "maintenance_procedure_accepted";
  instrumentId: number;
  procedure: `${MaintenanceProcedureCode}`;
}

interface InstrumentProgressEvent extends Event {
  id: "instrument_progress";
  instrumentId: number;
  progress: number;
  progressType: `${ProgressType}`;
}

interface SmartQCResultEvent extends Event {
  id: "smart_qc_result";
  instrumentId: number;
  result: `${SmartQCResult}`;
  notify: boolean;
}

interface CatalystSmartQCResultEvent extends Event {
  id: "catalyst_smart_qc_result";
  instrumentId: number;
  result: `${SmartQCResult}`;
  notify: boolean;
}

interface ConnectionApprovalRequestEvent extends Event {
  id: "connection_approval_request";
  instrument: InstrumentDto;
}

interface ReagentStatusChangedDto extends Event {
  id: "reagent_status_changed";
  instrumentId: number;
  reagentKitPercentage: number; // between 0.0 and 1.0
  stainPackPercentage: number; // between 0.0 and 1.0
  reagentKitDaysLeft?: number;
  stainPackDaysLeft?: number;
  reminderKeys?: string[];
}

interface PatientJobAcceptedDto extends Event {
  id: "patient_job_accepted";
  "lab-request": RunningLabRequestDto;
  "instrument-run": RunningInstrumentRunDto;
  "quality-control"?: QcLotDto;
}

interface InstrumentRunProgressDto extends Omit<InstrumentProgressEvent, "id"> {
  id: "instrument_run_progress";

  instrumentRunId: number;
}

interface InstrumentWaitingEvent extends Event {
  id: "instrument_waiting";
  instrument: InstrumentDto;
  waitingReason: `${InstrumentWaitingReason}`;
}

interface SnapProInstrumentStatusUpdatedEvent
  extends Event,
    SnapProInstrumentStatusDto {
  id: "snap_pro_instrument_status_updated";
}

interface SnapProInstrumentSoftwareUpdatedEvent
  extends Event,
    SnapProInstrumentUpdateDto {
  id: "snap_pro_instrument_software_updated";
}

interface UsbCopyProgressDto extends Event {
  id: "usb_copy_progress";
  copyId: string;
  percentComplete: number;
}

interface RouterConfigResultEvent extends Event {
  id: "router_config_result";
  isSuccessful: boolean;
}

interface SettingUpdatedDto extends Event {
  id: "ivls_setting_updated";
  settingType: SettingTypeEnum;
  oldValue?: string;
  newValue?: string;
}

interface MessageUpdatedEvent extends Message {
  id: "message_updated";
}

interface IvlsConnectionStatusEvent extends Event {
  id: "ivls-connection-status";
  connected: boolean;
}

interface SmartServiceStatusEvent extends Event {
  id: "smart-service-status";
  smartServiceStatus: SmartServiceStatus;
}

interface LabRequestComplete extends Event, LabRequestCompleteDto {
  id: "lab_request_complete";
}

interface RemoteRestoreRequestEvent extends Event, RestoreRequestDto {
  id: "remote_restore_request";
  restoreEventId: string;
}

interface CalibrationRestoreEvent extends Event {
  id: "calibration_restore";
  mode: ModeEnum;
  source: RestoreSource;
  proCyteDataRestored?: boolean;
  proCyteDataPresent?: boolean;
  laserCyteDataRestored?: boolean;
  laserCyteDataPresent?: boolean;
}

interface CalibrationResultEvent extends Event, CalibrationResultDto {
  id: "calibration_result";
}

interface InstrumentRunTimerCompleteDto extends Event {
  id: "instrument_run_timer_complete";
  labRequestDto: RunningLabRequestDto;
  instrumentRunDto: RunningInstrumentRunDto;
}

interface RestartNotification extends Event {
  restartReason: "WEEKLY_REMINDER" | "DST_TRANSITION" | "EXCESSIVE_UPTIME";
}

interface FileUploadComplete extends Event {
  id: "file_upload_complete";
  labRequestId: string;
  instrumentRunId: string;
}

interface SmartServiceAgentNotificationDto extends Event {
  id: "smart_service_agent_notification";
  smartServiceStatus: SmartServiceStatus;
  daysOffline: number;
  minutesOffline: number;
  hoursOffline: number;
}

interface FeatureFlagStatusDto extends Event {
  id: "feature_flag_status";
  featureFlagName: FeatureFlagName;
  active: boolean;
}

interface DetailedInstrumentStatusEvent
  extends Event,
    DetailedInstrumentStatusDto {
  id: "detailed_instrument_status_updated";
}

interface ResultStatusNotification extends Event, ResultStatusNotificationDto {
  id: "result_status_notification";
}

export type {
  EventId,
  Event,
  PendingRequestUpdatedEvent,
  PimsUnsentRunCount,
  InstrumentStatusUpdatedEvent,
  InstrumentUpgradeStatusCompletedEvent,
  RecentResultsUpdatedEvent,
  RunningLabRequestUpdatedEvent,
  AssayTypeIdentificationRequestEvent,
  CuvetteStatusUpdateEvent,
  FluidPackStatusResponseDto,
  MaintenanceProcedureAcceptedEvent,
  InstrumentProgressEvent,
  SmartQCResultEvent,
  CatalystSmartQCResultEvent,
  ConnectionApprovalRequestEvent,
  ReagentStatusChangedDto,
  PatientJobAcceptedDto,
  InstrumentRunProgressDto,
  InstrumentWaitingEvent,
  SnapProInstrumentStatusUpdatedEvent,
  SnapProInstrumentSoftwareUpdatedEvent,
  UsbCopyProgressDto,
  RouterConfigResultEvent,
  SettingUpdatedDto,
  MessageUpdatedEvent,
  IvlsConnectionStatusEvent,
  SmartServiceStatusEvent,
  LabRequestComplete,
  RemoteRestoreRequestEvent,
  CalibrationRestoreEvent,
  CalibrationResultEvent,
  InstrumentRunTimerCompleteDto,
  RestartNotification,
  FileUploadComplete,
  SmartServiceAgentNotificationDto,
  FeatureFlagStatusDto,
  DetailedInstrumentStatusEvent,
  ResultStatusNotification,
};

export { EventIds };
