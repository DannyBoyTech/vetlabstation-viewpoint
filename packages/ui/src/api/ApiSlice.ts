import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const BASE_URL = "http:/labstation-webapp/api";

const CacheTags = {
  PendingRequests: "PendingRequests",
  Patients: "Patients",
  Instruments: "Instruments",
  DevicesApproval: "DevicesApproval",
  InstrumentConfig: "InstrumentConfig",
  Results: "Results",
  PimsResultTransmission: "PimsResultTransmission",
  RunningLabRequests: "RunningLabRequests",
  Species: "Species",
  Doctors: "Doctors",
  Settings: "Settings",
  UserInputRequests: "UserInputRequests",
  Images: "Images",
  Reports: "Reports",
  PatientLabRequestRecords: "PatientLabRequestRecords",
  QualityControl: "QualityControl",
  Reagent: "Reagent",
  SnapProStatus: "SnapProStatus",
  SystemInfo: "SystemInfo",
  SystemStatus: "SystemStatus",
  UpgradeStatus: "UpgradeStatus",
  SmartService: "SmartService",
  VetConnectPlus: "VetConnectPlus",
  RouterInfo: "RouterInfo",
  TimeConfiguration: "TimeConfiguration",
  Messages: "Messages",
  Backups: "Backups",
  FeatureFlags: "FeatureFlags",
} as const;

const viewpointApi = createApi({
  invalidationBehavior: "delayed",
  reducerPath: "viewpointApi",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: Object.values(CacheTags),
  endpoints: () => ({}),
});

export { viewpointApi, CacheTags };
