import { InstrumentStatusDto, SettingTypeEnum } from "@viewpoint/api";
import {
  InstrumentPageContent,
  InstrumentPageRightPanel,
  InstrumentPageRightPanelButtonContainer,
  InstrumentPageRoot,
} from "../common-components";
import { Button, Toggle, SpotText, Checkbox } from "@viewpoint/spot-react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { Theme } from "../../../utils/StyleConstants";
import {
  useGetSettingsQuery,
  useUpdateSettingMutation,
} from "../../../api/SettingsApi";
import { useNavigate } from "react-router-dom";

const Divider = styled.div`
  border: ${(p: { theme: Theme }) => p.theme.borders?.lightPrimary};
  margin-top: 30px;
  margin-bottom: 15px;
`;

const SettingSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const CheckBoxWrapper = styled.div`
  margin-left: 50px;
`;

export const TestId = {
  AutoAddUaToggle: "svdx-settings-auto-add-ua-toggle",
  IncludeImageToggle: "svdx-settings-include-image-toggle",
  OnlyIfSedimentCheckbox: "svdx-settings-only-if-sediment-checkbox",
  BackButton: "svdx-settings-back-button",
};

export interface SedivueDxSettingsScreenProps {
  instrumentStatus: InstrumentStatusDto;
}

export function SediVueDxSettingsScreen() {
  const nav = useNavigate();
  const { t } = useTranslation();
  const { data: settings, isLoading } = useGetSettingsQuery([
    SettingTypeEnum.MANUAL_UA_AUTO_ADD,
    SettingTypeEnum.URISED_INCLUDE_IMAGE_ON_REPORT,
    SettingTypeEnum.URISED_ONLY_IF_SEDIMENT_PRESENT,
  ]);

  const [updateSetting, updateSettingsStatus] = useUpdateSettingMutation();

  const controlsDisabled = isLoading || updateSettingsStatus.isLoading;
  return (
    <InstrumentPageRoot>
      <InstrumentPageContent>
        <SpotText level="h3">
          {t("instrumentScreens.general.labels.settings")}
        </SpotText>

        <Divider />

        <SettingSection>
          <SpotText level="paragraph" bold>
            {t("instrumentScreens.sediVueDx.settings.uaHeader")}
          </SpotText>
          <Toggle
            data-testid={TestId.AutoAddUaToggle}
            checked={settings?.[SettingTypeEnum.MANUAL_UA_AUTO_ADD] === "true"}
            onChange={(ev) =>
              updateSetting({
                settingType: SettingTypeEnum.MANUAL_UA_AUTO_ADD,
                settingValue: `${ev.target.checked}`,
              })
            }
            disabled={controlsDisabled}
            label={t("instrumentScreens.sediVueDx.settings.autoAddUaSetting")}
          ></Toggle>
        </SettingSection>

        <Divider />

        <SettingSection>
          <SpotText level="paragraph" bold>
            {t("instrumentScreens.sediVueDx.settings.printingHeader")}
          </SpotText>
          <Toggle
            data-testid={TestId.IncludeImageToggle}
            checked={
              settings?.[SettingTypeEnum.URISED_INCLUDE_IMAGE_ON_REPORT] ===
              "true"
            }
            onChange={(ev) =>
              updateSetting({
                settingType: SettingTypeEnum.URISED_INCLUDE_IMAGE_ON_REPORT,
                settingValue: `${ev.target.checked}`,
              })
            }
            disabled={controlsDisabled}
            label={t("instrumentScreens.sediVueDx.settings.autoIncludeImages")}
          ></Toggle>

          {settings?.[SettingTypeEnum.URISED_INCLUDE_IMAGE_ON_REPORT] ===
            "true" && (
            <CheckBoxWrapper>
              <Checkbox
                data-testid={TestId.OnlyIfSedimentCheckbox}
                checked={
                  settings?.[
                    SettingTypeEnum.URISED_ONLY_IF_SEDIMENT_PRESENT
                  ] === "true"
                }
                onChange={(ev) =>
                  updateSetting({
                    settingType:
                      SettingTypeEnum.URISED_ONLY_IF_SEDIMENT_PRESENT,
                    settingValue: `${ev.target.checked}`,
                  })
                }
                disabled={controlsDisabled}
                label={t("instrumentScreens.sediVueDx.settings.onlyIfSediment")}
              ></Checkbox>
            </CheckBoxWrapper>
          )}
        </SettingSection>
      </InstrumentPageContent>
      <InstrumentPageRightPanel>
        <InstrumentPageRightPanelButtonContainer>
          <Button
            data-testid={TestId.BackButton}
            buttonType="secondary"
            onClick={() => nav(-1)}
          >
            {t("general.buttons.back")}
          </Button>
        </InstrumentPageRightPanelButtonContainer>
      </InstrumentPageRightPanel>
    </InstrumentPageRoot>
  );
}
