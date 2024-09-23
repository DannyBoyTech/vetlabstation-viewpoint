import React, {
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { TimeConfigurationDto } from "@viewpoint/api";
import {
  useGetCurrentTimeZoneQuery,
  useGetIsTimeZoneSyncingQuery,
  useUpdateTimeConfigurationMutation,
} from "../../api/TimeAndDateApi";

export interface SettingsDataContext {
  updatedTimeConfig?: Partial<TimeConfigurationDto>;

  rebootRequired: boolean;
}

export interface SettingsApiContext {
  setUpdatedTimeConfig: React.Dispatch<
    React.SetStateAction<Partial<TimeConfigurationDto> | undefined>
  >;
  flushPendingSettings: () => Promise<unknown>;
}

export const ViewpointSettingsDataContext =
  React.createContext<SettingsDataContext>(
    undefined as unknown as SettingsDataContext
  );

export const ViewpointSettingsApiContext =
  React.createContext<SettingsApiContext>(
    undefined as unknown as SettingsApiContext
  );

function isRebootRequired(
  updates?: Partial<TimeConfigurationDto>,
  current?: TimeConfigurationDto
): boolean {
  const fieldsRequiringReboot: (keyof TimeConfigurationDto)[] = [
    "timeZoneId",
    "dstEnabled",
    "localDateTime",
    "migrationType",
  ];

  return fieldsRequiringReboot.some(
    (field) => updates?.[field] != null && updates[field] !== current?.[field]
  );
}

const ViewpointSettingsProvider = (props: PropsWithChildren) => {
  const [updatedTimeConfig, setUpdatedTimeConfig] =
    useState<Partial<TimeConfigurationDto>>();

  const [updateTimeConfiguration] = useUpdateTimeConfigurationMutation();
  const { data: currentTimeConfig } = useGetCurrentTimeZoneQuery();
  const { data: isSyncing } = useGetIsTimeZoneSyncingQuery();

  const rebootRequired = isRebootRequired(updatedTimeConfig, currentTimeConfig);

  const flushPendingSettings = useCallback(async () => {
    if (updatedTimeConfig != null && currentTimeConfig != null) {
      await updateTimeConfiguration({
        timeZoneId:
          updatedTimeConfig.timeZoneId ?? currentTimeConfig.timeZoneId,
        dstEnabled:
          updatedTimeConfig.dstEnabled ?? currentTimeConfig.dstEnabled,
        migrationType:
          updatedTimeConfig.migrationType ?? currentTimeConfig.migrationType,
        localDateTime: isSyncing
          ? undefined
          : updatedTimeConfig.localDateTime ?? currentTimeConfig.localDateTime,
      }).unwrap();
    }
  }, [
    currentTimeConfig,
    isSyncing,
    updateTimeConfiguration,
    updatedTimeConfig,
  ]);

  const dataValue = useMemo(
    () => ({
      updatedTimeConfig,
      rebootRequired,
    }),
    [updatedTimeConfig, rebootRequired]
  );

  const apiValue = useMemo(
    () => ({
      setUpdatedTimeConfig,
      flushPendingSettings,
    }),
    [setUpdatedTimeConfig, flushPendingSettings]
  );

  return (
    <ViewpointSettingsDataContext.Provider value={dataValue}>
      <ViewpointSettingsApiContext.Provider value={apiValue}>
        {props.children}
      </ViewpointSettingsApiContext.Provider>
    </ViewpointSettingsDataContext.Provider>
  );
};

export function usePendingTimeConfigurationData() {
  const { updatedTimeConfig } = useContext(ViewpointSettingsDataContext);

  return updatedTimeConfig;
}

export function useUpdateTimeConfiguration() {
  const { setUpdatedTimeConfig } = useContext(ViewpointSettingsApiContext);

  return setUpdatedTimeConfig;
}

export function useIsRebootRequired() {
  const { rebootRequired } = useContext(ViewpointSettingsDataContext);

  return rebootRequired;
}

export function useFlushPendingSettings() {
  const { flushPendingSettings } = useContext(ViewpointSettingsApiContext);

  return flushPendingSettings;
}

export default ViewpointSettingsProvider;
