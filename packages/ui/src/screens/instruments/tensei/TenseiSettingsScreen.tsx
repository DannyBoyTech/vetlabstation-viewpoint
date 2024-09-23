import {
  CrimsonPropertiesDto,
  InstrumentStatusDto,
  SettingTypeEnum,
} from "@viewpoint/api";
import { Button, SpotText, Toggle } from "@viewpoint/spot-react";
import {
  InstrumentPageContent,
  InstrumentPageRightPanel,
  InstrumentPageRightPanelButtonContainer,
  InstrumentPageRoot,
} from "../common-components";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { Theme } from "../../../utils/StyleConstants";
import { TwelveHourTimeSelect } from "../../../components/input/TwelveHourTimeSelect";
import {
  useGetSettingsQuery,
  useUpdateSettingMutation,
} from "../../../api/SettingsApi";
import dayjs from "dayjs";
import { useCallback, useMemo } from "react";

export interface TenseiSettingsScreenProps {
  instrumentStatus: InstrumentStatusDto;
}

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

const TimeSelectContainer = styled.div`
  display: flex;
`;

const DropDownContainer = styled.div`
  position: relative;
`;

export const TestId = {
  AspirationSensorToggle: "tensei-settings-aspiration-sensor-toggle",
  SampleInvertReminderToggle: "tensei-settings-sample-invert-toggle",
  ReagentLowReminderToggle: "tensei-settings-reagent-low-toggle",
  SynovialFluidReminderToggle: "tensei-settings-synovial-fluid-toggle",
  BackButton: "tensei-settings-back-button",
};

export function TenseiSettingsScreen(props: TenseiSettingsScreenProps) {
  const nav = useNavigate();
  const { t } = useTranslation();

  const [updateSetting, updateSettingStatus] = useUpdateSettingMutation();

  const { data: ivlsSettings } = useGetSettingsQuery([
    SettingTypeEnum.PROCYTE_SYNOVIAL_FLUID_REMINDER,
  ]);

  const [instrumentSettings, setInstrumentSettings] =
    useState<CrimsonPropertiesDto>({
      standByTime: { hours: 0, minutes: 0, isPm: false },
    });

  const standbyTime: string | undefined = useMemo(
    () =>
      instrumentSettings?.standByTime == null
        ? undefined
        : dayjs().hour(instrumentSettings.standByTime.hours).format("HH:mm:ss"),
    [instrumentSettings?.standByTime]
  );

  const handleInstrumentSettingUpdate = useCallback(
    (updates: Partial<CrimsonPropertiesDto>) => {
      setInstrumentSettings((prev) => ({
        ...prev,
        ...updates,
      }));
    },
    []
  );

  return (
    <InstrumentPageRoot>
      <Content>
        <SpotText level="h3">
          {t("instrumentScreens.general.labels.settings")}
        </SpotText>
        <Divider />
        <Section gap={30}>
          <Toggle
            data-testid={TestId.SynovialFluidReminderToggle}
            label={t("instrumentScreens.tensei.settings.synovialFluidReminder")}
            checked={
              ivlsSettings?.[
                SettingTypeEnum.PROCYTE_SYNOVIAL_FLUID_REMINDER
              ] === "true"
            }
            onChange={(ev) =>
              updateSetting({
                settingType: SettingTypeEnum.PROCYTE_SYNOVIAL_FLUID_REMINDER,
                settingValue: `${ev.target.checked}`,
              })
            }
          />
        </Section>
        <Divider />
        <Section>
          <SpotText level="paragraph" bold>
            {t("instrumentScreens.tensei.settings.standby")}
          </SpotText>
          <SpotText level="paragraph">
            {t("instrumentScreens.tensei.settings.standbyDetails")}
          </SpotText>
          <TimeSelectContainer>
            <DropDownContainer>
              <TwelveHourTimeSelect
                time={standbyTime}
                onChanged={(hour) =>
                  handleInstrumentSettingUpdate({
                    standByTime: {
                      hours: hour,
                      minutes: 0,
                      isPm: hour >= 12,
                    },
                  })
                }
              />
            </DropDownContainer>
          </TimeSelectContainer>
        </Section>
      </Content>
      <InstrumentPageRightPanel>
        <InstrumentPageRightPanelButtonContainer>
          <Button
            buttonType="secondary"
            data-testid={TestId.BackButton}
            onClick={() => nav(-1)}
          >
            {t("general.buttons.back")}
          </Button>
        </InstrumentPageRightPanelButtonContainer>
      </InstrumentPageRightPanel>
    </InstrumentPageRoot>
  );
}
