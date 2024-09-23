import { useTranslation, Trans } from "react-i18next";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import {
  Button,
  Checkbox,
  SpotText,
  Toggle,
  useToast,
} from "@viewpoint/spot-react";
import {
  Divider,
  SettingsPageRoot,
  SettingsPageContent,
} from "../common-settings-components";
import SpinnerOverlay from "../../../components/overlay/SpinnerOverlay";
import {
  useGetSettingsQuery,
  useUpdateSettingMutation,
  useBatchUpdateSettingsMutation,
} from "../../../api/SettingsApi";
import {
  SettingTypeEnum,
  PimsTransmissionType,
  InstrumentType,
  InstrumentStatus,
} from "@viewpoint/api";
import React, { ChangeEvent, useContext } from "react";
import { useSuppressMutation } from "../../../api/InstrumentApi";
import { instrumentApi } from "../../../api/InstrumentApi";
import {
  useGetPimsEverConnectedQuery,
  useGetPimsUnsentRunCountQuery,
} from "../../../api/PimsApi";
import { Theme } from "../../../utils/StyleConstants";
import { ViewpointDatePickerInput } from "../../../components/input/ViewPointDatePicker";
import dayjs from "dayjs";
import {
  DefaultToastOptions,
  ToastContentRoot,
  ToastText,
  ToastTextContentRoot,
} from "../../../utils/toast/toast-defaults";
import { StatusPill } from "../../../components/status-pill/StatusPill";
import { ViewpointThemeContext } from "../../../context/ThemeContext";
import { useInstrumentNameForId } from "../../../utils/hooks/hooks";

const StyledSettingsSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const StyledSettingsPageContent = styled(SettingsPageContent)`
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
`;

const ButtonsContainer = styled.div`
  display: flex;
  gap: 24px;
  margin-top: 24px;

  .remove-button {
    border-color: ${(p: { theme: Theme }) => p.theme.colors?.feedback?.error};
  }

  .remove-text {
    color: ${(p: { theme: Theme }) => p.theme.colors?.feedback?.error};
  }
`;

const OptionsContainer = styled.div`
  display: flex;
  gap: 32px;

  label {
    margin-bottom: 0;
  }
`;

const DateContainer = styled.div`
  max-width: 300px;
`;

const StyledSpotText = styled.div`
  .spot-typography__text--body {
    color: gray;
  }
`;

export function PracticeManagementSettingsScreen() {
  const { t } = useTranslation();
  const nav = useNavigate();

  const [updateSetting] = useUpdateSettingMutation();
  const [updateSettings] = useBatchUpdateSettingsMutation();
  const [suppress] = useSuppressMutation();
  const { addToast } = useToast();
  const { theme } = useContext(ViewpointThemeContext);

  const getInstrumentName = useInstrumentNameForId();

  const { data: settings, isLoading: isSettingsLoading } = useGetSettingsQuery([
    SettingTypeEnum.DISPLAY_REQUISITION_ID,
    SettingTypeEnum.REQUIRE_REQUISITION_ID,
    SettingTypeEnum.PIMS_TRANSMIT_RESULTS,
    SettingTypeEnum.PIMS_HISTORYDATE,
  ]);

  const { data: pimsEverConnected, isLoading: isPimsEverConnectedLoading } =
    useGetPimsEverConnectedQuery();
  const { data: pimsUnsentCount, isLoading: isPimsUnsentRunCountLoading } =
    useGetPimsUnsentRunCountQuery();

  const { pimsInstrument, isLoading: isInstrumentsStatusLoading } =
    instrumentApi.useGetInstrumentStatusesQuery(undefined, {
      selectFromResult: (results) => ({
        ...results,
        pimsInstrument: results.data?.find(
          (instrument) =>
            instrument.instrument.instrumentType ===
              InstrumentType.InterlinkPims ||
            instrument.instrument.instrumentType === InstrumentType.SerialPims
        ),
      }),
    });

  const isLoading =
    isSettingsLoading ||
    isPimsEverConnectedLoading ||
    isPimsUnsentRunCountLoading ||
    isInstrumentsStatusLoading;

  const handleRemoveInstrument = () => {
    pimsInstrument &&
      suppress({ instrumentId: pimsInstrument.instrument.id })
        .then(() => {
          addToast({
            ...DefaultToastOptions,
            icon: "checkmark",
            content: (
              <ToastContentRoot>
                <ToastTextContentRoot>
                  <ToastText level="paragraph" $maxLines={1} bold>
                    {getInstrumentName(pimsInstrument.instrument.id)}
                  </ToastText>
                  <ToastText level="paragraph" $maxLines={2}>
                    {t("settings.practiceManagement.pimsRemoved")}
                  </ToastText>
                </ToastTextContentRoot>
              </ToastContentRoot>
            ),
          });
        })
        .catch((e) => {
          addToast({
            ...DefaultToastOptions,
            alertLevel: "danger",
            icon: "alert-notification",
            content: t("general.messages.somethingWentWrong"),
          });
        });
  };

  const handleDisplayRequisitionIdChanged = (
    ev: ChangeEvent<HTMLInputElement>
  ) => {
    updateSetting({
      settingType: SettingTypeEnum.DISPLAY_REQUISITION_ID,
      settingValue: `${ev.target.checked}`,
    });
  };

  const handleRequireRequisitionIdChanged = (
    ev: ChangeEvent<HTMLInputElement>
  ) => {
    updateSettings([
      {
        settingType: SettingTypeEnum.REQUIRE_REQUISITION_ID,
        settingValue: `${ev.target.checked}`,
      },
      ...(ev.target.checked
        ? [
            {
              settingType: SettingTypeEnum.DISPLAY_REQUISITION_ID,
              settingValue: "true",
            },
          ]
        : []),
    ]);
  };

  const handlePimsTransmitResultsChanged = (
    ev: ChangeEvent<HTMLInputElement>,
    transmissionType: PimsTransmissionType
  ) => {
    if (ev.target.checked) {
      updateSetting({
        settingType: SettingTypeEnum.PIMS_TRANSMIT_RESULTS,
        settingValue: transmissionType,
      });
    } else {
      updateSetting({
        settingType: SettingTypeEnum.PIMS_TRANSMIT_RESULTS,
        settingValue: PimsTransmissionType.TRANSMIT_OFF,
      });
    }
  };

  const parsedHistoryDate =
    settings?.[SettingTypeEnum.PIMS_HISTORYDATE] == null
      ? undefined
      : dayjs(settings[SettingTypeEnum.PIMS_HISTORYDATE]!).format("YYYY-MM-DD");

  const handleNewHistoryDate = (date: string) => {
    const newDate = dayjs(date, "YYYY-MM-DD");
    if (newDate.isValid()) {
      updateSetting({
        settingType: SettingTypeEnum.PIMS_HISTORYDATE,
        settingValue: newDate.toISOString(),
      });
    }
  };

  const handleConfigureClick = () => nav("configure");

  const TestId = {
    pimsScreen: "pims-screen",
    removePimsButton: "remove-pims-button",
  } as const;

  if (isLoading) {
    return <SpinnerOverlay />;
  }
  return (
    <SettingsPageRoot data-testid={TestId.pimsScreen}>
      <StyledSettingsPageContent>
        <StyledSettingsSection>
          <SpotText level="h3">
            {t("settings.practiceManagement.labels.practiceManagement")}
          </SpotText>
          {pimsEverConnected && (
            <>
              {pimsInstrument != null && (
                <>
                  <div>
                    <StatusPill
                      status={pimsInstrument.instrumentStatus}
                      outline={false}
                    />
                  </div>
                  {pimsInstrument.instrumentStatus ===
                    InstrumentStatus.Offline && (
                    <>
                      <SpotText level="secondary">
                        <Trans
                          i18nKey={
                            "settings.practiceManagement.pimsOfflineBody1"
                          }
                        />
                      </SpotText>
                      <SpotText level="secondary">
                        {t("settings.practiceManagement.pimsOfflineBody2")}
                      </SpotText>
                    </>
                  )}
                </>
              )}
              {pimsInstrument == null && (
                <SpotText level="paragraph" bold>
                  {t("settings.practiceManagement.status.disabled")}
                </SpotText>
              )}
            </>
          )}
          <ButtonsContainer>
            <Button buttonType="primary" onClick={handleConfigureClick}>
              {t("settings.practiceManagement.buttons.configure")}
            </Button>
            {pimsInstrument &&
              pimsInstrument.instrumentStatus === InstrumentStatus.Offline && (
                <Button
                  data-testid={TestId.removePimsButton}
                  leftIcon="delete"
                  buttonType="secondary"
                  onClick={handleRemoveInstrument}
                  iconColor={theme.colors?.feedback?.error}
                  className="remove-button"
                >
                  <SpotText level="secondary" className="remove-text">
                    {t("settings.practiceManagement.buttons.removePims")}
                  </SpotText>
                </Button>
              )}
          </ButtonsContainer>
        </StyledSettingsSection>
        <Divider />
        <StyledSettingsSection>
          <SpotText level="paragraph" bold>
            {t("settings.practiceManagement.labels.requisitionId")}
          </SpotText>
          <OptionsContainer>
            <Checkbox
              checked={
                settings?.[SettingTypeEnum.REQUIRE_REQUISITION_ID] === "true"
              }
              disabled={isLoading}
              onChange={handleRequireRequisitionIdChanged}
              label={t("settings.practiceManagement.labels.required")}
            />
            <Checkbox
              checked={
                settings?.[SettingTypeEnum.DISPLAY_REQUISITION_ID] === "true"
              }
              disabled={
                isLoading ||
                settings?.[SettingTypeEnum.REQUIRE_REQUISITION_ID] === "true"
              }
              onChange={handleDisplayRequisitionIdChanged}
              label={t("settings.practiceManagement.labels.display")}
            />
          </OptionsContainer>
          <SpotText level="paragraph">
            {t("settings.practiceManagement.requisitionIdContent")}
          </SpotText>
        </StyledSettingsSection>
        <Divider />
        <StyledSettingsSection>
          <SpotText level="paragraph" bold>
            {t("settings.practiceManagement.labels.results")}
          </SpotText>
          <OptionsContainer>
            <Toggle
              checked={
                settings?.[SettingTypeEnum.PIMS_TRANSMIT_RESULTS] ===
                PimsTransmissionType.TRANSMIT_RESULTS_ONLY
              }
              onChange={(ev) =>
                handlePimsTransmitResultsChanged(
                  ev,
                  PimsTransmissionType.TRANSMIT_RESULTS_ONLY
                )
              }
              label={t("settings.practiceManagement.labels.transmitResults")}
            />
            <Toggle
              checked={
                settings?.[SettingTypeEnum.PIMS_TRANSMIT_RESULTS] ===
                PimsTransmissionType.TRANSMIT_RESULTS_AND_REPORT
              }
              onChange={(ev) =>
                handlePimsTransmitResultsChanged(
                  ev,
                  PimsTransmissionType.TRANSMIT_RESULTS_AND_REPORT
                )
              }
              label={t(
                "settings.practiceManagement.labels.transmitResultsAndReports"
              )}
            />
          </OptionsContainer>
          <SpotText level="paragraph">
            {t("settings.practiceManagement.donNotTransmitRecords")}
          </SpotText>
          <DateContainer>
            <ViewpointDatePickerInput
              date={parsedHistoryDate}
              onDateSelected={handleNewHistoryDate}
              datePickerProps={{
                disabled: isSettingsLoading,
                closeOnChange: false,
              }}
            />
          </DateContainer>
          <StyledSpotText>
            <SpotText level="paragraph">
              {t("settings.practiceManagement.resultsNotTransmitted", {
                count: pimsUnsentCount,
              })}
            </SpotText>
          </StyledSpotText>
        </StyledSettingsSection>
      </StyledSettingsPageContent>
    </SettingsPageRoot>
  );
}
