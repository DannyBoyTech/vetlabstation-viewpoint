import { useTranslation } from "react-i18next";
import {
  InstrumentPageContent,
  InstrumentPageRightPanel,
  InstrumentPageRightPanelButtonContainer,
  InstrumentPageRoot,
} from "../../common-components";
import { Button, Input, SpotText, Toggle } from "@viewpoint/spot-react";
import {
  unstable_useBlocker as useBlocker,
  useNavigate,
} from "react-router-dom";
import styled from "styled-components";
import { useHeaderTitle } from "../../../../utils/hooks/hooks";
import { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  useLazyGetRouterQuery,
  useUpdateWirelessMutation,
} from "../../../../api/RouterApi";
import {
  IvlsRouterDto,
  IvlsWirelessRouterConfigDto,
  WanIpChoiceEnum,
} from "@viewpoint/api";
import { isEqual } from "lodash";
import { generatePassword } from "../../../../api/SystemInfoApi";
import { CancelConfirmationModal } from "../../../../components/confirm-modal/CancelConfirmationModal";
import { configChangeRequiresReboot } from "./router-utils";
import { RouterRebootConfirmModal } from "./RouterRebootConfirmModal";
import { RouterConfigStatusModal } from "./RouterConfigStatusModal";
import classNames from "classnames";
import { Theme } from "../../../../utils/StyleConstants";

function toWirelessRouterConfig(
  nextSettings: IvlsRouterDto | undefined,
  passwordGenerated: boolean
): IvlsWirelessRouterConfigDto | undefined {
  if (
    nextSettings?.wirelessPassphrase == null ||
    nextSettings?.wirelessEnabled == null
  ) {
    return undefined;
  }

  const { wirelessPassphrase, wirelessEnabled } = nextSettings;

  return {
    wirelessPassphrase,
    wirelessEnabled,
    passwordGenerated,
  };
}

const Content = styled.div`
  width: 440px;
`;

const Sections = styled.div`
  flex: 1;

  display: flex;
  flex-direction: column;
  gap: 25px;
`;

const PASSWORD_PLACEHOLDER = "sneaky, sneaky!";

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;

  border-bottom: ${(p: { theme: Theme }) => p.theme.borders?.lightPrimary};
  padding-bottom: 32px;

  .heading {
    margin-bottom: 16px;
  }

  button {
    align-self: end;
  }
`;

const PasswordField = styled.div`
  display: flex;
  gap: 25px;

  .label {
    flex: initial;
    display: flex;
    align-items: center;
  }

  && :has(> input) {
    flex: auto;
  }

  && .spot-form__input,
  && .spot-form__input--disabled {
    opacity: 1;
    border: none;
    box-shadow: none;
  }
`;

interface PasswordSectionProps {
  className?: string;
  "data-testid"?: string;

  password?: string;
  showPassword?: boolean;

  disabled?: boolean;

  onGeneratePassword?: () => void;
}

function PasswordSection(props: PasswordSectionProps) {
  const { t } = useTranslation();
  const classes = classNames(props.className, "section", "password-section");

  const [breakFocus, setBreakFocus] = useState(false);

  function handleGeneratePassword() {
    setBreakFocus(!breakFocus);
    props.onGeneratePassword?.();
  }

  return (
    <Section className={classes} data-testid={props["data-testid"]}>
      <SpotText className="heading" level="paragraph" bold>
        {t("instrumentScreens.system.advanced.wirelessSettings.title")}
      </SpotText>
      <PasswordField>
        <SpotText className="label" level="paragraph">
          {t(
            "instrumentScreens.system.advanced.wirelessSettings.wirelessPassword"
          )}
        </SpotText>
        <Input
          data-testid={TestId.PasswordInput}
          disabled={true}
          type={props.showPassword ? "text" : "password"}
          value={props.showPassword ? props.password : PASSWORD_PLACEHOLDER}
        />
      </PasswordField>
      <Button
        data-testid={TestId.GeneratePasswordButton}
        disabled={props.disabled}
        key={breakFocus.toString()}
        buttonType="secondary"
        onClick={handleGeneratePassword}
      >
        {t(
          "instrumentScreens.system.advanced.wirelessSettings.generatePassword"
        )}
      </Button>
    </Section>
  );
}

interface AntennaSectionProps {
  className?: string;
  "data-testid"?: string;

  wirelessEnabled?: boolean;

  disabled?: boolean;

  onChange?: (value?: boolean) => void;
}

function AntennaSection(props: AntennaSectionProps) {
  const { t } = useTranslation();
  const classes = classNames(props.className, "section", "antenna-section");

  const handleChange = useCallback(
    (ev: ChangeEvent<HTMLInputElement>) => {
      props.onChange?.(ev.currentTarget.checked);
    },
    [props.onChange]
  );

  return (
    <Section className={classes} data-testid={props["data-testid"]}>
      <Toggle
        disabled={props.disabled}
        label={t(
          "instrumentScreens.system.advanced.wirelessSettings.enableWirelessAntenna"
        )}
        checked={props.wirelessEnabled ?? false}
        onChange={handleChange}
      />
    </Section>
  );
}

function WirelessSettingsScreen() {
  const { t } = useTranslation();
  useHeaderTitle({
    label: t("instrumentScreens.system.advanced.wirelessSettings.title"),
  });

  const nav = useNavigate();
  const [
    fetchSettings,
    {
      currentData: fetchedSettings,
      isFetching: settingsFetching,
      isError: fetchSettingsError,
    },
  ] = useLazyGetRouterQuery();
  const [updateWireless, { isLoading: settingsUpdating }] =
    useUpdateWirelessMutation();
  const [changedSettings, setChangedSettings] =
    useState<Pick<IvlsRouterDto, "wirelessEnabled" | "wirelessPassphrase">>();
  const [rebootConfirmOpen, setRebootConfirmOpen] = useState(false);
  const [configStatusOpen, setConfigStatusOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const nextSettings = useMemo(
    () => ({ ...fetchedSettings, ...changedSettings }),
    [fetchedSettings, changedSettings]
  );

  const pendingPasswordChange =
    nextSettings.wirelessPassphrase !== fetchedSettings?.wirelessPassphrase;

  const changesPending = useMemo(
    () => fetchedSettings != null && !isEqual(fetchedSettings, nextSettings),
    [fetchedSettings, nextSettings]
  );

  const navBlocker = useBlocker(changesPending);

  const navigatingAway = navBlocker.state === "blocked";

  async function handleGeneratePassword() {
    try {
      const wirelessPassphrase = await generatePassword();
      setChangedSettings({ ...changedSettings, wirelessPassphrase });
    } catch (e) {
      console.log(`password generation failed: ${e}`);
    }
  }

  function handleAntennaChange(wirelessEnabled?: boolean) {
    setChangedSettings({ ...changedSettings, wirelessEnabled });
  }

  function handleCancel() {
    if (changesPending) {
      setCancelling(true);
    } else {
      setChangedSettings(undefined);
    }
  }

  function handleCancelConfirm() {
    if (cancelling) {
      setCancelling(false);
      setChangedSettings(undefined);
    } else {
      navBlocker.proceed?.();
    }
  }

  function handleCancelReject() {
    if (cancelling) {
      setCancelling(false);
    } else {
      navBlocker.reset?.();
    }
  }

  function handleApply() {
    const config = toWirelessRouterConfig(
      nextSettings,
      changedSettings?.wirelessPassphrase != null
    );

    const reboot = configChangeRequiresReboot(fetchedSettings?.routerType);

    if (reboot) {
      setRebootConfirmOpen(true);
    } else {
      applyChanges(config, reboot);
    }
  }

  function applyChanges(
    config: IvlsWirelessRouterConfigDto | undefined,
    reboot: boolean
  ) {
    if (config) {
      setConfigStatusOpen(true);
      updateWireless({ config, reboot });
    }
  }

  function handleRebootConfirm() {
    const config = toWirelessRouterConfig(
      nextSettings,
      changedSettings?.wirelessPassphrase != null
    );

    setRebootConfirmOpen(false);
    setTimeout(() => {
      applyChanges(config, true);
    }, 500);
  }

  function handleRebootReject() {
    setRebootConfirmOpen(false);
  }

  function handleStatusModalClose() {
    setConfigStatusOpen(false);
  }

  function handleStatusModalConfirm(success: boolean) {
    setConfigStatusOpen(false);
    if (success) {
      setChangedSettings(undefined);
      fetchSettings();
    }
  }

  function handleBack() {
    nav(-1);
  }

  const editable =
    !settingsFetching &&
    !settingsUpdating &&
    !fetchSettingsError &&
    fetchedSettings != null &&
    fetchedSettings.wanIpChoice !== WanIpChoiceEnum.UNKNOWN;

  const buttonClusterContent = (
    <>
      <Button
        data-testid={TestId.ApplyChangesButton}
        disabled={!editable || !changedSettings}
        onClick={handleApply}
      >
        {t("instrumentScreens.system.advanced.applyChanges")}
      </Button>
      {changedSettings ? (
        // the use of key here is a hack to prevent 'sticky focus' on the button
        <Button
          data-testid={TestId.CancelButton}
          key="cancel"
          buttonType="secondary"
          onClick={handleCancel}
        >
          {t("general.buttons.cancel")}
        </Button>
      ) : (
        <Button
          data-testid={TestId.BackButton}
          key="back"
          buttonType="secondary"
          onClick={handleBack}
        >
          {t("general.buttons.back")}
        </Button>
      )}
    </>
  );

  return (
    <InstrumentPageRoot>
      <InstrumentPageContent>
        <Content>
          <Sections>
            <PasswordSection
              data-testid={TestId.PasswordSection}
              disabled={!editable}
              onGeneratePassword={handleGeneratePassword}
              password={nextSettings.wirelessPassphrase}
              showPassword={pendingPasswordChange}
            />
            <AntennaSection
              data-testid={TestId.WirelessSection}
              disabled={!editable}
              onChange={handleAntennaChange}
              wirelessEnabled={nextSettings.wirelessEnabled}
            />
          </Sections>
        </Content>
      </InstrumentPageContent>
      <InstrumentPageRightPanel>
        <InstrumentPageRightPanelButtonContainer>
          {buttonClusterContent}
        </InstrumentPageRightPanelButtonContainer>
      </InstrumentPageRightPanel>
      {rebootConfirmOpen ? (
        <RouterRebootConfirmModal
          data-testid={TestId.RebootModal}
          onClose={handleRebootReject}
          onConfirm={handleRebootConfirm}
        />
      ) : null}
      {configStatusOpen ? (
        <RouterConfigStatusModal
          data-testid={TestId.StatusModal}
          onClose={handleStatusModalClose}
          onConfirm={handleStatusModalConfirm}
        />
      ) : null}
      {cancelling || navigatingAway ? (
        <CancelConfirmationModal
          data-testid={TestId.CancelModal}
          open={true}
          onConfirm={handleCancelConfirm}
          onClose={handleCancelReject}
        />
      ) : null}
    </InstrumentPageRoot>
  );
}

const TestId = {
  ApplyChangesButton: "apply-changes-button",
  BackButton: "back-button",
  CancelButton: "cancel-button",
  GeneratePasswordButton: "generate-password-button",
  PasswordSection: "password-section",
  PasswordInput: "password-input",
  RebootModal: "reboot-modal",
  StatusModal: "status-modal",
  CancelModal: "cancel-modal",
  WirelessSection: "wireless-section",
} as const;

//exported for test only
export { TestId };

export { WirelessSettingsScreen };
