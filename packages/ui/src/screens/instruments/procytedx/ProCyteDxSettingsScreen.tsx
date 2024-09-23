import {
  CrimsonPropertiesDto,
  InstrumentStatusDto,
  SampleDrawerPositionEnum,
  SettingTypeEnum,
} from "@viewpoint/api";
import {
  Button,
  Radio,
  RadioGroup,
  SpotText,
  Toggle,
} from "@viewpoint/spot-react";
import {
  InstrumentPageContent,
  InstrumentPageRightPanel,
  InstrumentPageRightPanelButtonContainer,
  InstrumentPageRoot,
} from "../common-components";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { Theme } from "../../../utils/StyleConstants";
import { TwelveHourTimeSelect } from "../../../components/input/TwelveHourTimeSelect";
import {
  useGetSettingsQuery,
  useUpdateSettingMutation,
} from "../../../api/SettingsApi";
import {
  useGetProCyteDxInstrumentSettingsQuery,
  useUpdateProCyteDxInstrumentSettingsMutation,
} from "../../../api/ProCyteDxApi";
import SpinnerOverlay from "../../../components/overlay/SpinnerOverlay";
import dayjs from "dayjs";
import { useCallback, useMemo } from "react";

export interface ProCyteDxSettingsScreenProps {
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

const RadioContainer = styled.div`
  display: flex;
  gap: 20px;
`;

export const TestId = {
  AspirationSensorToggle: "pdx-settings-aspiration-sensor-toggle",
  SampleInvertReminderToggle: "pdx-settings-sample-invert-toggle",
  ReagentLowReminderToggle: "pdx-settings-reagent-low-toggle",
  SynovialFluidReminderToggle: "pdx-settings-synovial-fluid-toggle",
  SampleDrawerOpenRadio: "pdx-settings-sample-drawer-open-radio",
  SampleDrawerClosedRadio: "pdx-settings-sample-drawer-closed-radio",
  BackButton: "pdx-settings-back-button",
};

export function ProCyteDxSettingsScreen(props: ProCyteDxSettingsScreenProps) {
  const nav = useNavigate();
  const { t } = useTranslation();

  const [updateInstrumentProperty, updateInstrumentPropertyStatus] =
    useUpdateProCyteDxInstrumentSettingsMutation();
  const [updateSetting, updateSettingStatus] = useUpdateSettingMutation();

  const {
    data: ivlsSettings,
    isLoading: ivlsSettingsLoading,
    isFetching: ivlsSettingsFetching,
    isUninitialized: ivlsSettingsUninitialized,
  } = useGetSettingsQuery([
    SettingTypeEnum.INVERT_SAMPLE_REMINDER,
    SettingTypeEnum.REAGENT_LOW_REMINDER,
    SettingTypeEnum.PROCYTE_SYNOVIAL_FLUID_REMINDER,
  ]);
  const {
    data: instrumentSettings,
    isLoading: instrumentSettingsLoading,
    isFetching: instrumentSettingsFetching,
    isUninitialized: instrumentSettingsUninitialized,
  } = useGetProCyteDxInstrumentSettingsQuery(
    props.instrumentStatus.instrument.id
  );

  const standbyTime: string | undefined = useMemo(
    () =>
      instrumentSettings?.standByTime == null
        ? undefined
        : dayjs().hour(instrumentSettings.standByTime.hours).format("HH:mm:ss"),
    [instrumentSettings?.standByTime]
  );

  const handleInstrumentSettingUpdate = useCallback(
    (updates: Partial<CrimsonPropertiesDto>) => {
      updateInstrumentProperty({
        instrumentId: props.instrumentStatus.instrument.id,
        // Always convert the standby time back to 24 hour when submitting
        properties: {
          ...instrumentSettings,
          ...updates,
        },
      });
    },
    [
      updateInstrumentProperty,
      props.instrumentStatus.instrument.id,
      instrumentSettings,
    ]
  );

  const instrumentSettingsDisabled =
    instrumentSettingsLoading ||
    instrumentSettingsFetching ||
    instrumentSettingsUninitialized ||
    updateInstrumentPropertyStatus.isLoading;

  const ivlsSettingsDisabled =
    ivlsSettingsUninitialized ||
    ivlsSettingsLoading ||
    ivlsSettingsFetching ||
    updateSettingStatus.isLoading;

  return (
    <InstrumentPageRoot>
      {(ivlsSettingsUninitialized ||
        ivlsSettingsLoading ||
        instrumentSettingsUninitialized ||
        instrumentSettingsLoading) && <SpinnerOverlay />}
      <Content>
        <SpotText level="h3">
          {t("instrumentScreens.general.labels.settings")}
        </SpotText>
        <Divider />
        <Section gap={30}>
          <Toggle
            data-testid={TestId.AspirationSensorToggle}
            disabled={instrumentSettingsDisabled}
            label={t("instrumentScreens.proCyteDx.settings.aspirationSensor")}
            checked={!!instrumentSettings?.aspirationSensorEnable}
            onChange={(ev) =>
              handleInstrumentSettingUpdate({
                aspirationSensorEnable: ev.target.checked,
              })
            }
          />
          <Toggle
            data-testid={TestId.SampleInvertReminderToggle}
            disabled={ivlsSettingsDisabled}
            label={t(
              "instrumentScreens.proCyteDx.settings.sampleInvertReminder"
            )}
            checked={
              ivlsSettings?.[SettingTypeEnum.INVERT_SAMPLE_REMINDER] === "true"
            }
            onChange={(ev) =>
              updateSetting({
                settingType: SettingTypeEnum.INVERT_SAMPLE_REMINDER,
                settingValue: `${ev.target.checked}`,
              })
            }
          />
          <Toggle
            data-testid={TestId.ReagentLowReminderToggle}
            disabled={ivlsSettingsDisabled}
            label={t("instrumentScreens.proCyteDx.settings.reagentLowReminder")}
            checked={
              ivlsSettings?.[SettingTypeEnum.REAGENT_LOW_REMINDER] === "true"
            }
            onChange={(ev) =>
              updateSetting({
                settingType: SettingTypeEnum.REAGENT_LOW_REMINDER,
                settingValue: `${ev.target.checked}`,
              })
            }
          />
          <Toggle
            data-testid={TestId.SynovialFluidReminderToggle}
            disabled={ivlsSettingsDisabled}
            label={t(
              "instrumentScreens.proCyteDx.settings.synovialFluidReminder"
            )}
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
            {t("instrumentScreens.proCyteDx.settings.standby")}
          </SpotText>
          <SpotText level="paragraph">
            {t("instrumentScreens.proCyteDx.settings.standbyDetails")}
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
                disabled={instrumentSettingsDisabled}
              />
            </DropDownContainer>
          </TimeSelectContainer>
        </Section>
        <Divider />
        <Section>
          <SpotText level="paragraph" bold>
            {t("instrumentScreens.proCyteDx.settings.sampleDrawerPosition")}
          </SpotText>
          <RadioGroup>
            <RadioContainer>
              <Radio
                data-testid={TestId.SampleDrawerOpenRadio}
                disabled={instrumentSettingsDisabled}
                label={t("instrumentScreens.proCyteDx.settings.open")}
                onChange={(ev) =>
                  handleInstrumentSettingUpdate({
                    sampleDrawerPosition: ev.target.checked
                      ? SampleDrawerPositionEnum.OPENED
                      : SampleDrawerPositionEnum.CLOSED,
                  })
                }
                checked={
                  instrumentSettings?.sampleDrawerPosition ===
                  SampleDrawerPositionEnum.OPENED
                }
              />
              <Radio
                data-testid={TestId.SampleDrawerClosedRadio}
                disabled={instrumentSettingsDisabled}
                label={t("instrumentScreens.proCyteDx.settings.closed")}
                checked={
                  instrumentSettings?.sampleDrawerPosition ===
                  SampleDrawerPositionEnum.CLOSED
                }
                onChange={(ev) =>
                  handleInstrumentSettingUpdate({
                    sampleDrawerPosition: ev.target.checked
                      ? SampleDrawerPositionEnum.CLOSED
                      : SampleDrawerPositionEnum.OPENED,
                  })
                }
              />
            </RadioContainer>
          </RadioGroup>
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
