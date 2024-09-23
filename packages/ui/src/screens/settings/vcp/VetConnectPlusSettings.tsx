import { Button, SpotText } from "@viewpoint/spot-react";
import {
  SettingsPageContent,
  SettingsPageRoot,
} from "../common-settings-components";
import VCPComputer from "../../../assets/vcp/vcp_computer.png";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { Theme } from "../../../utils/StyleConstants";
import { SpotIcon, SpotIconName } from "@viewpoint/spot-icons";
import SpinnerOverlay from "../../../components/overlay/SpinnerOverlay";
import {
  useDeactivateVcpMutation,
  useGetVcpConfigurationQuery,
  useLazyCanConnectToVcpQuery,
} from "../../../api/VetConnectPlusApi";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ConfirmModal } from "../../../components/confirm-modal/ConfirmModal";
import { BasicModal } from "../../../components/basic-modal/BasicModal";
import { TestIds } from "../../../components/qc/QCLotInfoModal";

const Content = styled(SettingsPageContent)`
  display: flex;
  flex-direction: column;
  gap: 40px;
`;

const ValuesContainer = styled.div`
  display: flex;
  gap: 15px;
  width: 100%;
  flex: 3;
`;

const InfoContainer = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;

  .icon {
    fill: ${(p: { theme: Theme }) =>
      p.theme.colors?.text?.secondary}; // TODO - confirm color choice
  }
`;

export const TestId = {
  ConnectButton: "vcp-settings-connect-button",
  DisconnectButton: "vcp-settings-disconnect-button",
  TestConnectionButton: "vcp-settings-test-connection-button",
  TestConnectionModal: (success?: boolean) =>
    `vcp-settings-test-connection-modal-${success ? "success" : "failure"}`,
  vcpConfirmDisconnect: "vcp-confirm-disconnect",
};

export function VetConnectPlusSettings() {
  const { t } = useTranslation();
  const { data: config, isLoading } = useGetVcpConfigurationQuery();

  const connected = !!config?.vcpActivated;

  return (
    <SettingsPageRoot>
      <Content>
        {isLoading ? (
          <SpinnerOverlay />
        ) : (
          <>
            <VCPBanner connected={connected} />
            <SpotText level="h5">{t("settings.vcp.labels.howHelp")}</SpotText>
            <ValuesContainer>
              <ValueCard
                iconName={"test-lab"}
                value={Values.AdvancedDiagnostics}
              />
              <ValueCard
                iconName={"clipboard"}
                value={Values.ClinicalInsights}
              />
              <ValueCard iconName={"time-clock"} value={Values.SaveTime} />
            </ValuesContainer>
            <InfoContainer>
              {!connected && (
                <>
                  <SpotIcon name="info-2" size={25} />
                  <SpotText level="paragraph">
                    {t("settings.vcp.labels.info")}
                  </SpotText>
                </>
              )}
            </InfoContainer>
          </>
        )}
      </Content>
    </SettingsPageRoot>
  );
}

const Values = {
  AdvancedDiagnostics: "advancedDiagnostics",
  ClinicalInsights: "clinicalInsights",
  SaveTime: "saveTime",
} as const;
type Value = (typeof Values)[keyof typeof Values];

const Card = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 15px;
  background-color: ${(p: { theme: Theme }) =>
    p.theme.colors?.background?.secondary};

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
        {t(`settings.vcp.cards.${props.value}.title`)}
      </SpotText>

      <SpotText level="paragraph">
        {t(`settings.vcp.cards.${props.value}.body`)}
      </SpotText>
    </Card>
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
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 30px;
`;

const Image = styled.img`
  max-width: 65%;
  object-fit: contain;
`;

const StayConnectedButton = styled(Button)`
  && {
    margin-left: auto;
  }
`;

interface VCPBannerProps {
  connected: boolean;
}

function VCPBanner(props: VCPBannerProps) {
  const [testModalVisible, setTestModalVisible] = useState(false);
  const [disconnectModalVisible, setDisconnectModalVisible] = useState(false);
  const { t } = useTranslation();

  const [testConnection, testConnectionStatus] = useLazyCanConnectToVcpQuery();
  const [disconnect, disconnectStatus] = useDeactivateVcpMutation();
  const nav = useNavigate();

  const handleTestConnection = async () => {
    try {
      await testConnection().unwrap();
    } catch (err) {
      console.error(err);
    } finally {
      setTestModalVisible(true);
    }
  };

  return (
    <Banner>
      {testModalVisible && (
        <ConfirmModal
          open={testModalVisible}
          data-testid={TestId.TestConnectionModal(
            testConnectionStatus.currentData
          )}
          onClose={() => setTestModalVisible(false)}
          onConfirm={() => setTestModalVisible(false)}
          headerContent={t("settings.vcp.testConnection.title")}
          bodyContent={t(
            `settings.vcp.testConnection.${
              testConnectionStatus?.currentData ? "success" : "failure"
            }`
          )}
          confirmButtonContent={t("general.buttons.ok")}
        />
      )}
      {disconnectModalVisible && (
        <BasicModal
          open={disconnectModalVisible}
          onClose={() => setDisconnectModalVisible(false)}
          bodyContent={t("settings.vcp.disconnect.body")}
          headerContent={
            <SpotText level={"h3"} data-testid={TestIds.header}>
              {t("settings.vcp.disconnect.title")}
            </SpotText>
          }
          footerContent={
            <>
              <StayConnectedButton
                buttonType="secondary"
                onClick={() => setDisconnectModalVisible(false)}
              >
                {t("settings.vcp.disconnect.stayConnected")}
              </StayConnectedButton>
              <Button
                data-testid={TestId.vcpConfirmDisconnect}
                buttonType="primary"
                onClick={() => {
                  setDisconnectModalVisible(false);
                  disconnect();
                }}
              >
                {t("settings.vcp.disconnect.disconnect")}
              </Button>
            </>
          }
        />
      )}
      <BannerLeft>
        <SpotText level="h3">{t("settings.vcp.labels.vcp")}</SpotText>
        {props.connected ? (
          <ButtonContainer>
            <Button
              data-testid={TestId.TestConnectionButton}
              buttonType="secondary"
              onClick={handleTestConnection}
              disabled={testConnectionStatus.isFetching}
            >
              {t("settings.vcp.buttons.testConnection")}
            </Button>
            <Button
              data-testid={TestId.DisconnectButton}
              buttonType="secondary"
              onClick={() => setDisconnectModalVisible(true)}
              disabled={disconnectStatus.isLoading}
            >
              {t("settings.vcp.buttons.disconnect")}
            </Button>
          </ButtonContainer>
        ) : (
          <ButtonContainer>
            <Button
              data-testid={TestId.ConnectButton}
              onClick={() => nav("activate")}
            >
              {t("settings.vcp.buttons.connect")}
            </Button>
          </ButtonContainer>
        )}
      </BannerLeft>

      <BannerRight>
        {!props.connected && <Image src={VCPComputer} />}
      </BannerRight>
    </Banner>
  );
}
