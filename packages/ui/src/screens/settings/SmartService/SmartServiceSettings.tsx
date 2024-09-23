import { Button, SpotText } from "@viewpoint/spot-react";
import {
  SettingsPageContent,
  SettingsPageRoot,
} from "../common-settings-components";
import SmartServiceLogoNotActive from "../../../assets/smartservice/smartservice-not-activated.png";
import SmartServiceLogoConnected from "../../../assets/smartservice/smartservice-connected.png";
import SmartServiceLogoOffline from "../../../assets/smartservice/smartservice-offline.png";
import SmartServiceLogoConnecting from "../../../assets/smartservice/smartservice-connecting.png";
import styled from "styled-components";
import { Trans, useTranslation } from "react-i18next";
import { Theme } from "../../../utils/StyleConstants";
import { SpotIcon, SpotIconName } from "@viewpoint/spot-icons";
import SpinnerOverlay from "../../../components/overlay/SpinnerOverlay";
import React, { useState } from "react";
import { ConfirmModal } from "../../../components/confirm-modal/ConfirmModal";
import {
  useActivateSmartServiceMutation,
  useDisableSmartServiceMutation,
  useEnableSmartServiceMutation,
  useGetSmartServiceStatusQuery,
} from "../../../api/SmartServiceApi";
import { SmartServiceStatus } from "@viewpoint/api";
import { useRequestSystemRestartMutation } from "../../../api/SystemInfoApi";
import { Image, SmartServiceTOS } from "./SmartServiceTOS";
import { Pill } from "@viewpoint/spot-react/src";
import { PillProps } from "@viewpoint/spot-react/src/components/pill/Pill";
import { CommonTransComponents } from "../../../utils/i18n-utils";
import { useGetSmartServiceEulaQuery } from "../../../api/ServerResourceApi";

const Content = styled(SettingsPageContent)`
  display: flex;
  flex-direction: column;
  gap: 40px;

  .blurb {
    ul {
      list-style-type: none;
      margin: 0;
    }
  }
`;

const ValuesContainer = styled.div`
  display: flex;
  gap: 15px;
  width: 100%;
  flex: 3;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 18px;
`;

export function SmartServiceSettings() {
  const { t } = useTranslation();
  const { data: smartServiceConnectionStatus, isLoading } =
    useGetSmartServiceStatusQuery();
  const [restart] = useRequestSystemRestartMutation();

  return (
    <SettingsPageRoot>
      <Content>
        {isLoading || smartServiceConnectionStatus == null ? (
          <SpinnerOverlay />
        ) : (
          <>
            <ConnectionBanner connectionStatus={smartServiceConnectionStatus} />
            {smartServiceConnectionStatus === SmartServiceStatus.OFFLINE ? (
              <OfflineBlurb onRestart={() => restart()} />
            ) : (
              <>
                <SpotText data-testid={TestIds.howHelp} level="h5">
                  {t("settings.smartService.labels.howHelp")}
                </SpotText>
                <ValuesContainer data-testid={TestIds.cards}>
                  <ValueCard iconName={"workstation"} value={Values.Support} />
                  <ValueCard iconName={"lock-private"} value={Values.Backup} />
                  <ValueCard iconName={"clipboard"} value={Values.UpToDate} />
                </ValuesContainer>
              </>
            )}
          </>
        )}
      </Content>
    </SettingsPageRoot>
  );
}

export const TestIds = {
  idexxTrademark: "idexx-trademark",
  howHelp: "how-help",
  image: "image",
  cards: "cards",
} as const;

const Values = {
  Support: "Support",
  Backup: "Backup",
  UpToDate: "UpToDate",
} as const;
type Value = (typeof Values)[keyof typeof Values];

const Card = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 25px 15px;
  background-color: ${(p: { theme: Theme }) =>
    p.theme.colors?.background?.secondary};
  max-height: 15em;

  .icon {
    fill: ${(p: { theme: Theme }) => p.theme.colors?.interactive?.primary};
  }
`;

interface ValueCardProps {
  iconName: SpotIconName;
  value: Value;
}

function ValueCard(props: ValueCardProps) {
  const { t } = useTranslation();
  return (
    <Card>
      <SpotIcon name={props.iconName} size={30} />

      <SpotText level="paragraph" bold>
        {t(`settings.smartService.cards.${props.value}.title`)}
      </SpotText>

      <SpotText level="paragraph">
        {t(`settings.smartService.cards.${props.value}.body`)}
      </SpotText>
    </Card>
  );
}

function OfflineBlurb(props: { onRestart: () => any }) {
  const [confirmRestartOpen, setConfirmRestartOpen] = useState(false);
  const { t } = useTranslation();
  return (
    <>
      <SpotText
        data-testid={TestIds.howHelp}
        level="paragraph"
        className="blurb"
      >
        <Trans
          i18nKey={"smartService.reconnectionInstructions"}
          components={CommonTransComponents}
        />
      </SpotText>
      <ButtonContainer>
        <Button onClick={() => setConfirmRestartOpen(true)}>
          {t("header.powerDownModal.buttons.restart")}
        </Button>
      </ButtonContainer>
      {confirmRestartOpen && (
        <ConfirmModal
          open
          onClose={() => setConfirmRestartOpen(false)}
          onConfirm={() => {
            setConfirmRestartOpen(false);
            props.onRestart();
          }}
          headerContent={t("instrumentScreens.system.restartModal.title")}
          bodyContent={t("instrumentScreens.system.restartModal.message")}
          confirmButtonContent={t("general.buttons.restart")}
          cancelButtonContent={t("general.buttons.cancel")}
        />
      )}
    </>
  );
}

const Banner = styled.div`
  display: flex;
`;

const BannerLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  flex: 3;
`;

const BannerRight = styled.div`
  margin-left: auto;
  flex: 2;
  display: flex;
  justify-content: flex-end;
  padding-right: 2em;
`;

const PILL_LEVELS: { [key in SmartServiceStatus]: PillProps["level"] } = {
  [SmartServiceStatus.OFFLINE]: "negative",
  [SmartServiceStatus.CONNECTING]: "warning",
  [SmartServiceStatus.CONNECTED]: "positive",
  [SmartServiceStatus.NOT_ACTIVATED]: "secondary",
  [SmartServiceStatus.DISABLED]: "secondary",
};

const IMAGES: { [key in SmartServiceStatus]: string } = {
  [SmartServiceStatus.OFFLINE]: SmartServiceLogoOffline,
  [SmartServiceStatus.CONNECTING]: SmartServiceLogoConnecting,
  [SmartServiceStatus.CONNECTED]: SmartServiceLogoConnected,
  [SmartServiceStatus.NOT_ACTIVATED]: SmartServiceLogoNotActive,
  [SmartServiceStatus.DISABLED]: SmartServiceLogoNotActive,
};

interface ConnectionBannerProps {
  connectionStatus: SmartServiceStatus;
}

function ConnectionBanner(props: ConnectionBannerProps) {
  const [informationalTOSModalOpen, setInformationalTOSModalOpen] =
    useState(false);
  const [activationTOSModalOpen, setActivationTOSModalOpen] = useState(false);
  const [deactivateModalOpen, setDeactivateModalOpen] = useState(false);
  const { t } = useTranslation();
  const { data: ssEula } = useGetSmartServiceEulaQuery();
  const [activateSmartService] = useActivateSmartServiceMutation();
  const [enableSmartService, enableSmartServiceStatus] =
    useEnableSmartServiceMutation();
  const [disableSmartService] = useDisableSmartServiceMutation();

  const canBeActivated =
    props.connectionStatus === SmartServiceStatus.DISABLED ||
    props.connectionStatus === SmartServiceStatus.NOT_ACTIVATED;

  const onActivate = () => {
    // EULA has not been accepted -- show that first, then activate
    if (props.connectionStatus === SmartServiceStatus.NOT_ACTIVATED) {
      setActivationTOSModalOpen(true);
    } else {
      enableSmartService();
    }
  };

  return (
    <Banner>
      <BannerLeft>
        <SpotText data-testid={TestIds.idexxTrademark} level="h3">
          {t("settings.smartService.labels.smartService")}
        </SpotText>
        <div>
          <Pill level={PILL_LEVELS[props.connectionStatus]}>
            {t(`settings.smartService.status.${props.connectionStatus}`)}
          </Pill>
        </div>
        <ButtonContainer>
          <Button
            buttonType="secondary"
            onClick={() => setInformationalTOSModalOpen(true)}
          >
            {t("settings.smartService.buttons.terms")}
          </Button>
          {canBeActivated ? (
            <Button buttonType="primary" onClick={onActivate}>
              {t("settings.smartService.buttons.activate")}
            </Button>
          ) : (
            <Button
              buttonType="secondary"
              disabled={enableSmartServiceStatus.isLoading}
              onClick={() => setDeactivateModalOpen(true)}
            >
              {t("settings.smartService.buttons.deactivate")}
            </Button>
          )}
        </ButtonContainer>
      </BannerLeft>

      <BannerRight>
        <Image
          data-testid={TestIds.image}
          src={IMAGES[props.connectionStatus]}
        />
      </BannerRight>

      {informationalTOSModalOpen && (
        <ConfirmModal
          open
          onClose={() => setInformationalTOSModalOpen(false)}
          onConfirm={() => setInformationalTOSModalOpen(false)}
          headerContent={t("settings.smartService.termsModal.title")}
          bodyContent={<SmartServiceTOS />}
          confirmButtonContent={t("general.buttons.ok")}
          cancelButtonContent={t("general.buttons.close")}
        />
      )}

      {activationTOSModalOpen && (
        <ConfirmModal
          open
          onClose={() => setActivationTOSModalOpen(false)}
          onConfirm={async () => {
            if (ssEula == null) {
              console.error(
                "Unable to activate SmartService -- missing the EULA response from IVLS"
              );
            } else {
              await activateSmartService(ssEula);
              await enableSmartService();
              setActivationTOSModalOpen(false);
            }
          }}
          headerContent={t("settings.smartService.termsModal.titleActivate")}
          bodyContent={<SmartServiceTOS />}
          confirmButtonContent={t("eula.common.buttons.agree")}
          cancelButtonContent={t("general.buttons.close")}
        />
      )}

      {deactivateModalOpen && (
        <ConfirmModal
          open
          onClose={() => setDeactivateModalOpen(false)}
          onConfirm={() => {
            disableSmartService();
            setDeactivateModalOpen(false);
          }}
          headerContent={t("settings.smartService.deactivateModal.title")}
          bodyContent={t("settings.smartService.deactivateModal.body")}
          confirmButtonContent={t("settings.smartService.buttons.deactivate")}
          cancelButtonContent={t("general.buttons.close")}
        />
      )}
    </Banner>
  );
}
