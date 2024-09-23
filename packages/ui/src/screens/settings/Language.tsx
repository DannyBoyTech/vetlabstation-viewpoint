import { useState } from "react";
import { SpotText, Select } from "@viewpoint/spot-react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import {
  useGetSettingQuery,
  useUpdateSettingMutation,
} from "../../api/SettingsApi";
import { SettingTypeEnum } from "@viewpoint/api";
import {
  SettingsPageContent,
  SettingsPageRoot,
} from "./common-settings-components";
import { useGetAvailableLocationsQuery } from "../../api/TimeAndDateApi";
import SpinnerOverlay from "../../components/overlay/SpinnerOverlay";

interface Language {
  code: string;
  locale: string;
}

export const SupportedLanguages: Language[] = [
  { code: "en", locale: "English" },
  { code: "fr", locale: "Français" },
  { code: "es", locale: "Español" },
  { code: "it", locale: "Italiano" },
  { code: "de", locale: "Deutsch" },
  { code: "ja", locale: "日本語" },
  { code: "ko", locale: "한국어" },
  { code: "zh_CN", locale: "简体中文" },
  { code: "zh_TW", locale: "繁體中文" },
  { code: "ru", locale: "Русский" },
  { code: "tr", locale: "Türkçe" },
  { code: "cs", locale: "Čeština" },
  { code: "pt", locale: "Português" },
  { code: "pl", locale: "Polski" },
  { code: "nl", locale: "Nederlands" },
  { code: "th", locale: "อังกฤษ" },
];

const Root = styled(SettingsPageRoot)`
  position: relative;
`;

const SelectContainer = styled.div`
  max-width: 30em;
`;

const Setting = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 20px;
  max-width: 20rem;
  margin-bottom: 20px;
`;

export function LanguageScreen() {
  const { t, i18n } = useTranslation();

  const [selectedLanguage, setSelectedLanguage] = useState<string>();
  const [selectedLocation, setSelectedLocation] = useState<string>();

  const { data: availableLocations, isLoading: availableLocationsLoading } =
    useGetAvailableLocationsQuery();
  const { data: clinicLanguage, isLoading: isClinicLanguageLoading } =
    useGetSettingQuery(SettingTypeEnum.CLINIC_LANGUAGE);
  const { data: clinicLocation, isLoading: isClinicLocationLoading } =
    useGetSettingQuery(SettingTypeEnum.CLINIC_COUNTRY);
  const [updateSetting] = useUpdateSettingMutation();

  const isLoading =
    availableLocationsLoading ||
    isClinicLocationLoading ||
    isClinicLanguageLoading;

  return (
    <Root>
      {isLoading && <SpinnerOverlay />}
      <SettingsPageContent>
        <Setting>
          <SpotText level="paragraph" bold>
            {t("settings.language.labels.title")}
          </SpotText>
          <Select
            value={selectedLanguage ?? clinicLanguage}
            onChange={(ev) => {
              updateSetting({
                settingType: SettingTypeEnum.CLINIC_LANGUAGE,
                settingValue: `${ev.currentTarget.value}`,
              });
              setSelectedLanguage(ev.currentTarget.value);
            }}
          >
            {SupportedLanguages.map((language) => (
              <Select.Option key={language.code} value={language.code}>
                {language.locale}
              </Select.Option>
            ))}
          </Select>
        </Setting>
        <Setting>
          <SpotText level="paragraph" bold>
            {t("settings.language.labels.location")}
          </SpotText>
          <SelectContainer>
            <Select
              value={selectedLocation ?? clinicLocation}
              onChange={(ev) => {
                updateSetting({
                  settingType: SettingTypeEnum.CLINIC_COUNTRY,
                  settingValue: `${ev.currentTarget.value}`,
                });
                setSelectedLocation(ev.currentTarget.value);
              }}
            >
              {availableLocations?.map((location) => (
                <Select.Option
                  key={location.countryCode}
                  value={location.countryCode}
                >
                  {location.countryName}
                </Select.Option>
              ))}
            </Select>
          </SelectContainer>
        </Setting>
      </SettingsPageContent>
    </Root>
  );
}
