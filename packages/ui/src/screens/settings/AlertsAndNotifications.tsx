import { SpotText } from "@viewpoint/spot-react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import {
  useGetSettingsQuery,
  useUpdateSettingMutation,
} from "../../api/SettingsApi";
import { Settings, SettingTypeEnum } from "@viewpoint/api";
import {
  SettingsPageContent,
  SettingsPageRoot,
} from "./common-settings-components";
import SpinnerOverlay from "../../components/overlay/SpinnerOverlay";
import { Select, Toggle } from "@viewpoint/spot-react/src";

const Header = styled.div`
  display: flex;
  gap: 20px;
  align-items: flex-end;
  margin-bottom: 15px;
`;

const RadioContainer = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: left;
  padding: 0.5em 0 0 1em;

  .spot-form__radio {
    display: flex;
    align-items: center;
    justify-content: left;
    padding-right: 2em;
  }
`;

const Setting = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 20px;
  margin-bottom: 20px;
`;

const SelectContainer = styled.div`
  max-width: 18em;
  margin-left: 1em;
`;

export function AlertsAndNotifications() {
  const { t } = useTranslation();

  // Fetch all settings with a single query
  const { data: settings, isLoading: isLoadingSettings } = useGetSettingsQuery([
    SettingTypeEnum.DISPLAY_SHOW_ALERT,
    SettingTypeEnum.DISPLAY_BLINK_NEW_RESULTS_DURATION,
    SettingTypeEnum.DISPLAY_BEEP_ALERT,
    SettingTypeEnum.DISPLAY_BEEP_ALERT_DURATION,
  ]);
  const [updateSetting, updateSettingStatus] = useUpdateSettingMutation();

  const { isShowAlert, isBeepAlert, showAlertDuration, beepAlertDuration } =
    extractAlertSettings(settings);

  function handleShowAlertChanged(val: boolean) {
    updateSetting({
      settingType: SettingTypeEnum.DISPLAY_SHOW_ALERT,
      settingValue: `${val}`,
    });
  }

  function handleAlertDurationChanged(val: string) {
    updateSetting({
      settingType: SettingTypeEnum.DISPLAY_BLINK_NEW_RESULTS_DURATION,
      settingValue: `${val}`,
    });
  }

  function handleBeepChanged(val: boolean) {
    updateSetting({
      settingType: SettingTypeEnum.DISPLAY_BEEP_ALERT,
      settingValue: `${val}`,
    });
  }

  function handleBeepDurationChanged(val: string) {
    updateSetting({
      settingType: SettingTypeEnum.DISPLAY_BEEP_ALERT_DURATION,
      settingValue: `${val}`,
    });
  }

  function displayMinuteIntervals(val: number) {
    if (val === 0)
      return t("settings.alertsAndNotifications.labels.timeIntervalNoTimeout");
    if (val === 1)
      return t(
        "settings.alertsAndNotifications.labels.timeIntervalSingleMinute"
      );
    return t("settings.alertsAndNotifications.labels.timeIntervalMinutes", {
      minutes: val,
    });
  }

  function displayTimeInterval(val: number) {
    if (val === 0)
      return t("settings.alertsAndNotifications.labels.timeIntervalNoTimeout");
    if (val === 1)
      return t(
        "settings.alertsAndNotifications.labels.timeIntervalSingleSecond"
      );
    if (val === 60)
      return t(
        "settings.alertsAndNotifications.labels.timeIntervalSingleMinute"
      );
    if (val > 250)
      return t("settings.alertsAndNotifications.labels.timeIntervalMinutes", {
        minutes: val / 60,
      });
    return t("settings.alertsAndNotifications.labels.timeIntervalSeconds", {
      seconds: val,
    });
  }

  return (
    <SettingsPageRoot>
      {isLoadingSettings && <SpinnerOverlay />}
      <SettingsPageContent>
        <Header>
          <SpotText level="h3">
            {t("settings.alertsAndNotifications.labels.title")}
          </SpotText>
        </Header>
        <Setting>
          <SpotText level="paragraph" bold>
            {t("settings.alertsAndNotifications.labels.newResults")}
          </SpotText>

          <RadioContainer>
            <Toggle
              disabled={updateSettingStatus.isLoading}
              label={t(
                "settings.alertsAndNotifications.labels.showNewResultsToggleLabel"
              )}
              checked={isShowAlert}
              onChange={() => handleShowAlertChanged(!isShowAlert)}
            />
          </RadioContainer>
          <SelectContainer>
            <Select
              value={showAlertDuration}
              onChange={(ev) =>
                handleAlertDurationChanged(ev.currentTarget.value)
              }
              disabled={!isShowAlert || updateSettingStatus.isLoading}
            >
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((opt) => (
                <Select.Option key={opt} value={opt}>
                  {displayMinuteIntervals(opt)}
                </Select.Option>
              ))}
            </Select>
          </SelectContainer>
        </Setting>
        <Setting>
          <RadioContainer>
            <Toggle
              disabled={updateSettingStatus.isLoading || !isShowAlert}
              label={t(
                "settings.alertsAndNotifications.labels.beepToggleLabel"
              )}
              checked={isBeepAlert && isShowAlert}
              onChange={() => handleBeepChanged(!isBeepAlert)}
            />
          </RadioContainer>
          <SelectContainer>
            <Select
              value={beepAlertDuration}
              onChange={(ev) =>
                handleBeepDurationChanged(ev.currentTarget.value)
              }
              disabled={
                !isShowAlert || !isBeepAlert || updateSettingStatus.isLoading
              }
            >
              {[1, 3, 5, 7, 15, 30, 45, 60].map((opt) => (
                <Select.Option key={opt} value={opt}>
                  {displayTimeInterval(opt)}
                </Select.Option>
              ))}
            </Select>
          </SelectContainer>
        </Setting>
      </SettingsPageContent>
    </SettingsPageRoot>
  );
}

export function extractAlertSettings(settings: Settings | undefined) {
  const isShowAlert = settings?.[SettingTypeEnum.DISPLAY_SHOW_ALERT] === "true";
  const showAlertDuration =
    parseFloat(
      settings?.[SettingTypeEnum.DISPLAY_BLINK_NEW_RESULTS_DURATION] ?? "0"
    ) || 0; // Intentionally short-circuiting with || to catch NaN.
  const isBeepAlert = settings?.[SettingTypeEnum.DISPLAY_BEEP_ALERT] === "true";
  const beepAlertDuration =
    parseFloat(
      settings?.[SettingTypeEnum.DISPLAY_BEEP_ALERT_DURATION] ?? "0"
    ) || 0; // Intentionally short-circuiting with || to catch NaN.

  return {
    isShowAlert,
    showAlertDuration,
    isBeepAlert,
    beepAlertDuration,
  };
}
