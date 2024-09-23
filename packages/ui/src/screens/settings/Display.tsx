import { useTranslation } from "react-i18next";
import styled from "styled-components";

import { SpotText, Checkbox } from "@viewpoint/spot-react";
import { SettingTypeEnum } from "@viewpoint/api";
import {
  Divider,
  SettingsPageContent,
  SettingsPageRoot,
} from "./common-settings-components";
import SpinnerOverlay from "../../components/overlay/SpinnerOverlay";
import {
  useGetSettingsQuery,
  useUpdateSettingMutation,
} from "../../api/SettingsApi";

const CheckBoxContainer = styled.div`
  display: flex;
  gap: 32px;
  margin: 16px 0;
`;

const StyledSettingsSection = styled.div`
  margin-top: 24px;
`;

export function Display() {
  const { t } = useTranslation();

  const { data: settings, isLoading } = useGetSettingsQuery([
    SettingTypeEnum.DISPLAY_PENDING_REQUESTS,
    SettingTypeEnum.DISPLAY_CENSUS_LIST,
    SettingTypeEnum.DISPLAY_DOCTOR_NAME,
    SettingTypeEnum.DISPLAY_PATIENT_BREED,
    SettingTypeEnum.DISPLAY_PATIENT_GENDER,
    SettingTypeEnum.DISPLAY_PATIENT_WEIGHT,
    SettingTypeEnum.DISPLAY_REASON_FOR_TESTING,
  ]);

  const [updateSetting, updateSettingStatus] = useUpdateSettingMutation();

  const handleSettingChanged = (
    settingType: SettingTypeEnum,
    settingValue: string
  ) => {
    updateSetting({ settingType, settingValue });
  };

  const isControlsDisabled = isLoading || updateSettingStatus.isLoading;

  const TestId = {
    displaySettingsPage: "display-settings-page",
  } as const;

  return (
    <SettingsPageRoot>
      {isLoading && <SpinnerOverlay />}
      <SettingsPageContent data-testid={TestId.displaySettingsPage}>
        <SpotText level="h3">{t("settings.display.title")}</SpotText>

        <StyledSettingsSection>
          <SpotText level="paragraph" bold>
            {t("settings.display.includeOnHomeScreen")}
          </SpotText>
          <CheckBoxContainer>
            <Checkbox
              checked={
                settings?.[SettingTypeEnum.DISPLAY_PENDING_REQUESTS] === "true"
              }
              disabled={isControlsDisabled}
              onChange={(ev) =>
                handleSettingChanged(
                  SettingTypeEnum.DISPLAY_PENDING_REQUESTS,
                  `${ev.target.checked}`
                )
              }
              label={t("settings.display.pendingList")}
            />
            <Checkbox
              checked={
                settings?.[SettingTypeEnum.DISPLAY_CENSUS_LIST] === "true"
              }
              disabled={isControlsDisabled}
              onChange={(ev) =>
                handleSettingChanged(
                  SettingTypeEnum.DISPLAY_CENSUS_LIST,
                  `${ev.target.checked}`
                )
              }
              label={t("settings.display.censusList")}
            />
          </CheckBoxContainer>
        </StyledSettingsSection>

        <Divider />

        <StyledSettingsSection>
          <SpotText level="paragraph" bold>
            {t("settings.display.includeInPatientAndOrderDetails")}
          </SpotText>
          <CheckBoxContainer>
            <Checkbox
              disabled={isControlsDisabled}
              checked={
                settings?.[SettingTypeEnum.DISPLAY_DOCTOR_NAME] === "true"
              }
              onChange={(ev) =>
                handleSettingChanged(
                  SettingTypeEnum.DISPLAY_DOCTOR_NAME,
                  `${ev.target.checked}`
                )
              }
              label={t("settings.display.doctor")}
            />
            <Checkbox
              disabled={isControlsDisabled}
              checked={
                settings?.[SettingTypeEnum.DISPLAY_PATIENT_BREED] === "true"
              }
              onChange={(ev) =>
                handleSettingChanged(
                  SettingTypeEnum.DISPLAY_PATIENT_BREED,
                  `${ev.target.checked}`
                )
              }
              label={t("settings.display.breed")}
            />

            <Checkbox
              disabled={isControlsDisabled}
              checked={
                settings?.[SettingTypeEnum.DISPLAY_PATIENT_GENDER] === "true"
              }
              onChange={(ev) =>
                handleSettingChanged(
                  SettingTypeEnum.DISPLAY_PATIENT_GENDER,
                  `${ev.target.checked}`
                )
              }
              label={t("settings.display.sex")}
            />

            <Checkbox
              disabled={isControlsDisabled}
              checked={
                settings?.[SettingTypeEnum.DISPLAY_PATIENT_WEIGHT] === "true"
              }
              onChange={(ev) =>
                handleSettingChanged(
                  SettingTypeEnum.DISPLAY_PATIENT_WEIGHT,
                  `${ev.target.checked}`
                )
              }
              label={t("settings.display.weight")}
            />

            <Checkbox
              disabled={isControlsDisabled}
              checked={
                settings?.[SettingTypeEnum.DISPLAY_REASON_FOR_TESTING] ===
                "true"
              }
              onChange={(ev) =>
                handleSettingChanged(
                  SettingTypeEnum.DISPLAY_REASON_FOR_TESTING,
                  `${ev.target.checked}`
                )
              }
              label={t("settings.display.reasonForTesting")}
            />
          </CheckBoxContainer>
        </StyledSettingsSection>
      </SettingsPageContent>
    </SettingsPageRoot>
  );
}
