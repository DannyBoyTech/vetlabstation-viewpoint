import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { BasicModal } from "../../components/basic-modal/BasicModal";
import { ResponsiveModalWrapper } from "../../components/modal/ResponsiveModalWrapper";
import { Button } from "@viewpoint/spot-react";
import { SpotText } from "@viewpoint/spot-react/src";
import {
  CurrentTimeSettings,
  TimeZoneSettings,
} from "../settings/TimeAndDateSettings";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useGetSettingQuery } from "../../api/SettingsApi";
import {
  SettingTypeEnum,
  TimeConfigurationDto,
  TimeZoneMigrationTypeEnum,
} from "@viewpoint/api";
import {
  useGetAvailableLocationsQuery,
  useGetAvailableTimeZonesQuery,
  useGetIsTimeZoneSyncingQuery,
  useUpdateTimeConfigurationMutation,
} from "../../api/TimeAndDateApi";
import dayjs, { Dayjs } from "dayjs";
import SpinnerOverlay from "../../components/overlay/SpinnerOverlay";
import {
  fromIvlsDateTimeArray,
  isDstSupported,
  toIvlsDateTimeArray,
} from "../../utils/date-utils";

const RightAlignedButton = styled(Button)`
  && {
    margin-left: auto;
  }
`;

interface TimeZoneSelectionModalProps {
  open: boolean;
  onNext: () => void;
}

export function TimeZoneSelectionModal(props: TimeZoneSelectionModalProps) {
  const [updatedTimeConfig, setUpdatedTimeConfig] =
    useState<Partial<TimeConfigurationDto>>();
  const [updateTimeConfiguration, updateStatus] =
    useUpdateTimeConfigurationMutation();
  const { data: syncing } = useGetIsTimeZoneSyncingQuery();
  const { t } = useTranslation();

  const onNext = async () => {
    if (updatedTimeConfig != null && updatedTimeConfig.timeZoneId != null) {
      try {
        await updateTimeConfiguration({
          timeZoneId: updatedTimeConfig.timeZoneId,
          dstEnabled: isDstSupported(updatedTimeConfig.timeZoneId),
          migrationType: TimeZoneMigrationTypeEnum.PARTIAL,
          localDateTime: syncing
            ? undefined
            : updatedTimeConfig.localDateTime ?? toIvlsDateTimeArray(dayjs()),
        }).unwrap();
      } catch (err) {
        // OM allows you to continue through the first boot workflow even if there
        // is an error in setting the system time zone
        console.error(err);
      }
      props.onNext();
    }
  };

  return (
    <ResponsiveModalWrapper>
      <BasicModal
        dismissable={false}
        open={props.open}
        onClose={props.onNext}
        bodyContent={
          <TimeZoneSelectionBody
            updatedConfig={updatedTimeConfig}
            onConfigUpdated={setUpdatedTimeConfig}
          />
        }
        footerContent={
          <RightAlignedButton
            disabled={
              updatedTimeConfig?.timeZoneId == null || updateStatus.isLoading
            }
            onClick={onNext}
          >
            {t("general.buttons.next")}
          </RightAlignedButton>
        }
      />
    </ResponsiveModalWrapper>
  );
}

const Root = styled.div`
  width: 500px;
  display: flex;
  flex-direction: column;
  gap: 20px;

  .mantine-Popover-dropdown {
    /* Align to root, not the most recent relative possitioned item 
    Fixes the popover from not displaying correctly inside VP modals 
    Note that this workaround prevents the popover from staying attached
    to the input if the page is scrolled while the popover is open
    (not applicable here as there is no scrolling but something to keep in mind
    if this issue is encountered elsewhere) 
    */
    position: fixed;
  }
`;

interface TimeZoneSelectionBodyProps {
  updatedConfig?: Partial<TimeConfigurationDto>;
  onConfigUpdated: Dispatch<
    SetStateAction<Partial<TimeConfigurationDto> | undefined>
  >;
}

function TimeZoneSelectionBody(props: TimeZoneSelectionBodyProps) {
  const [currentDateTime, setCurrentDateTime] = useState(dayjs());
  const [selectedLocation, setSelectedLocation] = useState<string>();

  const { t } = useTranslation();
  const { data: clinicLocation, isLoading: clinicLocationLoading } =
    useGetSettingQuery(SettingTypeEnum.CLINIC_COUNTRY);
  const { data: availableLocations, isLoading: availableLocationsLoading } =
    useGetAvailableLocationsQuery();
  const { data: timeZones, isLoading: availableTimeZonesLoading } =
    useGetAvailableTimeZonesQuery({
      countryCode: selectedLocation ?? clinicLocation,
    });
  const { data: syncing, isLoading: syncLoading } =
    useGetIsTimeZoneSyncingQuery();

  const handleTimeZoneChanged = (newTzId: string) => {
    props.onConfigUpdated((prev) => ({ ...prev, timeZoneId: newTzId }));
  };

  const handleTimeChanged = (time: Dayjs) => {
    props.onConfigUpdated((prev) => ({
      ...prev,
      localDateTime: toIvlsDateTimeArray(time),
    }));
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDateTime(dayjs());
    }, 500);

    return () => clearInterval(interval);
  }, []);
  return (
    <Root>
      {(clinicLocationLoading ||
        availableTimeZonesLoading ||
        availableLocationsLoading ||
        syncLoading) && <SpinnerOverlay />}

      <SpotText level={"h3"}>{t("boot.timeZone.header")}</SpotText>
      <SpotText level={"paragraph"}>{t("boot.timeZone.instructions")}</SpotText>

      <TimeZoneSettings
        currentDateTime={currentDateTime.valueOf()}
        clinicLocation={clinicLocation}
        selectedLocation={selectedLocation}
        availableLocations={availableLocations}
        updatedTimeConfig={props.updatedConfig}
        timeZones={timeZones}
        onLocationChanged={setSelectedLocation}
        onTimeZoneChanged={handleTimeZoneChanged}
        syncing={syncing}
      />

      {!syncing && !syncLoading && (
        <>
          <SpotText level={"paragraph"}>
            {t("settings.timeAndDate.labels.currentTime")}
          </SpotText>
          <CurrentTimeSettings
            onDateTimeChanged={handleTimeChanged}
            dateTime={
              props.updatedConfig?.localDateTime != null
                ? fromIvlsDateTimeArray(props.updatedConfig?.localDateTime)
                : currentDateTime
            }
          />
        </>
      )}
    </Root>
  );
}
