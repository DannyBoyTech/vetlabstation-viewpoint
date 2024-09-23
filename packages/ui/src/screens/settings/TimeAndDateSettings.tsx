import { SpotText, Toggle, Select } from "@viewpoint/spot-react";
import styled from "styled-components";
import {
  Divider,
  SettingsPageContent,
  SettingsPageRoot,
} from "./common-settings-components";
import {
  useFormatDayAndTime12h,
  useFormatLongDateTime12h,
} from "../../utils/hooks/datetime";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  LocationDto,
  SettingTypeEnum,
  TimeConfigurationDto,
  TimeZoneDto,
} from "@viewpoint/api";
import {
  useGetAvailableLocationsQuery,
  useGetAvailableTimeZonesQuery,
  useGetCurrentTimeZoneQuery,
  useGetIsTimeZoneSyncingQuery,
} from "../../api/TimeAndDateApi";
import { useGetSettingQuery } from "../../api/SettingsApi";
import dayjs, { Dayjs } from "dayjs";
import SpinnerOverlay from "../../components/overlay/SpinnerOverlay";
import {
  usePendingTimeConfigurationData,
  useUpdateTimeConfiguration,
} from "./SettingsScreenContext";
import {
  fromIvlsDateTimeArray,
  getCityFromTimeZone,
  getLongTimeZoneName,
  getShortTimeZoneName,
  toIvlsDateTimeArray,
} from "../../utils/date-utils";
import { TwelveHourTimeSelect } from "../../components/input/TwelveHourTimeSelect";
import { ViewpointDatePickerInput } from "../../components/input/ViewPointDatePicker";

const Root = styled(SettingsPageRoot)`
  position: relative;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
`;

const Body = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 30px;
`;

const SelectContainer = styled.div`
  max-width: 30em;
`;
const TimeAndTzContainer = styled.div`
  margin-left: auto;
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

export const TestId = {
  timeAndDateHeader: "time-and-date-header",
  timeAndDateHeaderTz: "time-and-date-header-tz",
  timeAndDateScreenMain: "time-and-date-screen-main",
  toggleDsT: "toggle-dst",
  changeTimeZoneContainer: "change-tz-container",
  changeTimeContainer: "change-time-container",
  timeZoneSelect: "time-and-date-tz-select",
  locationSelect: "time-and-date-location-select",
} as const;

const SectionHeader = styled(SpotText)``;

const NO_TIMEZONE = "NO_TIMEZONE_ID";
const NO_LOCATION = "NO_LOCATION";

export function TimeAndDateSettings() {
  const [currentDateTime, setCurrentDateTime] = useState(Date.now());
  const [selectedLocation, setSelectedLocation] = useState<string>();

  const updatedTimeConfig = usePendingTimeConfigurationData();
  const setUpdatedTimeConfig = useUpdateTimeConfiguration();

  const { i18n, t } = useTranslation();
  const formatDateTime = useFormatLongDateTime12h();

  const { data: currentTimeConfig, isLoading: currentConfigLoading } =
    useGetCurrentTimeZoneQuery(undefined, { refetchOnMountOrArgChange: true });
  const { data: availableLocations, isLoading: availableLocationsLoading } =
    useGetAvailableLocationsQuery();
  const { data: clinicLocation, isLoading: clinicLocationLoading } =
    useGetSettingQuery(SettingTypeEnum.CLINIC_COUNTRY);
  const { data: timeZones, isLoading: availableTimeZonesLoading } =
    useGetAvailableTimeZonesQuery({
      countryCode: selectedLocation ?? clinicLocation,
    });
  const { data: syncing } = useGetIsTimeZoneSyncingQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  useEffect(() => {
    // reset TZ selection when list changes
    setUpdatedTimeConfig((config) => ({ ...config, timeZoneId: undefined }));
  }, [setUpdatedTimeConfig, timeZones]);

  const isLoading =
    currentConfigLoading ||
    availableLocationsLoading ||
    clinicLocationLoading ||
    availableTimeZonesLoading;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDateTime(Date.now());
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const handleDstChanged = (checked: boolean) => {
    setUpdatedTimeConfig((prev) => ({ ...prev, dstEnabled: checked }));
  };

  const handleTimeZoneChanged = (newTzId: string) => {
    setUpdatedTimeConfig((prev) => ({ ...prev, timeZoneId: newTzId }));
  };

  const handleCurrentTimeChanged = (newLocalDateTime: Dayjs) => {
    const time = newLocalDateTime ?? dayjs();
    setUpdatedTimeConfig((prev) => ({
      ...prev,
      localDateTime: toIvlsDateTimeArray(time),
    }));
  };

  const { currentShortTzName, currentLongTzName, currentTzCity } =
    useMemo(() => {
      return {
        currentShortTzName: getShortTimeZoneName(
          currentTimeConfig?.timeZoneId,
          i18n.language
        ),
        currentLongTzName: getLongTimeZoneName(
          currentTimeConfig?.timeZoneId,
          i18n.language
        ),
        currentTzCity: getCityFromTimeZone(currentTimeConfig?.timeZoneId),
      };
    }, [currentTimeConfig, i18n]);

  return (
    <Root data-testid={TestId.timeAndDateScreenMain}>
      {isLoading && <SpinnerOverlay />}
      <SettingsPageContent>
        <Header>
          <SpotText level="h3">
            {t("settings.timeAndDate.labels.timeAndDate")}
          </SpotText>
          <TimeAndTzContainer>
            <SpotText data-testid={TestId.timeAndDateHeader} level="h3">
              {formatDateTime(currentDateTime)}
            </SpotText>
            {currentShortTzName != null &&
              currentLongTzName != null &&
              currentTzCity != null && (
                <SpotText
                  data-testid={TestId.timeAndDateHeaderTz}
                  level="paragraph"
                >
                  {t("settings.timeAndDate.labels.tzDisplayNoTime", {
                    shortName: currentShortTzName,
                    longName: currentLongTzName,
                    city: currentTzCity,
                  })}
                </SpotText>
              )}
          </TimeAndTzContainer>
        </Header>
        <Body>
          <Divider />

          <DstSettings
            onDstChanged={handleDstChanged}
            currentTimeConfig={currentTimeConfig}
            updatedTimeConfig={updatedTimeConfig}
          />

          <Divider data-testid={TestId.changeTimeZoneContainer} />

          <SectionHeader level="paragraph" bold>
            {t("settings.timeAndDate.labels.changeTimeZone")}
          </SectionHeader>

          <TimeZoneSettings
            currentDateTime={currentDateTime}
            clinicLocation={clinicLocation}
            selectedLocation={selectedLocation}
            availableLocations={availableLocations}
            updatedTimeConfig={updatedTimeConfig}
            timeZones={timeZones}
            onLocationChanged={setSelectedLocation}
            onTimeZoneChanged={handleTimeZoneChanged}
            syncing={syncing}
          />

          <Divider />

          {syncing === false && (
            <>
              <SectionHeader level="paragraph" bold>
                {t("settings.timeAndDate.labels.currentTime")}
              </SectionHeader>
              <CurrentTimeSettings
                dateTime={
                  updatedTimeConfig?.localDateTime == null
                    ? currentTimeConfig?.localDateTime == null
                      ? undefined
                      : fromIvlsDateTimeArray(currentTimeConfig?.localDateTime)
                    : fromIvlsDateTimeArray(updatedTimeConfig.localDateTime)
                }
                onDateTimeChanged={handleCurrentTimeChanged}
              />
            </>
          )}
        </Body>
      </SettingsPageContent>
    </Root>
  );
}

interface DstSettingsProps {
  updatedTimeConfig?: Partial<TimeConfigurationDto>;
  currentTimeConfig?: TimeConfigurationDto;
  onDstChanged: (enabled: boolean) => void;
}

function DstSettings(props: DstSettingsProps) {
  const { t } = useTranslation();
  return (
    <>
      <SectionHeader level="paragraph" bold>
        {t("settings.timeAndDate.labels.dst")}
      </SectionHeader>
      <Toggle
        data-testid={TestId.toggleDsT}
        checked={
          props.updatedTimeConfig?.dstEnabled ??
          props.currentTimeConfig?.dstEnabled ??
          false
        }
        onChange={(ev) => props.onDstChanged(ev.currentTarget.checked)}
        label={t("settings.timeAndDate.labels.automaticallyAdjust")}
      />
    </>
  );
}

interface TimeZoneSettingsProps {
  currentDateTime: number;
  clinicLocation?: string;
  selectedLocation?: string;
  availableLocations?: LocationDto[];

  updatedTimeConfig?: Partial<TimeConfigurationDto>;
  timeZones?: TimeZoneDto[];

  onLocationChanged: (countryCode: string) => void;
  onTimeZoneChanged: (tzId: string) => void;
  syncing?: boolean;
}

export function TimeZoneSettings(props: TimeZoneSettingsProps) {
  const { i18n, t } = useTranslation();
  const shortFormat = useFormatDayAndTime12h();

  const decoratedTimeZones = useMemo(
    () =>
      props.timeZones?.map((tz) => ({
        ...tz,
        currentTime: shortFormat(
          dayjs(props.currentDateTime).tz(tz.timeZoneId)
        ),
        // Align TZ display values with what's in the browser (don't rely on IVLS for localized text content if possible)
        shortName: getShortTimeZoneName(tz.timeZoneId, i18n.language),
        longName: getLongTimeZoneName(tz.timeZoneId, i18n.language),
        city: getCityFromTimeZone(tz.timeZoneId),
      })),
    [props.timeZones, shortFormat, props.currentDateTime, i18n.language]
  );
  return (
    <>
      <SelectContainer>
        <Select
          data-testid={TestId.locationSelect}
          value={props.selectedLocation ?? props.clinicLocation}
          onChange={(ev) => props.onLocationChanged(ev.currentTarget.value)}
        >
          <Select.Option hidden value={NO_LOCATION}>
            {t("settings.timeAndDate.labels.locationDefault")}
          </Select.Option>
          {props.availableLocations?.map((location) => (
            <Select.Option
              key={location.countryCode}
              value={location.countryCode}
            >
              {location.countryName}
            </Select.Option>
          ))}
        </Select>
      </SelectContainer>

      <SelectContainer>
        <Select
          data-testid={TestId.timeZoneSelect}
          value={props.updatedTimeConfig?.timeZoneId ?? NO_TIMEZONE}
          onChange={(ev) => props.onTimeZoneChanged(ev.currentTarget.value)}
        >
          <Select.Option hidden value={NO_TIMEZONE}>
            {t("settings.timeAndDate.labels.tzDefault")}
          </Select.Option>

          {decoratedTimeZones?.map((tz) => (
            <Select.Option key={tz.timeZoneId} value={tz.timeZoneId}>
              {t(
                props.syncing
                  ? "settings.timeAndDate.labels.tzDisplay"
                  : "settings.timeAndDate.labels.tzDisplayNoTime",
                {
                  shortName: tz.shortName,
                  longName: tz.longName,
                  city: tz.city,
                  currentTime: tz.currentTime,
                }
              )}
            </Select.Option>
          ))}
        </Select>
      </SelectContainer>
    </>
  );
}

const CurrentTimeContainer = styled.div`
  max-width: 25em;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

interface CurrentTimeSettingsProps {
  dateTime?: Dayjs;
  onDateTimeChanged: (newLocalDateTime: Dayjs) => void;
}

export function CurrentTimeSettings(props: CurrentTimeSettingsProps) {
  const { t } = useTranslation();
  const currentLocalTime = props.dateTime ?? dayjs();
  return (
    <CurrentTimeContainer data-testid={TestId.changeTimeContainer}>
      <ViewpointDatePickerInput
        date={currentLocalTime.format("YYYY-MM-DD")}
        onDateSelected={(date) => {
          const parsed = dayjs(date, "YYYY-MM-DD");
          if (parsed.isValid()) {
            props.onDateTimeChanged(
              currentLocalTime
                .year(parsed.year())
                .month(parsed.month())
                .date(parsed.date())
            );
          }
        }}
      />

      <TwelveHourTimeSelect
        time={currentLocalTime?.format("HH:mm:ss")}
        includeMinutes
        onChanged={(hours, minutes) =>
          props.onDateTimeChanged(currentLocalTime.hour(hours).minute(minutes))
        }
      />
    </CurrentTimeContainer>
  );
}
