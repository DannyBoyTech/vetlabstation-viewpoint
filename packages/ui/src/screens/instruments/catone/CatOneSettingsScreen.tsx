import { Button, ButtonGroup, SpotText } from "@viewpoint/spot-react";
import {
  InstrumentPageContent,
  InstrumentPageRightPanel,
  InstrumentPageRightPanelButtonContainer,
  InstrumentPageRoot,
} from "../common-components";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { Theme } from "../../../utils/StyleConstants";
import { useNavigate, useParams } from "react-router-dom";
import {
  useEnterStandbyMutation,
  useExitStandbyMutation,
  useGetInstrumentQuery,
} from "../../../api/InstrumentApi";
import { skipToken } from "@reduxjs/toolkit/query";
import { CatOneConfigurationDto, InstrumentStatus } from "@viewpoint/api";
import SpinnerOverlay from "../../../components/overlay/SpinnerOverlay";
import { useCallback, useEffect, useState } from "react";
import { TwelveHourTimeSelect } from "../../../components/input/TwelveHourTimeSelect";
import {
  useGetCatOneConfigurationQuery,
  useUpdateCatOneConfigurationMutation,
} from "../../../api/CatOneApi";

const Divider = styled.div`
  border: ${(p: { theme: Theme }) => p.theme.borders?.lightPrimary};
  margin: 30px 0px;
`;

const Content = styled.div`
  display: grid;
  grid-template-columns: auto auto 1fr 1fr;
  gap: 30px;
  align-items: center;
  width: 90%;
`;

const ButtonContainer = styled.div`
  display: flex;

  .spot-button-group {
    display: flex;
    flex: 1;

    label {
      flex: 1;
      justify-content: center;
    }
  }
`;

function configsMatch(
  configOne: CatOneConfigurationDto,
  configTwo: CatOneConfigurationDto
): boolean {
  return (
    configOne.soundLevel === configTwo.soundLevel &&
    configOne.automaticEnterStandbyTime ===
      configTwo.automaticEnterStandbyTime &&
    configOne.automaticEnterStandbyMode ===
      configTwo.automaticEnterStandbyMode &&
    configOne.automaticExitStandbyTime === configTwo.automaticExitStandbyTime &&
    configOne.automaticExitStandbyMode === configTwo.automaticExitStandbyMode
  );
}

export function CatOneSettingsScreen() {
  // const [newConfig, setNewConfig] = useState<CatOneConfigurationDto>();

  const { instrumentId: instrumentIdParam } = useParams();
  const { t } = useTranslation();
  const nav = useNavigate();
  const [updateConfig] = useUpdateCatOneConfigurationMutation();
  const [enterStandby] = useEnterStandbyMutation();
  const [exitStandby] = useExitStandbyMutation();

  const { data: config, isLoading } = useGetCatOneConfigurationQuery(
    instrumentIdParam == null ? skipToken : parseInt(instrumentIdParam)
  );

  const { data: instrument, isLoading: instrumentLoading } =
    useGetInstrumentQuery(
      instrumentIdParam == null ? skipToken : parseInt(instrumentIdParam)
    );

  const handleUpdateConfig = useCallback(
    (newConfig: CatOneConfigurationDto) => {
      if (config != null && !configsMatch(config, newConfig)) {
        updateConfig({
          instrumentId: instrument!.instrument.id,
          configuration: newConfig,
        });
      }
    },
    [config, instrument, updateConfig]
  );

  const navToInstrumentsScreen = useCallback(
    () => nav(`/instruments/${instrument?.instrument.id}`),
    [nav, instrument?.instrument.id]
  );

  useEffect(() => {
    if (!instrument?.connected) {
      navToInstrumentsScreen();
    }
  }, [instrument?.connected, navToInstrumentsScreen]);

  return (
    <InstrumentPageRoot data-testid="settings-standby">
      <InstrumentPageContent>
        {isLoading ||
        instrumentLoading ||
        instrument == null ||
        config == null ? (
          <SpinnerOverlay />
        ) : (
          <>
            <SpotText data-testid="standby-settings" level="h3">
              {t("instrumentScreens.general.labels.settings")}
            </SpotText>
            <Divider />

            <Content>
              <SpotText data-testid="standby-sound" level="paragraph" bold>
                {t("instrumentScreens.catOne.settings.sound")}
              </SpotText>
              <div />
              <SoundSettings
                onChange={(soundLevel) =>
                  handleUpdateConfig({ ...config, soundLevel })
                }
                soundLevel={config?.soundLevel}
              />
              <div />

              <SpotText data-testid="standby-standby" level="paragraph" bold>
                {t("instrumentScreens.catOne.settings.standby")}
              </SpotText>
              <div>
                {instrument?.instrumentStatus !== InstrumentStatus.Standby && (
                  <Button
                    buttonType="primary"
                    onClick={() => {
                      enterStandby(instrument.instrument.id);
                      navToInstrumentsScreen();
                    }}
                  >
                    {t("general.buttons.now")}
                  </Button>
                )}
              </div>
              <StandbyModeSelector
                onModeChanged={(newMode) =>
                  handleUpdateConfig({
                    ...config,
                    automaticEnterStandbyMode: newMode,
                    automaticExitStandbyMode: newMode,
                  })
                }
                mode={config.automaticEnterStandbyMode}
              />
              <TwelveHourTimeSelect
                mode={config.automaticEnterStandbyMode}
                time={config.automaticEnterStandbyTime}
                onChanged={(hour) =>
                  handleUpdateConfig({
                    ...config,
                    automaticEnterStandbyTime: `${hour
                      .toString()
                      .padStart(2, "0")}:00:00`,
                  })
                }
              />

              <SpotText data-testid="standby-exit" level="paragraph" bold>
                {t("instrumentScreens.catOne.settings.exitStandby")}
              </SpotText>
              <div>
                {instrument?.instrumentStatus === InstrumentStatus.Standby && (
                  <Button
                    buttonType="primary"
                    onClick={() => {
                      exitStandby(instrument.instrument.id);
                      navToInstrumentsScreen();
                    }}
                  >
                    {t("general.buttons.now")}
                  </Button>
                )}
              </div>
              <StandbyModeSelector
                onModeChanged={(newMode) =>
                  handleUpdateConfig({
                    ...config,
                    automaticEnterStandbyMode: newMode,
                    automaticExitStandbyMode: newMode,
                  })
                }
                mode={config.automaticExitStandbyMode}
              />
              <TwelveHourTimeSelect
                mode={config.automaticExitStandbyMode}
                time={config.automaticExitStandbyTime}
                onChanged={(hour) =>
                  handleUpdateConfig({
                    ...config,
                    automaticExitStandbyTime: `${hour
                      .toString()
                      .padStart(2, "0")}:00:00`,
                  })
                }
              />
            </Content>
          </>
        )}
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

type SoundLevel = CatOneConfigurationDto["soundLevel"];

interface SoundSettingsProps {
  soundLevel?: SoundLevel;
  onChange: (soundLevel: SoundLevel) => void;
}

function SoundSettings(props: SoundSettingsProps) {
  const { t } = useTranslation();
  return (
    <ButtonContainer>
      <ButtonGroup withLines variant="toggle">
        <input
          id={"Off"}
          type="radio"
          checked={props.soundLevel === "Off"}
          onChange={() => props.onChange("Off")}
        />
        <label htmlFor="Off">{t("general.buttons.off")}</label>

        <input
          id={"Low"}
          type="radio"
          checked={props.soundLevel === "Low"}
          onChange={() => props.onChange("Low")}
        />
        <label htmlFor="Low">{t("general.buttons.low")}</label>

        <input
          id={"High"}
          type="radio"
          checked={props.soundLevel === "High"}
          onChange={() => props.onChange("High")}
        />
        <label htmlFor="High">{t("general.buttons.high")}</label>
      </ButtonGroup>
    </ButtonContainer>
  );
}

interface StandbyModeSelectorProps {
  mode?: "never" | "daily";
  onModeChanged: (newMode: "never" | "daily") => void;
}

function StandbyModeSelector(props: StandbyModeSelectorProps) {
  const { t } = useTranslation();
  return (
    <ButtonContainer>
      <ButtonGroup withLines variant="toggle">
        <input
          id={"Never"}
          type="radio"
          checked={props.mode === "never"}
          onChange={() => props.onModeChanged("never")}
        />
        <label htmlFor="Never">{t("general.buttons.never")}</label>

        <input
          id={"Daily"}
          type="radio"
          checked={props.mode === "daily"}
          onChange={() => props.onModeChanged("daily")}
        />
        <label htmlFor="Daily">{t("general.buttons.daily")}</label>
      </ButtonGroup>
    </ButtonContainer>
  );
}
