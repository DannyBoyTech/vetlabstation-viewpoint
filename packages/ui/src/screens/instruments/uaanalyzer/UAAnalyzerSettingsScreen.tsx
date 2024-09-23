import { SettingTypeEnum } from "@viewpoint/api";
import {
  InstrumentPageContent,
  InstrumentPageRightPanel,
  InstrumentPageRightPanelButtonContainer,
  InstrumentPageRoot,
} from "../common-components";
import styled from "styled-components";
import { Theme } from "../../../utils/StyleConstants";
import { Button, SpotText, Toggle } from "@viewpoint/spot-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  useGetSettingQuery,
  useUpdateSettingMutation,
} from "../../../api/SettingsApi";
import { ChangeEvent } from "react";

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

function UAAnalyzerSettingsScreen() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const { data: autoAddManualUA, isLoading: autoAddManualUAIsLoading } =
    useGetSettingQuery(SettingTypeEnum.MANUAL_UA_AUTO_ADD);
  const [updateSetting, { isLoading: updateSettingIsLoading }] =
    useUpdateSettingMutation();

  const handleAutoAddManualUAChange = (ev: ChangeEvent<HTMLInputElement>) => {
    const nextVal = ev.target.checked;

    updateSetting({
      settingType: SettingTypeEnum.MANUAL_UA_AUTO_ADD,
      settingValue: nextVal.toString(),
    });
  };

  const enableAutoAddManualUAToggle = !(
    autoAddManualUAIsLoading || updateSettingIsLoading
  );

  return (
    <InstrumentPageRoot>
      <Content>
        <SpotText level="h3">
          {t("instrumentScreens.general.labels.settings")}
        </SpotText>
        <Divider />
        <Section gap={17}>
          <SpotText level="paragraph" bold>
            {t(
              "instrumentScreens.uaAnalyzer.settings.section.physicalRecordEntry"
            )}
          </SpotText>
          <Toggle
            data-testid={TestId.AutoAddManualUAToggle}
            disabled={!enableAutoAddManualUAToggle}
            label={t("instrumentScreens.uaAnalyzer.settings.autoAddManualUA")}
            checked={autoAddManualUA === "true"}
            onChange={handleAutoAddManualUAChange}
          />
        </Section>
        <Divider />
      </Content>
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

//exported for test only
export { TestId };

export { UAAnalyzerSettingsScreen };
