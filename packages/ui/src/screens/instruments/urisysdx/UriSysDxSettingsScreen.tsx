import { SettingTypeEnum, UriSysReportingUnitTypeEnum } from "@viewpoint/api";
import {
  InstrumentPageContent,
  InstrumentPageRightPanel,
  InstrumentPageRightPanelButtonContainer,
  InstrumentPageRoot,
} from "../common-components";
import styled from "styled-components";
import { Theme } from "../../../utils/StyleConstants";
import { Button, Radio, SpotText, Toggle } from "@viewpoint/spot-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  useGetSettingQuery,
  useGetSettingsQuery,
  useUpdateSettingMutation,
} from "../../../api/SettingsApi";

const TestId = {
  AutoAddManualUAToggle: "auto-add-manual-ua-toggle",
  BackButton: "back-button",
} as const;

const Content = styled(InstrumentPageContent)`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Divider = styled.div`
  border: ${(p: { theme: Theme }) => p.theme.borders?.lightPrimary};
`;

const Section = styled.div<{ gap?: number }>`
  display: flex;
  flex-direction: column;
  gap: ${(p) => p.gap ?? 15}px;
`;

const ReportingUnitsHeader = styled(SpotText)`
  padding-bottom: 16px;
`;

function UriSysDxSettingsScreen() {
  const { t } = useTranslation();
  const nav = useNavigate();

  const {
    data: settings,
    isLoading,
    isFetching,
    isUninitialized,
  } = useGetSettingsQuery([
    SettingTypeEnum.MANUAL_UA_AUTO_ADD,
    SettingTypeEnum.URISYS_DX_SAMPLE_PREP_INSTRUCTIONS_ENABLED,
    SettingTypeEnum.UA_REPORTING_UNIT_TYPE,
  ]);

  const [updateSetting, updateSettingsStatus] = useUpdateSettingMutation();

  const controlsDisabled =
    isLoading ||
    isFetching ||
    isUninitialized ||
    updateSettingsStatus.isLoading;

  const reportingUnitType = settings?.[SettingTypeEnum.UA_REPORTING_UNIT_TYPE];

  const handleUnitTypeChanged = (value: UriSysReportingUnitTypeEnum) => {
    updateSetting({
      settingType: SettingTypeEnum.UA_REPORTING_UNIT_TYPE,
      settingValue: value,
    });
  };

  const TestIds = {
    nguaSettingsScreen: "ngua-settings-screen",
  } as const;

  return (
    <InstrumentPageRoot>
      <Content data-testid={TestIds.nguaSettingsScreen}>
        <SpotText level="h3">
          {t("instrumentScreens.general.labels.settings")}
        </SpotText>
        <Divider />
        <Section gap={17}>
          <Toggle
            label={t("instrumentScreens.uaAnalyzer.settings.autoAddManualUA")}
            checked={settings?.[SettingTypeEnum.MANUAL_UA_AUTO_ADD] === "true"}
            onChange={(ev) =>
              updateSetting({
                settingType: SettingTypeEnum.MANUAL_UA_AUTO_ADD,
                settingValue: `${ev.target.checked}`,
              })
            }
            disabled={controlsDisabled}
          />
          <Toggle
            label={t(
              "instrumentScreens.uaAnalyzer.settings.samplePreparationInstructions"
            )}
            checked={
              settings?.[
                SettingTypeEnum.URISYS_DX_SAMPLE_PREP_INSTRUCTIONS_ENABLED
              ] === "true"
            }
            onChange={(ev) =>
              updateSetting({
                settingType:
                  SettingTypeEnum.URISYS_DX_SAMPLE_PREP_INSTRUCTIONS_ENABLED,
                settingValue: `${ev.target.checked}`,
              })
            }
            disabled={controlsDisabled}
          />
          <Divider />
          <div>
            <ReportingUnitsHeader level="h5" bold>
              {t("instrumentScreens.uaAnalyzer.settings.reportingUnits")}
            </ReportingUnitsHeader>
            <div>
              <Radio
                label={t(
                  "instrumentScreens.uaAnalyzer.settings.reportingUnitsOptions.conventional"
                )}
                checked={
                  reportingUnitType === UriSysReportingUnitTypeEnum.CONVENTIONAL
                }
                onChange={() =>
                  handleUnitTypeChanged(
                    UriSysReportingUnitTypeEnum.CONVENTIONAL
                  )
                }
                disabled={controlsDisabled}
              />
              <Radio
                disabled={controlsDisabled}
                label={t(
                  "instrumentScreens.uaAnalyzer.settings.reportingUnitsOptions.arbitrary"
                )}
                checked={
                  reportingUnitType === UriSysReportingUnitTypeEnum.ARBITRARY
                }
                onChange={() =>
                  handleUnitTypeChanged(UriSysReportingUnitTypeEnum.ARBITRARY)
                }
              />
              <Radio
                disabled={controlsDisabled}
                label={t(
                  "instrumentScreens.uaAnalyzer.settings.reportingUnitsOptions.si"
                )}
                checked={reportingUnitType === UriSysReportingUnitTypeEnum.SI}
                onChange={() =>
                  handleUnitTypeChanged(UriSysReportingUnitTypeEnum.SI)
                }
              />
              <Radio
                disabled={controlsDisabled}
                label={t(
                  "instrumentScreens.uaAnalyzer.settings.reportingUnitsOptions.arbitraryAndConventional"
                )}
                checked={
                  reportingUnitType ===
                  UriSysReportingUnitTypeEnum.ARBITRARY_CONVENTIONAL
                }
                onChange={() =>
                  handleUnitTypeChanged(
                    UriSysReportingUnitTypeEnum.ARBITRARY_CONVENTIONAL
                  )
                }
              />
              <Radio
                disabled={controlsDisabled}
                label={t(
                  "instrumentScreens.uaAnalyzer.settings.reportingUnitsOptions.arbitraryAndSi"
                )}
                checked={
                  reportingUnitType === UriSysReportingUnitTypeEnum.ARBITRARY_SI
                }
                onChange={() =>
                  handleUnitTypeChanged(
                    UriSysReportingUnitTypeEnum.ARBITRARY_SI
                  )
                }
              />
            </div>
          </div>
        </Section>
      </Content>
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

export { UriSysDxSettingsScreen };
