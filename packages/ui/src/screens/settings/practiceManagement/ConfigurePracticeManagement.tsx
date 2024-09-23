import styled from "styled-components";
import { useEffect, useState } from "react";
import {
  Button,
  Input,
  SpotText,
  Radio,
  RadioGroup,
} from "@viewpoint/spot-react";
import { useTranslation, Trans } from "react-i18next";
import { useNavigate } from "react-router";
import {
  useGetSettingsQuery,
  useGetSettingQuery,
  useBatchUpdateSettingsMutation,
} from "../../../api/SettingsApi";
import { SettingTypeEnum } from "@viewpoint/api";
import { Theme } from "../../../utils/StyleConstants";
import { useHeaderTitle } from "../../../utils/hooks/hooks";
import SpinnerOverlay from "../../../components/overlay/SpinnerOverlay";
import {
  PageContent,
  PageRightPanel,
  PageRightPanelButtonContainer,
  PageRoot,
} from "../../../components/layout/common-layout-components";
import { IPv4AddrInput } from "../../../components/ipv4-addr-input/IPv4AddrInput";
import { useConfirmModal } from "../../../components/global-modals/components/GlobalConfirmModal";
import { InlineText } from "../../../components/typography/InlineText";
import {
  EulaContentBody,
  EulaContentRoot,
  EulaContentTitle,
} from "../../../components/eula/EulaComponents";
import { InputAware } from "../../../components/InputAware";
import { Divider } from "../common-settings-components";

const Content = styled(PageContent)`
  display: flex;
  flex-direction: column;
  overflow-y: unset;
  gap: 20px;
`;

const NetworkRelatedSection = styled.div<{ isDisabled: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 20px;

  .spot-typography__text--body {
    ${(p) => (p.isDisabled ? `color: ${p.theme.colors?.text?.disabled}` : "")}
  }
`;

const InputWrapper = styled.div<{ isDisabled?: boolean }>`
  width: 340px;

  .spot-typography__text--body {
    ${(p) => (p.isDisabled ? `color: ${p.theme.colors?.text?.disabled}` : "")}
  }
`;

const InputClearButtonWrapper = styled.div`
  display: flex;
  align-items: center;
`;

const ClearButton = styled(Button)`
  padding: 0;
`;

const StyledEulaContentBody = styled(EulaContentBody)`
  padding: 16px;
`;

export const TestId = {
  LineOneInput: "report-header-settings-line1-input",
  LineTwoInput: "report-header-settings-line2-input",
  LineThreeInput: "report-header-settings-line3-input",
  PrintHeaderToggle: "report-header-settings-print-header-toggle",
  PrintLinesDropdown: "report-header-settings-print-lines-dropdown",
  editHeaderMain: "edit-header-main",
  editHeaderMainOk: "edit-header-main-ok",
  editHeaderMainCancel: "edit-header-main-cancel",
};

const PimsConnectionType = {
  SERIAL: "Serial",
  NETWORK: "Network",
  NONE: "None",
};

const EulaModalComponents = {
  b: <InlineText level="paragraph" bold />,
  linebreak: <br />,
  u: <u />,
};

export function ConfigurePracticeManagement() {
  const { t } = useTranslation();
  useHeaderTitle({
    label: t("settings.practiceManagement.configure.title"),
  });

  const nav = useNavigate();
  const { addConfirmModal } = useConfirmModal();

  const [settingsState, setSettingsState] = useState<{
    [key: string]: string;
  }>({});
  const [isSaveDisabled, setIsSaveDisabled] = useState(true);
  const { data: settings, isLoading } = useGetSettingsQuery(
    [
      SettingTypeEnum.PIMS_CONNECTION_TYPE,
      SettingTypeEnum.PIMS_AUTOCONNECT,
      SettingTypeEnum.PIMS_IP_ADDRESS,
      SettingTypeEnum.PIMS_IVLS_INTEGRATION_NAME,
    ],
    {
      selectFromResult: (res) => ({
        ...res,
        data:
          res.data == null
            ? undefined
            : {
                ...res.data,
                [SettingTypeEnum.PIMS_CONNECTION_TYPE]: mapConnectionType(
                  res.data[SettingTypeEnum.PIMS_CONNECTION_TYPE]!
                ),
              },
      }),
    }
  );
  const { data: networkTypeSetting } = useGetSettingQuery(
    SettingTypeEnum.PIMS_AGREED_TO_THIRD_PARTY_PIMS_EULA
  );

  const [updateSettings, updateSettingsStatus] =
    useBatchUpdateSettingsMutation();

  useEffect(() => {
    if (Object.values(settingsState).length === 0) {
      settings && setSettingsState(settings);
    }
  }, [settings, settingsState]);

  const handleSave = () => {
    const newSettings = [];
    for (const [key, value] of Object.entries(settingsState)) {
      newSettings.push({
        settingType: key as SettingTypeEnum,
        settingValue: value,
      });
    }
    updateSettings(newSettings)
      .unwrap()
      .then(() => nav(-1));
  };

  const handleConnectionSettings = (value: string) => {
    switch (value) {
      case PimsConnectionType.NETWORK:
        if (networkTypeSetting !== "Yes") {
          addConfirmModal({
            bodyContent: (
              <EulaContentRoot>
                <EulaContentTitle>
                  <SpotText level="h3">
                    <Trans i18nKey="settings.practiceManagement.eula.title" />
                  </SpotText>
                </EulaContentTitle>
                <StyledEulaContentBody>
                  <SpotText level="secondary">
                    <Trans
                      i18nKey="settings.practiceManagement.eula.body"
                      components={EulaModalComponents}
                    />
                  </SpotText>
                </StyledEulaContentBody>
              </EulaContentRoot>
            ),
            onClose: () => {},
            onConfirm: () => {
              updateSettings([
                {
                  settingType:
                    SettingTypeEnum.PIMS_AGREED_TO_THIRD_PARTY_PIMS_EULA,
                  settingValue: "Yes",
                },
              ])
                .unwrap()
                .then(() => {
                  setIsSaveDisabled(false);
                  setSettingsState((prev) => ({
                    ...prev,
                    [SettingTypeEnum.PIMS_CONNECTION_TYPE]: value,
                  }));
                });
            },
            confirmButtonContent: t("eula.common.buttons.agree"),
            cancelButtonContent: t("eula.common.buttons.disagree"),
            responsive: true,
          });
        } else {
          setIsSaveDisabled(false);
          setSettingsState((prev) => ({
            ...prev,
            [SettingTypeEnum.PIMS_CONNECTION_TYPE]: value,
          }));
        }
        break;

      case PimsConnectionType.SERIAL:
      case PimsConnectionType.NONE:
        setIsSaveDisabled(false);
        setSettingsState((prev) => ({
          ...prev,
          [SettingTypeEnum.PIMS_CONNECTION_TYPE]: value,
        }));
        break;

      default:
        break;
    }
  };

  const handleUpdateSettings = (type: SettingTypeEnum, value: string) => {
    setIsSaveDisabled(false);
    setSettingsState((prev) => ({ ...prev, [type]: value }));
  };

  const isDisabled =
    settingsState[SettingTypeEnum.PIMS_CONNECTION_TYPE] !==
    PimsConnectionType.NETWORK;

  return (
    <PageRoot>
      {(isLoading || updateSettingsStatus.isLoading) && <SpinnerOverlay />}
      <Content data-testid={TestId.editHeaderMain}>
        <RadioGroup horizontal>
          <Radio
            disabled={false}
            label={t("settings.practiceManagement.configure.serialConnection")}
            onChange={() => handleConnectionSettings(PimsConnectionType.SERIAL)}
            checked={
              settingsState[SettingTypeEnum.PIMS_CONNECTION_TYPE] ===
              PimsConnectionType.SERIAL
            }
          />
          <Radio
            disabled={false}
            label={t("settings.practiceManagement.configure.networkConnection")}
            checked={
              settingsState[SettingTypeEnum.PIMS_CONNECTION_TYPE] ===
              PimsConnectionType.NETWORK
            }
            onChange={() =>
              handleConnectionSettings(PimsConnectionType.NETWORK)
            }
          />
          <Radio
            disabled={false}
            label={t("settings.practiceManagement.configure.none")}
            checked={
              settingsState[SettingTypeEnum.PIMS_CONNECTION_TYPE] ===
              PimsConnectionType.NONE
            }
            onChange={() => handleConnectionSettings(PimsConnectionType.NONE)}
          />
        </RadioGroup>
        <Divider />
        <NetworkRelatedSection isDisabled={isDisabled}>
          <RadioGroup>
            <Radio
              disabled={isDisabled}
              label={t("settings.practiceManagement.configure.autoConnect")}
              onChange={() =>
                handleUpdateSettings(SettingTypeEnum.PIMS_AUTOCONNECT, "true")
              }
              checked={
                !isDisabled &&
                settingsState[SettingTypeEnum.PIMS_AUTOCONNECT] === "true"
              }
            />
            <Radio
              disabled={isDisabled}
              label={t("settings.practiceManagement.configure.directConnect")}
              checked={
                !isDisabled &&
                settingsState[SettingTypeEnum.PIMS_AUTOCONNECT] === "false"
              }
              onChange={() =>
                handleUpdateSettings(SettingTypeEnum.PIMS_AUTOCONNECT, "false")
              }
            />
          </RadioGroup>
          <InputWrapper
            isDisabled={
              settingsState[SettingTypeEnum.PIMS_AUTOCONNECT] === "true"
            }
          >
            <SpotText level="paragraph" bold>
              {t("settings.practiceManagement.configure.ipAddress")}
            </SpotText>
            <InputClearButtonWrapper>
              <IPv4AddrInput
                inputAware={true}
                disabled={
                  isDisabled ||
                  settingsState[SettingTypeEnum.PIMS_AUTOCONNECT] === "true"
                }
                autoSelectOctets={true}
                value={
                  isDisabled
                    ? ""
                    : settingsState[SettingTypeEnum.PIMS_IP_ADDRESS]
                }
                onAddrChange={(value: string) =>
                  handleUpdateSettings(SettingTypeEnum.PIMS_IP_ADDRESS, value)
                }
              />
              <ClearButton
                disabled={
                  isDisabled ||
                  settingsState[SettingTypeEnum.PIMS_AUTOCONNECT] === "true"
                }
                iconOnly
                buttonType="link"
                buttonSize="large"
                leftIcon="close"
                onClick={() =>
                  handleUpdateSettings(SettingTypeEnum.PIMS_IP_ADDRESS, "")
                }
              />
            </InputClearButtonWrapper>
          </InputWrapper>
          <Divider />
          <InputWrapper>
            <SpotText level="paragraph" bold>
              {t("settings.practiceManagement.configure.integrationName")}
            </SpotText>
            <InputAware>
              <Input
                disabled={isDisabled}
                type="search"
                value={
                  isDisabled
                    ? ""
                    : settingsState[SettingTypeEnum.PIMS_IVLS_INTEGRATION_NAME]
                }
                onChange={(ev) =>
                  handleUpdateSettings(
                    SettingTypeEnum.PIMS_IVLS_INTEGRATION_NAME,
                    ev.target.value
                  )
                }
              />
            </InputAware>
          </InputWrapper>
        </NetworkRelatedSection>
      </Content>

      <PageRightPanel>
        <PageRightPanelButtonContainer>
          <Button
            disabled={isSaveDisabled}
            data-testid={TestId.editHeaderMainOk}
            onClick={handleSave}
          >
            {t("general.buttons.save")}
          </Button>
          <Button
            data-testid={TestId.editHeaderMainCancel}
            buttonType="secondary"
            onClick={() => nav(-1)}
          >
            {t("general.buttons.cancel")}
          </Button>
        </PageRightPanelButtonContainer>
      </PageRightPanel>
    </PageRoot>
  );
}

function mapConnectionType(type: string): string {
  if (type === "Cornerstone_Network") {
    return PimsConnectionType.NETWORK;
  } else if (type === "Cornerstone_Serial") {
    return PimsConnectionType.SERIAL;
  }
  return type;
}
