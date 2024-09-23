import {
  CuvetteStatusResponseDto,
  EventIds,
  InstrumentStatus,
  InstrumentStatusDto,
  MaintenanceProcedure,
} from "@viewpoint/api";
import {
  AnalyzerOverview,
  GenericOfflineInstructions,
} from "../AnalyzerOverview";
import { useEffect, useState } from "react";
import { Button, Modal, SpotText } from "@viewpoint/spot-react";
import { useTranslation } from "react-i18next";
import { InstrumentInfo } from "../InstrumentInfo";
import {
  InstrumentPageContent,
  InstrumentPageRightPanel,
  InstrumentPageRightPanelButtonContainer,
  InstrumentPageRightPanelDivider,
  InstrumentPageRoot,
} from "../common-components";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { BasicModal } from "../../../components/basic-modal/BasicModal";
import { useRequestSediVueCuvetteStatusMutation } from "../../../api/SediVueApi";
import { SediVueDxCartridgeStatus } from "./SediVueDxCartridgeStatus";
import { useEventListener } from "../../../context/EventSourceContext";
import { useRequestSediVueProcedureMutation } from "../../../api/SediVueApi";
import { useStartupInstrumentMutation } from "../../../api/InstrumentApi";
import { Divider } from "../../settings/common-settings-components";
import {
  getAvailableUpgrade,
  UpgradeNowButton,
} from "../common/UpgradeNowButton";
import { CancelProcessButton } from "../common/CancelProcessButton";

export const TestId = {
  DiagnosticsButton: "svdx-diagnostics-button",
  SettingsButton: "svdx-settings-button",
  QCButton: "svdx-qc-button",
  PowerDownButton: "svdx-power-down-button",
  PowerOnButton: "svdx-power-on-button",
} as const;

const StyledContent = styled(InstrumentPageContent)`
  display: flex;
  flex-direction: column;
  gap: 50px;
`;

export interface InstrumentContentProps {
  instrumentStatus: InstrumentStatusDto;
}

interface CartridgeStatus {
  numberRemaining?: number;
  percentRemaining?: number;
  lotNumber?: string;
  expirationDate?: Date;
  installationDate?: Date;
}

function cuvetteResponseToCartridgeStatus(res: CuvetteStatusResponseDto) {
  return {
    numberRemaining: res.count,
    percentRemaining: (100 * res.count) / res.total,
    lotNumber: res.lotNumber,
    expirationDate: res.expirationDate,
    installationDate: res.installationDate,
  };
}

const DISABLE_REPLACE_CART_STATUSES = new Set<InstrumentStatus>([
  InstrumentStatus.Unknown,
  InstrumentStatus.Offline,
  InstrumentStatus.Busy,
  InstrumentStatus.Not_Ready,
]);

const DISABLE_MAINT_STATUSES = new Set([
  InstrumentStatus.Offline,
  InstrumentStatus.Unknown,
  InstrumentStatus.Busy,
  InstrumentStatus.Not_Ready,
]);

export function SediVueDxInstrumentScreen(props: InstrumentContentProps) {
  const [powerDownModalOpen, setPowerDownModalOpen] = useState(false);

  const { t } = useTranslation();
  const [requestProcedure] = useRequestSediVueProcedureMutation();
  const [startupInstrument] = useStartupInstrumentMutation();
  const nav = useNavigate();
  const [requestSediVueCuvetteStatus] =
    useRequestSediVueCuvetteStatusMutation();

  const [cartridgeStatus, setCartridgeStatus] = useState<CartridgeStatus>();

  const {
    instrument: { id: instrumentId },
    connected: instrumentConnected,
  } = props.instrumentStatus;

  useEffect(() => {
    if (instrumentId != null && instrumentConnected) {
      requestSediVueCuvetteStatus({ instrumentId });
    }
  }, [requestSediVueCuvetteStatus, instrumentId, instrumentConnected]);

  useEventListener(EventIds.CuvetteStatusUpdate, (evt) => {
    const res: CuvetteStatusResponseDto = JSON.parse(evt.data);
    setCartridgeStatus(cuvetteResponseToCartridgeStatus(res));
  });

  return (
    <InstrumentPageRoot>
      <StyledContent data-testid="svdx-maintenance-screen">
        <AnalyzerOverview
          instrument={props.instrumentStatus}
          offlineBodyContent={
            <GenericOfflineInstructions
              instrumentType={props.instrumentStatus.instrument.instrumentType}
            />
          }
        />

        {props.instrumentStatus.connected ? (
          <SediVueDxCartridgeStatus
            {...cartridgeStatus}
            allowReplaceCartridge={
              !DISABLE_REPLACE_CART_STATUSES.has(
                props.instrumentStatus.instrumentStatus
              )
            }
            onReplaceCartridge={() => {
              nav("maintenance/replace/cartridge");
            }}
          />
        ) : null}
      </StyledContent>

      <InstrumentPageRightPanel data-testid="maintenance-screen-right">
        <InstrumentPageRightPanelButtonContainer>
          <Button
            data-testid={TestId.DiagnosticsButton}
            onClick={() => nav("maintenance")}
            disabled={DISABLE_MAINT_STATUSES.has(
              props.instrumentStatus.instrumentStatus
            )}
          >
            {t("instrumentScreens.general.buttons.maintenance")}
          </Button>

          <Button data-testid={TestId.QCButton} onClick={() => nav("qc")}>
            {t("instrumentScreens.general.buttons.qualityControl")}
          </Button>

          <Button
            data-testid={TestId.SettingsButton}
            onClick={() => nav("settings")}
          >
            {t("instrumentScreens.general.buttons.settings")}
          </Button>

          <Divider />

          <CancelProcessButton
            buttonType="secondary"
            instrumentStatus={props.instrumentStatus}
          />

          {props.instrumentStatus.connected ? (
            <Button
              data-testid={TestId.PowerDownButton}
              onClick={() => setPowerDownModalOpen(true)}
              buttonType="secondary"
            >
              {t("instrumentScreens.general.buttons.powerDown")}
            </Button>
          ) : (
            <Button
              data-testid={TestId.PowerOnButton}
              onClick={() => {
                startupInstrument(instrumentId);
                nav("/");
              }}
              buttonType="secondary"
            >
              {t("instrumentScreens.general.buttons.powerOn")}
            </Button>
          )}
        </InstrumentPageRightPanelButtonContainer>

        <InstrumentPageRightPanelDivider />

        {props.instrumentStatus.connected &&
          getAvailableUpgrade(props.instrumentStatus.instrument) != null && (
            <UpgradeNowButton instrumentStatus={props.instrumentStatus} />
          )}

        <InstrumentInfo
          properties={{
            [t("instrumentScreens.general.labels.softwareVersion")]:
              props.instrumentStatus.instrument.softwareVersion,
            [t("instrumentScreens.general.labels.serialNumber")]:
              props.instrumentStatus.instrument.instrumentSerialNumber,
            [t("instrumentScreens.general.labels.ipAddress")]: props
              .instrumentStatus.connected
              ? props.instrumentStatus.instrument.ipAddress
              : "",
          }}
        />
      </InstrumentPageRightPanel>

      {powerDownModalOpen && (
        <PowerDownModal
          instrumentName={t("instruments.names.URISED")}
          onClose={() => setPowerDownModalOpen(false)}
          onShutDown={() => {
            requestProcedure({
              instrumentId,
              procedure: MaintenanceProcedure.SHUTDOWN,
            });
            setPowerDownModalOpen(false);
            nav("/");
          }}
          onRestart={() => {
            requestProcedure({
              instrumentId,
              procedure: MaintenanceProcedure.RESTART,
            });
            setPowerDownModalOpen(false);
            nav("/");
          }}
        />
      )}
    </InstrumentPageRoot>
  );
}

export interface PowerDownModalProps {
  instrumentName: string;
  onClose: () => void;
  onShutDown: () => void;
  onRestart: () => void;
}

export function PowerDownModal(props: PowerDownModalProps) {
  const { t } = useTranslation();
  return (
    <BasicModal
      open={true}
      dismissable={false}
      onClose={props.onClose}
      bodyContent={t("instrumentScreens.common.powerDownModal.body", {
        instrumentName: props.instrumentName,
      })}
      headerContent={
        <SpotText level="h3">
          {t("instrumentScreens.common.powerDownModal.title", {
            instrumentName: props.instrumentName,
          })}
        </SpotText>
      }
      footerContent={
        <>
          <Modal.FooterCancelButton onClick={props.onClose}>
            {t("general.buttons.cancel")}
          </Modal.FooterCancelButton>
          <Button
            data-testid="svdx-restart-button"
            buttonType="secondary"
            onClick={props.onRestart}
          >
            {t("instrumentScreens.general.buttons.restart")}
          </Button>
          <Button
            data-testid="svdx-modal-power-down-button"
            onClick={props.onShutDown}
          >
            {t("instrumentScreens.general.buttons.powerDown")}
          </Button>
        </>
      }
    />
  );
}
