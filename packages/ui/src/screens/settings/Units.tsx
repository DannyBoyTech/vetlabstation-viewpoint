import { SpotText, Radio } from "@viewpoint/spot-react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import {
  useGetSettingsQuery,
  useUpdateSettingMutation,
} from "../../api/SettingsApi";
import {
  SettingTypeEnum,
  PatientWeightUnitsEnum,
  PatientUnitSystemEnum,
} from "@viewpoint/api";
import { SettingsPageRoot } from "./common-settings-components";
import SpinnerOverlay from "../../components/overlay/SpinnerOverlay";
import { Theme } from "../../utils/StyleConstants";

const Root = styled(SettingsPageRoot)`
  position: relative;
`;

export const SettingsPageContent = styled.div`
  flex: auto;
  margin: 30px;
  padding: 20px;
  background-color: ${(p: { theme: Theme }) =>
    p.theme.colors?.background?.primary};
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

const TestIds = {
  settingsMain: "settings-main",
} as const;

export function UnitScreen() {
  const { t } = useTranslation();

  const { data: settings, isLoading } = useGetSettingsQuery([
    SettingTypeEnum.UNIT_SYSTEM,
    SettingTypeEnum.WEIGHT_UNIT_TYPE,
  ]);
  const [updateSetting] = useUpdateSettingMutation();

  function handleWeightTypeChanged(val: PatientWeightUnitsEnum) {
    updateSetting({
      settingType: SettingTypeEnum.WEIGHT_UNIT_TYPE,
      settingValue: `${val}`,
    });
  }

  function handleUnitSystemChanged(val: PatientUnitSystemEnum) {
    updateSetting({
      settingType: SettingTypeEnum.UNIT_SYSTEM,
      settingValue: `${val}`,
    });
  }

  return (
    <Root>
      {isLoading && <SpinnerOverlay />}
      <SettingsPageContent data-testid={TestIds.settingsMain}>
        <Setting>
          <SpotText level="paragraph" bold>
            {t("settings.units.labels.title")}
          </SpotText>

          <RadioContainer>
            <Radio
              label={t("unitSystem.US")}
              checked={settings?.UNIT_SYSTEM === PatientUnitSystemEnum.US}
              onChange={() => handleUnitSystemChanged(PatientUnitSystemEnum.US)}
            />
            <Radio
              label={t("unitSystem.SI")}
              checked={settings?.UNIT_SYSTEM === PatientUnitSystemEnum.SI}
              onChange={() => handleUnitSystemChanged(PatientUnitSystemEnum.SI)}
            />
            <Radio
              label={t("unitSystem.French")}
              checked={settings?.UNIT_SYSTEM === PatientUnitSystemEnum.FRENCH}
              onChange={() =>
                handleUnitSystemChanged(PatientUnitSystemEnum.FRENCH)
              }
            />
          </RadioContainer>
        </Setting>
        <Setting>
          <SpotText level="paragraph" bold>
            {t("settings.units.labels.weight")}
          </SpotText>
          <RadioContainer>
            <Radio
              label={t("settings.units.labels.Pounds")}
              checked={
                settings?.WEIGHT_UNIT_TYPE === PatientWeightUnitsEnum.POUNDS
              }
              onChange={() =>
                handleWeightTypeChanged(PatientWeightUnitsEnum.POUNDS)
              }
            />
            <Radio
              label={t("settings.units.labels.Kilograms")}
              checked={
                settings?.WEIGHT_UNIT_TYPE === PatientWeightUnitsEnum.KILOGRAMS
              }
              onChange={() =>
                handleWeightTypeChanged(PatientWeightUnitsEnum.KILOGRAMS)
              }
            />
          </RadioContainer>
        </Setting>
      </SettingsPageContent>
    </Root>
  );
}
