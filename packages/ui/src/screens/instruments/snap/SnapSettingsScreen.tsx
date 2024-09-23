import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  useGetSettingsQuery,
  useUpdateSettingMutation,
} from "../../../api/SettingsApi";
import { SettingTypeEnum } from "@viewpoint/api";
import {
  InstrumentPageContent,
  InstrumentPageRightPanel,
  InstrumentPageRightPanelButtonContainer,
  InstrumentPageRoot,
} from "../common-components";
import { Button, Label, Select, SpotText, Toggle } from "@viewpoint/spot-react";
import styled from "styled-components";
import { Theme } from "../../../utils/StyleConstants";
import { ChangeEvent, useEffect } from "react";

const SettingSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Divider = styled.div`
  border: ${(p: { theme: Theme }) => p.theme.borders?.lightPrimary};
  margin-top: 16px;
  margin-bottom: 16px;
`;

const ReminderDuration = styled.div`
  max-width: 360px;
`;

// The only supported reminder thresholds displayed in the UI
// (must be sorted in ascending order to function correctly)
const SUPPORTED_REMINDER_THRESHOLDS = [0, 5, 10, 20, 30, 40, 50, 60];
const DEFAULT_THRESHOLD = SUPPORTED_REMINDER_THRESHOLDS[2];

/**
 * Return a supported reminder threshold for a potentially unsupported existing threshold.
 * This logic is applied due to a change of granularity with the introduction of this UI
 * (the older UI supported 0-60, in increments of one).
 *
 * If the given threshold is undefined or out of range, a default threshold is returned.
 * Otherwise, the smallest supported threshold greater than the given threshold is returned.
 *
 * @param threshold - a number (potentially NaN)
 * @returns supported threshold
 */
export function supportedReminderThreshold(threshold: number | undefined) {
  if (threshold == null || Number.isNaN(threshold) || threshold < 0) {
    return DEFAULT_THRESHOLD;
  }

  return (
    SUPPORTED_REMINDER_THRESHOLDS.find((it) => it >= threshold) ??
    DEFAULT_THRESHOLD
  );
}

export function SnapSettingsScreen() {
  const nav = useNavigate();
  const { t } = useTranslation();

  const { data: settings, isFetching: settingsAreFetching } =
    useGetSettingsQuery([
      SettingTypeEnum.ALERT_WARNING_DURATION,
      SettingTypeEnum.SNAP_COMPLETIONBEEP,
      SettingTypeEnum.SNAP_ENABLETIMER,
    ]);

  const [updateSetting, { isLoading: settingsAreUpdating }] =
    useUpdateSettingMutation();

  const settingsUnstable = settingsAreFetching || settingsAreUpdating;

  const timerEnabled = settings?.SNAP_ENABLETIMER === "true";
  const beepEnabled = settings?.SNAP_COMPLETIONBEEP === "true";

  const storedDuration = Number(settings?.ALERT_WARNING_DURATION);
  const supportedDuration = supportedReminderThreshold(storedDuration);

  useEffect(() => {
    if (!settingsAreFetching && storedDuration !== supportedDuration) {
      updateSetting({
        settingType: SettingTypeEnum.ALERT_WARNING_DURATION,
        settingValue: `${supportedDuration}`,
      });
    }
  }, [settingsAreFetching, storedDuration, supportedDuration, updateSetting]);

  const handleEnableTimerChange = (ev: ChangeEvent<HTMLInputElement>) => {
    updateSetting({
      settingType: SettingTypeEnum.SNAP_ENABLETIMER,
      settingValue: `${ev.target.checked}`,
    });
  };

  const handleReminderThresholdChange = (
    ev: ChangeEvent<HTMLSelectElement>
  ) => {
    updateSetting({
      settingType: SettingTypeEnum.ALERT_WARNING_DURATION,
      settingValue: `${supportedReminderThreshold(Number(ev.target.value))}`,
    });
  };

  const handleCompletionBeepChange = (ev: ChangeEvent<HTMLInputElement>) => {
    updateSetting({
      settingType: SettingTypeEnum.SNAP_COMPLETIONBEEP,
      settingValue: `${ev.target.checked}`,
    });
  };

  return (
    <InstrumentPageRoot>
      <InstrumentPageContent>
        <SpotText level="h3">
          {t("instrumentScreens.general.labels.settings")}
        </SpotText>

        <Divider />

        <SettingSection>
          <Toggle
            checked={timerEnabled}
            label={t("instrumentScreens.snap.settings.enableTimer")}
            disabled={settingsUnstable}
            onChange={handleEnableTimerChange}
          />

          <ReminderDuration>
            <Label htmlFor="snapReminderDuration">
              {t("instrumentScreens.snap.settings.reminderDuration")}
            </Label>
            <Select
              id="snapReminderDuration"
              value={supportedDuration}
              disabled={settingsUnstable || !timerEnabled}
              onChange={handleReminderThresholdChange}
            >
              <Select.Option key="" hidden />
              {SUPPORTED_REMINDER_THRESHOLDS.map((threshold) => (
                <Select.Option
                  key={threshold}
                  label={t("general.duration.second", { count: threshold })}
                  value={threshold}
                />
              ))}
            </Select>
          </ReminderDuration>

          <Toggle
            checked={beepEnabled}
            label={t("instrumentScreens.snap.settings.enableCompletionBeep")}
            disabled={settingsUnstable || !timerEnabled}
            onChange={handleCompletionBeepChange}
          />
        </SettingSection>
      </InstrumentPageContent>
      <InstrumentPageRightPanel>
        <InstrumentPageRightPanelButtonContainer>
          <Button buttonType="secondary" onClick={() => nav(-1)}>
            {t("general.buttons.back")}
          </Button>
        </InstrumentPageRightPanelButtonContainer>
      </InstrumentPageRightPanel>
    </InstrumentPageRoot>
  );
}
