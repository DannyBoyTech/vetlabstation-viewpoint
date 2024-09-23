import styled from "styled-components";
import {
  InstrumentPageContent,
  InstrumentPageRightPanel,
  InstrumentPageRightPanelButtonContainer,
  InstrumentPageRoot,
} from "../../common-components";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@viewpoint/spot-react";
import {
  useNavigate,
  unstable_useBlocker as useBlocker,
} from "react-router-dom";
import { ViewpointKeyboard } from "../../../../components/keyboard/ViewpointKeyboard";
import { PingTest } from "./PingTest";
import { RouterSettings } from "./RouterSettings";
import {
  useLazyGetRouterQuery,
  useUpdateWiredMutation,
} from "../../../../api/RouterApi";
import {
  IvlsRouterDto,
  IvlsWiredRouterConfigDto,
  WanIpChoiceEnum,
} from "@viewpoint/api";
import { configChangeRequiresReboot } from "./router-utils";
import { RouterConfigStatusModal } from "./RouterConfigStatusModal";
import { RouterRebootConfirmModal } from "./RouterRebootConfirmModal";
import { validIPv4String } from "../../../../utils/ipv4-utils";
import { CancelConfirmationModal } from "../../../../components/confirm-modal/CancelConfirmationModal";
import { isEqual } from "lodash";
import { useHeaderTitle } from "../../../../utils/hooks/hooks";
import { Theme } from "../../../../utils/StyleConstants";

function defaultSettings(
  fetchedSettings: IvlsRouterDto | undefined
): Partial<IvlsWiredRouterConfigDto> {
  return { localIpAddress: fetchedSettings?.defaultLocalIpAddress };
}

function validSettings(settings: Partial<IvlsWiredRouterConfigDto>) {
  return (
    validIPv4String(settings.ipAddress) &&
    validIPv4String(settings.subnetMask) &&
    validIPv4String(settings.gateway) &&
    validIPv4String(settings.primaryDnsServer) &&
    validIPv4String(settings.localIpAddress)
  );
}

function toIvlsWiredRouterConfig(
  routerDto: IvlsRouterDto,
  applyIdexxDefaults: boolean
): IvlsWiredRouterConfigDto {
  const {
    gateway,
    ipAddress,
    localIpAddress,
    primaryDnsServer,
    subnetMask,
    wanIpChoice,
  } = routerDto;

  if (
    [
      gateway,
      ipAddress,
      localIpAddress,
      primaryDnsServer,
      subnetMask,
      wanIpChoice,
    ].some((it) => it == null)
  ) {
    throw Error(
      `unable to construct wired settings due to invalid routerDto state: ${JSON.stringify(
        routerDto
      )}`
    );
  }
  return {
    applyIdexxDefaults,
    gateway: gateway!,
    ipAddress: ipAddress!,
    localIpAddress: localIpAddress!,
    primaryDnsServer: primaryDnsServer!,
    subnetMask: subnetMask!,
    wanIpChoice: wanIpChoice!,
  };
}

const Content = styled.div`
  display: flex;

  gap: 25px;

  .sections {
    flex: 1;

    display: flex;
    flex-direction: column;
    gap: 25px;
  }

  .section {
    border-bottom: ${(p: { theme: Theme }) => p.theme.borders?.lightPrimary};
    padding-bottom: 32px;
  }

  .keypad {
    width: 275px;
  }
`;

interface RouterSettingsScreenProps {
  className?: string;
  "data-testid"?: string;
}

function RouterSettingsScreen(props: RouterSettingsScreenProps) {
  const { t } = useTranslation();
  useHeaderTitle({
    label: t("instrumentScreens.system.advanced.routerConfiguration"),
  });
  const nav = useNavigate();
  const [
    fetchSettings,
    {
      currentData: fetchedSettings,
      isError: settingsFetchError,
      isFetching: settingsFetching,
    },
  ] = useLazyGetRouterQuery();
  const [updateWiredConfig] = useUpdateWiredMutation();
  const [editing, setEditing] = useState(false);
  const [changedSettings, setChangedSettings] =
    useState<Partial<IvlsRouterDto>>();
  const [defaultsApplied, setDefaultsApplied] = useState(false);
  const [rebootConfirmOpen, setRebootConfirmOpen] = useState(false);
  const [configStatusOpen, setConfigStatusOpen] = useState(false);
  const [applyingChanges, setApplyingChanges] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const nextSettings = useMemo(
    () => ({ ...fetchedSettings, ...changedSettings }),
    [fetchedSettings, changedSettings]
  );

  // block navigation for confirmation if input will be lost
  const changesWillBeLost = useMemo(
    () => fetchedSettings != null && !isEqual(fetchedSettings, nextSettings),
    [fetchedSettings, nextSettings]
  );

  const navBlocker = useBlocker(changesWillBeLost);

  const nextSettingsValid = useMemo(
    () => validSettings(nextSettings),
    [nextSettings]
  );

  const TestId = {
    applyRouterConfig: "apply-router-config-edit",
    cancelRouterConfig: "cancel-router-config-edit",
    wirelessSettingsButton: "wireless-settings-button",
    sysAdvRightBack: "sys-adv-right-back-button",
  } as const;

  function handleCancel() {
    if (changesWillBeLost) {
      setCancelling(true);
    } else {
      confirmCancel();
    }
  }

  function confirmCancel() {
    setEditing(false);
    setDefaultsApplied(false);
    setChangedSettings(undefined);
    setCancelling(false);
  }

  function handleEdit() {
    setEditing(true);
  }

  function handleOnChange(changes: Partial<IvlsWiredRouterConfigDto>) {
    setChangedSettings({ ...changedSettings, ...changes });
  }

  function handleApplyDefaults() {
    setChangedSettings({
      ...changedSettings,
      ...defaultSettings(fetchedSettings),
    });
    setDefaultsApplied(true);
  }

  function applyChanges(config: IvlsWiredRouterConfigDto, reboot: boolean) {
    setApplyingChanges(true);
    setConfigStatusOpen(true);
    updateWiredConfig({ config, reboot });
    setChangedSettings(undefined);
  }

  function handleApplyChanges() {
    const config = toIvlsWiredRouterConfig(nextSettings, defaultsApplied);
    const reboot = configChangeRequiresReboot(fetchedSettings?.routerType);

    if (reboot) {
      setRebootConfirmOpen(true);
    } else {
      applyChanges(config, reboot);
    }
  }

  function handleRebootModalClose() {
    setRebootConfirmOpen(false);
  }

  function handleRebootModalConfirm() {
    const config = toIvlsWiredRouterConfig(nextSettings, defaultsApplied);
    const reboot = configChangeRequiresReboot(fetchedSettings?.routerType);

    setRebootConfirmOpen(false);
    setTimeout(() => {
      applyChanges(config, reboot);
    }, 500);
  }

  function handleStatusModalClose() {
    setConfigStatusOpen(false);
  }

  function handleStatusModalConfirm(success: boolean) {
    setApplyingChanges(false);
    setConfigStatusOpen(false);
    if (success) {
      setEditing(false);
      fetchSettings();
    }
  }

  const editable =
    !settingsFetching &&
    !settingsFetchError &&
    fetchedSettings != null &&
    fetchedSettings.wanIpChoice !== WanIpChoiceEnum.UNKNOWN;

  /* The buttons below are keyed to force react to remove buttons from the dom
   * based on 'editing' or not. Why? Because of 'sticky focus'. Chromium
   * applies a 'focus' state to elements after they've been clicked on a touch
   * interface. This focus state stays around until user interaction somewhere
   * else, but not if the element is removed from the DOM. Without the keys on
   * these elements, React views the code below as modifying persistent
   * buttons, rather than replacement. Adding the key forces React to replace
   * the elements.
   *
   * A better fix here would be to gate desktop-browser styles under a media
   * selector in the spot styles, but this works for now.
   */
  const buttonClusterContent = editing ? (
    <>
      <Button
        key="apply"
        data-testid={TestId.applyRouterConfig}
        onClick={handleApplyChanges}
        disabled={applyingChanges || !changedSettings || !nextSettingsValid}
      >
        {t("instrumentScreens.system.advanced.applyChanges")}
      </Button>
      <Button
        key="cancel"
        data-testid={TestId.cancelRouterConfig}
        buttonType="secondary"
        onClick={handleCancel}
        disabled={applyingChanges}
      >
        {t("general.buttons.cancel")}
      </Button>
    </>
  ) : (
    <>
      <Button
        key="wireless"
        data-testid={TestId.wirelessSettingsButton}
        onClick={() => nav("wireless")}
      >
        {t("instrumentScreens.system.advanced.wirelessSettings.title")}
      </Button>
      <Button
        key="back"
        data-testid={TestId.sysAdvRightBack}
        buttonType="secondary"
        onClick={() => nav(-1)}
      >
        {t("general.buttons.back")}
      </Button>
    </>
  );

  return (
    <InstrumentPageRoot
      className={props.className}
      data-testid={props["data-testid"]}
    >
      <InstrumentPageContent data-testid="system-advanced-main">
        <Content>
          <div className="sections">
            <RouterSettings
              className="section"
              value={nextSettings}
              editing={editing}
              editable={editable}
              onEdit={handleEdit}
              onApplyDefaults={handleApplyDefaults}
              onChange={handleOnChange}
            />
            <PingTest className="section" />
          </div>
          <div className="keypad">
            <ViewpointKeyboard alwaysVisible keyboardType="numpad" />
          </div>
        </Content>
      </InstrumentPageContent>
      <InstrumentPageRightPanel data-testid="system-advanced-right">
        <InstrumentPageRightPanelButtonContainer>
          {buttonClusterContent}
        </InstrumentPageRightPanelButtonContainer>
      </InstrumentPageRightPanel>
      {rebootConfirmOpen ? (
        <RouterRebootConfirmModal
          onClose={handleRebootModalClose}
          onConfirm={handleRebootModalConfirm}
        />
      ) : null}
      {configStatusOpen ? (
        <RouterConfigStatusModal
          onClose={handleStatusModalClose}
          onConfirm={handleStatusModalConfirm}
        />
      ) : null}
      {navBlocker.state === "blocked" || cancelling ? (
        <CancelConfirmationModal
          open={true}
          onClose={() => {
            if (!cancelling) {
              navBlocker.reset?.();
            } else {
              setCancelling(false);
            }
          }}
          onConfirm={() =>
            cancelling ? confirmCancel() : navBlocker.proceed?.()
          }
        />
      ) : null}
    </InstrumentPageRoot>
  );
}

export { RouterSettingsScreen };
