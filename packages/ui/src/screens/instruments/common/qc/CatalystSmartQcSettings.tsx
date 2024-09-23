import { InstrumentType, SettingTypeEnum } from "@viewpoint/api";
import styled from "styled-components";
import { Trans, useTranslation } from "react-i18next";
import { Select, SpotText } from "@viewpoint/spot-react";
import {
  useGetSettingsQuery,
  useUpdateSettingMutation,
} from "../../../../api/SettingsApi";
import { skipToken } from "@reduxjs/toolkit/query";
import { useCallback, useMemo } from "react";
import { InlineText } from "../../../../components/typography/InlineText";
import dayjs from "dayjs";
import {
  useFormatLongDateTime12h,
  useFormatTime12h,
} from "../../../../utils/hooks/datetime";
import { CommonTransComponents } from "../../../../utils/i18n-utils";
import { naturals } from "../../../../utils/general-utils";

const Root = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const DropDownContainer = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const NoWrapText = styled(InlineText)`
  white-space: nowrap;
`;

type CatalystType = InstrumentType.CatalystOne | InstrumentType.CatalystDx;

export interface CatalystSmartQcSettings {
  instrumentType: CatalystType;
}

const WEEKS_OPTIONS = [
  -1, // Negative value disables the reminders
  ...naturals(4),
];
const DAY_OPTIONS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const HOUR_OPTIONS = Array.from({ length: 24 }).map((_, i) =>
  (i + 1).toString()
);

export function CatalystSmartQcSettings(props: CatalystSmartQcSettings) {
  const { t } = useTranslation();
  const {
    queryData: { data: settingsData, isLoading },
    updateSetting,
    updateSettingStatus,
  } = useSmartQcSettingData(props.instrumentType);

  const formatTime = useFormatTime12h();
  const formatDateTime = useFormatLongDateTime12h();

  const userDisabled = (settingsData?.weeks ?? -1) <= 0;

  return (
    <Root>
      <SpotText level="secondary">
        {t("instrumentScreens.smartQc.chemistry.reminder.sendReminder")}
      </SpotText>
      <DropDownContainer>
        <div>
          <Select
            value={settingsData?.weeks}
            disabled={isLoading || updateSettingStatus.isLoading}
            onChange={(ev) => updateSetting("weeks", Number(ev.target.value))}
          >
            {WEEKS_OPTIONS.map((week) => (
              <Select.Option key={week} value={week}>
                {week > 0
                  ? week
                  : t("instrumentScreens.smartQc.chemistry.reminder.never")}
              </Select.Option>
            ))}
          </Select>
        </div>

        <NoWrapText level="secondary">
          {t("instrumentScreens.smartQc.chemistry.reminder.weeks")}
        </NoWrapText>

        <div>
          <Select
            value={Number(settingsData?.day ?? 1)}
            disabled={
              userDisabled || isLoading || updateSettingStatus.isLoading
            }
            onChange={(ev) => {
              updateSetting("day", Number(ev.target.value));
            }}
          >
            {DAY_OPTIONS.map((day, i) => (
              <Select.Option key={day} value={i + 1}>
                {day}
              </Select.Option>
            ))}
          </Select>
        </div>

        <NoWrapText level="secondary">
          {t("instrumentScreens.smartQc.chemistry.reminder.at")}
        </NoWrapText>

        <div>
          <Select
            value={settingsData?.hour}
            disabled={
              userDisabled || isLoading || updateSettingStatus.isLoading
            }
            onChange={(ev) => updateSetting("hour", Number(ev.target.value))}
          >
            {HOUR_OPTIONS.map((hour) => (
              <Select.Option key={hour} value={hour}>
                {formatTime(dayjs().hour(Number(hour)).minute(0).second(0))}
              </Select.Option>
            ))}
          </Select>
        </div>
      </DropDownContainer>
      {!userDisabled && (
        <SpotText level="secondary">
          <Trans
            i18nKey={
              "instrumentScreens.smartQc.chemistry.reminder.nextReminder"
            }
            components={{
              ...CommonTransComponents,
              strong: <InlineText level="secondary" bold />,
            }}
            values={{
              reminderTime: formatDateTime(settingsData?.nextNotificationDate),
            }}
          />
        </SpotText>
      )}
    </Root>
  );
}

export function useSmartQcSettingData(instrumentType: CatalystType) {
  const mappings = SETTING_TYPE_MAPPINGS[instrumentType];

  const [updateSetting, updateSettingStatus] = useUpdateSettingMutation();

  const queryData = useGetSettingsQuery(
    mappings == null ? skipToken : Object.values(mappings),
    {
      selectFromResult: (res) => ({
        ...res,
        data:
          mappings == null
            ? undefined
            : {
                weeks: res.data?.[mappings.weeks],
                day: res.data?.[mappings.day],
                hour: res.data?.[mappings.hour],
                nextNotificationDate: res.data?.[mappings.nextReminder],
              },
      }),
    }
  );

  const handleUpdate = useCallback(
    (setting: keyof SettingMappings, value: number | string | undefined) => {
      const mappings = SETTING_TYPE_MAPPINGS[instrumentType];
      if (mappings != null) {
        const settingType = mappings[setting];
        updateSetting({
          settingType: mappings[setting],
          settingValue: value?.toString(),
        });
      } else {
        console.error(
          `Attempted to update Catalyst SmartQC settings for unknown instrument type ${instrumentType}`
        );
      }
    },
    [instrumentType, updateSetting]
  );

  return useMemo(
    () => ({
      queryData,
      updateSettingStatus,
      updateSetting: handleUpdate,
    }),
    [queryData, handleUpdate, updateSettingStatus]
  );
}

interface SettingMappings {
  weeks: SettingTypeEnum;
  day: SettingTypeEnum;
  hour: SettingTypeEnum;
  nextReminder: SettingTypeEnum;
}

const SETTING_TYPE_MAPPINGS: {
  [key in CatalystType]?: SettingMappings;
} = {
  [InstrumentType.CatalystOne]: {
    weeks: SettingTypeEnum.CATONE_SMARTQC_REMINDER_WEEKS,
    day: SettingTypeEnum.CATONE_SMARTQC_REMINDER_DAY,
    hour: SettingTypeEnum.CATONE_SMARTQC_REMINDER_HOUR,
    nextReminder: SettingTypeEnum.CATONE_SMARTQC_NEXT_NOTIFICATION_DATE,
  },
  [InstrumentType.CatalystDx]: {
    weeks: SettingTypeEnum.CATDX_SMARTQC_REMINDER_WEEKS,
    day: SettingTypeEnum.CATDX_SMARTQC_REMINDER_DAY,
    hour: SettingTypeEnum.CATDX_SMARTQC_REMINDER_HOUR,
    nextReminder: SettingTypeEnum.CATDX_SMARTQC_NEXT_NOTIFICATION_DATE,
  },
};
