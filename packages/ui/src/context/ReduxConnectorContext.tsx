import React, { useCallback } from "react";
import { useAppDispatch } from "../utils/hooks/hooks";
import { EventIds, SettingTypeEnum, SettingUpdatedDto } from "@viewpoint/api";
import { CacheTags, viewpointApi } from "../api/ApiSlice";
import {
  useEventListener,
  useEventSource,
  useOnReconnect,
} from "./EventSourceContext";

// Settings that will alter the way IVLS reports data to us. We could be more
// selective here, but it's hard to know exactly which endpoints will contain
// data that needs to be refreshed.
const FULL_CACHE_CLEAR_SETTINGS = [
  SettingTypeEnum.CLINIC_COUNTRY,
  SettingTypeEnum.CLINIC_LANGUAGE,
  SettingTypeEnum.DISPLAY_ENGLISH_ASSAY_NAME,
  SettingTypeEnum.DISPLAY_PROCYTE_INTERPRETIVE_COMMENTS,
  SettingTypeEnum.DISPLAY_URINALYSIS_INTERPRETIVE_COMMENTS,
  SettingTypeEnum.PRINT_HEMATOLOGY_MESSAGE_CODES,
  SettingTypeEnum.PRINT_RESULT_REPORT_FORMAT,
  SettingTypeEnum.PRINT_TEST_RESULTS_ORDER,
  SettingTypeEnum.UA_REPORTING_UNIT_TYPE,
  SettingTypeEnum.UNIT_SYSTEM,
  SettingTypeEnum.WEIGHT_UNIT_TYPE,
];

export interface ReduxConnectorContext {
  connected: boolean;
}

export interface ReduxConnectorContextProps {
  children?: React.ReactNode;
}

export const ViewpointReduxConnectorContext =
  React.createContext<ReduxConnectorContext>(
    undefined as unknown as ReduxConnectorContext
  );

/*
 * Context provider that connects the Viewpoint Redux store with SSE events
 *
 * @param props
 * @constructor
 */
const ReduxConnectorProvider = ({ children }: ReduxConnectorContextProps) => {
  const dispatch = useAppDispatch();
  const eventSource = useEventSource();

  // If we lose connection to IVLS or the VP backend, changes might still be
  // happening -- if/when we reconnect, we should invalidate the API cache
  // so that any fresh data is refetched
  const reconnectHandler = useCallback(() => {
    console.debug("reconnect detected - invalidating API cache");
    dispatch(viewpointApi.util.invalidateTags(Object.values(CacheTags)));
  }, [dispatch]);
  useOnReconnect(reconnectHandler);

  const pendingReqsHandler = useCallback(() => {
    dispatch(viewpointApi.util.invalidateTags([CacheTags.PendingRequests]));
  }, [dispatch]);
  useEventListener(EventIds.PendingRequestsUpdated, pendingReqsHandler);

  const instrumentsHandler = useCallback(() => {
    dispatch(viewpointApi.util.invalidateTags([CacheTags.Instruments]));
  }, [dispatch]);
  useEventListener(EventIds.InstrumentStatusUpdated, instrumentsHandler);

  const deviceApprovalHandler = useCallback(() => {
    dispatch(viewpointApi.util.invalidateTags([CacheTags.DevicesApproval]));
  }, [dispatch]);
  useEventListener(EventIds.ConnectionApprovalRequest, deviceApprovalHandler);

  const resultsHandler = useCallback(() => {
    dispatch(viewpointApi.util.invalidateTags([CacheTags.Results]));
  }, [dispatch]);
  useEventListener(EventIds.RecentResultsUpdated, resultsHandler);

  const calibrationResultsHandler = useCallback(() => {
    dispatch(viewpointApi.util.invalidateTags([CacheTags.QualityControl]));
  }, [dispatch]);
  useEventListener(EventIds.CalibrationResult, calibrationResultsHandler);

  const runningLabReqsHandler = useCallback(() => {
    dispatch(viewpointApi.util.invalidateTags([CacheTags.RunningLabRequests]));
  }, [dispatch]);
  useEventListener(EventIds.RunningLabRequestsUpdated, runningLabReqsHandler);

  const settingsHandler = useCallback(
    (msg: MessageEvent) => {
      dispatch(viewpointApi.util.invalidateTags([CacheTags.Settings]));
      const payload: SettingUpdatedDto = JSON.parse(msg.data);

      if (FULL_CACHE_CLEAR_SETTINGS.includes(payload.settingType)) {
        // Hard to know exactly which endpoints will contain localized or result-facing data - just invalidate the whole cache
        dispatch(viewpointApi.util.invalidateTags(Object.values(CacheTags)));
      }
    },
    [dispatch]
  );
  useEventListener(EventIds.IvlsSettingUpdated, settingsHandler);

  const pimsResultHandler = useCallback(() => {
    dispatch(
      viewpointApi.util.invalidateTags([CacheTags.PimsResultTransmission])
    );
  }, [dispatch]);
  useEventListener(EventIds.PimsUnsentRunCount, pimsResultHandler);

  const snapProStatusHandler = useCallback(() => {
    dispatch(viewpointApi.util.invalidateTags([CacheTags.SnapProStatus]));
  }, [dispatch]);
  useEventListener(
    EventIds.SnapProInstrumentStatusUpdated,
    snapProStatusHandler
  );
  useEventListener(
    EventIds.SnapProInstrumentSoftwareUpdated,
    snapProStatusHandler
  );

  const upgradeAvailableHandler = useCallback(() => {
    dispatch(viewpointApi.util.invalidateTags([CacheTags.UpgradeStatus]));
  }, [dispatch]);
  useEventListener(EventIds.UpgradeAvailable, upgradeAvailableHandler);

  const ssAgentStatusHandler = useCallback(() => {
    dispatch(viewpointApi.util.invalidateTags([CacheTags.SmartService]));
  }, [dispatch]);
  useEventListener(EventIds.SmartServiceStatus, ssAgentStatusHandler);

  const messageUpdateHandler = useCallback(() => {
    dispatch(viewpointApi.util.invalidateTags([CacheTags.Messages]));
  }, [dispatch]);
  useEventListener(EventIds.MessageUpdated, messageUpdateHandler);

  const fileUploadHandler = useCallback(() => {
    dispatch(viewpointApi.util.invalidateTags([CacheTags.Images]));
  }, [dispatch]);
  useEventListener(EventIds.FileUploadComplete, fileUploadHandler);

  const featureFlagStatusHandler = useCallback(() => {
    dispatch(viewpointApi.util?.invalidateTags([CacheTags.FeatureFlags]));
  }, [dispatch]);
  useEventListener(EventIds.FeatureFlagStatus, featureFlagStatusHandler);

  return (
    <ViewpointReduxConnectorContext.Provider
      value={{
        connected: eventSource.readyState === EventSource.OPEN,
      }}
    >
      {children}
    </ViewpointReduxConnectorContext.Provider>
  );
};

export default ReduxConnectorProvider;
