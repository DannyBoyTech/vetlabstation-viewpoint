import { Button, SpotText, Toggle } from "@viewpoint/spot-react";
import {
  InstrumentPageContent,
  InstrumentPageRightPanel,
  InstrumentPageRightPanelButtonContainer,
  InstrumentPageRoot,
} from "../common-components";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { Theme } from "../../../utils/StyleConstants";
import {
  useRequestInstrumentSettingsUpdateMutation,
  useUpdateInstrumentSettingMutation,
} from "../../../api/InstrumentApi";
import { useEffect, useState } from "react";
import {
  EventIds,
  InstrumentSettingKey,
  InstrumentSettingResponseDto,
  InstrumentStatusDto,
  SettingTypeEnum,
} from "@viewpoint/api";
import { useEventListener } from "../../../context/EventSourceContext";
import dayjs from "dayjs";
import { TwelveHourTimeSelect } from "../../../components/input/TwelveHourTimeSelect";
import { FullSizeSpinner } from "../../../components/spinner/FullSizeSpinner";
import {
  useGetSettingQuery,
  useUpdateSettingMutation,
} from "../../../api/SettingsApi";

const Divider = styled.div`
  margin: 30px 0;
  border: ${(p: { theme: Theme }) => p.theme.borders?.lightPrimary};
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const SmartQCContainer = styled.div`
  display: flex;
  gap: 10px;
`;

const DropDownContainer = styled.div`
  position: relative;
`;

const SpinnerContainer = styled.div`
  position: absolute;
  inset: 0;
`;

const UTC_FORMAT = "YYYYMMDDTHHmmss";

export const TestId = {
  InvertReminderToggle: "pco-invert-reminder-toggle",
};

export interface ProCyteOneSettingsScreenProps {
  instrumentStatus: InstrumentStatusDto;
}

export function ProCyteOneSettingsScreen(props: ProCyteOneSettingsScreenProps) {
  const [qcAutoRunDatetime, setQcAutoRunDateTime] = useState<dayjs.Dayjs>();

  const { data: invertSample } = useGetSettingQuery(
    SettingTypeEnum.PROCYTE_ONE_INVERT_SAMPLE_REMINDER
  );

  const [requestInstrumentSetting] =
    useRequestInstrumentSettingsUpdateMutation();
  const [updateInstrumentSetting] = useUpdateInstrumentSettingMutation();
  const [updateSetting] = useUpdateSettingMutation();

  const { t } = useTranslation();
  const nav = useNavigate();

  useEffect(() => {
    requestInstrumentSetting({
      instrumentId: props.instrumentStatus.instrument.id,
      settingKey: InstrumentSettingKey.QC_AUTORUN_DATETIME,
    });
  }, [props.instrumentStatus.instrument.id]);

  useEventListener(EventIds.InstrumentSettingsUpdated, (msg) => {
    const data: InstrumentSettingResponseDto = JSON.parse(msg.data);
    if (
      data.setting?.settingKey === InstrumentSettingKey.QC_AUTORUN_DATETIME &&
      data.instrumentId === props.instrumentStatus.instrument.id
    ) {
      const value = data.setting.value as string;
      if (value != null) {
        // Date format that comes from IVLS/instrument is in UTC -- use UTC mode to parse the date
        const parsed = dayjs(value, UTC_FORMAT).utc(true);
        // We can't keep the dayjs object in UTC mode though -- we can't specify the TZ manually since it's set at the
        // OS and the TZ name IVLS uses is custom (it's just an offset, eg. "GMT -04:00") so it blows up the TZ
        // plugin within DayJS
        setQcAutoRunDateTime(parsed.local());
      }
    }
  });

  const handleTimeChange = (newHour: number) => {
    const newDateTime = dayjs().hour(newHour);
    const update = {
      instrumentId: props.instrumentStatus.instrument.id,
      settingKey: InstrumentSettingKey.QC_AUTORUN_DATETIME,
      value: newDateTime.utc().format(UTC_FORMAT) + "Z",
    };
    setQcAutoRunDateTime(newDateTime);
    updateInstrumentSetting(update);
  };

  const handleInversionReminderChanged = (remind: boolean) => {
    updateSetting({
      settingType: SettingTypeEnum.PROCYTE_ONE_INVERT_SAMPLE_REMINDER,
      settingValue: `${remind}`,
    });
  };

  return (
    <InstrumentPageRoot>
      <InstrumentPageContent data-testid="pco-settings-screen">
        <SpotText level="h3">
          {t("instrumentScreens.general.labels.settings")}
        </SpotText>
        <Divider />

        <Section>
          <Toggle
            data-testid={TestId.InvertReminderToggle}
            label="Sample Invert Reminder"
            checked={invertSample === "true"}
            onChange={(ev) => handleInversionReminderChanged(ev.target.checked)}
          />
        </Section>

        <Divider />

        <Section>
          <SpotText level="paragraph" bold>
            {t("barcodeType.SMART_QC")}
          </SpotText>
          <SpotText level="paragraph">
            {t("instrumentScreens.proCyteOne.settings.smartQcInfo")}
          </SpotText>
          <SmartQCContainer>
            <DropDownContainer>
              <TwelveHourTimeSelect
                disabled={qcAutoRunDatetime == null}
                onChanged={handleTimeChange}
                time={qcAutoRunDatetime?.format("HH:mm:ss")}
              />
              {qcAutoRunDatetime == null && (
                <SpinnerContainer>
                  <FullSizeSpinner />
                </SpinnerContainer>
              )}
            </DropDownContainer>
          </SmartQCContainer>
        </Section>
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
