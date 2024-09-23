import {
  EventIds,
  FluidPackStatusResponseDto,
  InstrumentMaintenanceResultDto,
  InstrumentStatus,
  InstrumentStatusDto,
  MaintenanceProcedure,
} from "@viewpoint/api";
import {
  AnalyzerOverview,
  GenericOfflineInstructions,
} from "../AnalyzerOverview";
import { useCallback, useEffect, useState } from "react";
import { Button, SpotText } from "@viewpoint/spot-react";
import { useTranslation } from "react-i18next";
import { InstrumentInfo } from "../InstrumentInfo";
import {
  InstrumentPageContent,
  InstrumentPageRightPanel,
  InstrumentPageRightPanelButtonContainer,
  InstrumentPageRightPanelDivider,
  InstrumentPageRoot,
} from "../common-components";
import { useNavigate } from "react-router-dom";
import { INSTRUMENTS, QUALITY_CONTROL } from "../../../constants/routes";
import { useEventListener } from "../../../context/EventSourceContext";
import { useRequestFluidPackStatusMutation } from "../../../api/ProCyteOneMaintenanceApi";
import styled from "styled-components";
import { Theme } from "../../../utils/StyleConstants";
import { ProCyteOneReplaceFluidModal } from "./maintenance/ProCyteOneReplaceFluidModal";
import { SheathGauge } from "../../../components/level-gauge/SheathGauge";
import { ReagentGauge } from "../../../components/level-gauge/ReagentGauge";
import { CancelProcessButton } from "../common/CancelProcessButton";

export const TestId = {
  GaugeContainer: (type: FluidPackStatusResponseDto["packType"]) =>
    `pco-gauge-container-${type}`,
  Gauge: (type: FluidPackStatusResponseDto["packType"]) => `pco-gauge-${type}`,
  SheathPercent: "pco-sheath-percent-remaining",
  SheathExpires: "pco-sheath-expire-date",
  ReagentRuns: "pco-reagent-runs-remaining",
  ReagentExpires: "pco-reagent-expire-date",
  FluidLevels: "pco-fluid-levels",
  QcButton: "pco-qc-button",
  DiagnosticsButton: "pco-diagnostics-button",
  EventLogButton: "pco-eventlog-button",
  SettingsButton: "pco-settings-button",
} as const;

const StyledContent = styled(InstrumentPageContent)`
  display: flex;
  flex-direction: column;
  gap: 50px;
`;

const settingsDisabledStatuses = new Set<InstrumentStatus>([
  InstrumentStatus.Offline,
  InstrumentStatus.Busy,
  InstrumentStatus.Alert,
]);

const settingsDisabled = (instrumentStatus?: InstrumentStatus) =>
  instrumentStatus != null && settingsDisabledStatuses.has(instrumentStatus);

const diagnosticsDisabledStatuses = new Set<InstrumentStatus>([
  InstrumentStatus.Offline,
  InstrumentStatus.Busy,
]);

const diagnosticsDisabled = (instrumentStatus?: InstrumentStatus) =>
  instrumentStatus != null && diagnosticsDisabledStatuses.has(instrumentStatus);

export interface InstrumentContentProps {
  instrument: InstrumentStatusDto;
}

export function ProCyteOneInstrumentScreen(props: InstrumentContentProps) {
  const { t } = useTranslation();
  const nav = useNavigate();

  return (
    <InstrumentPageRoot>
      <StyledContent data-testid="pco-maintenance-screen">
        <AnalyzerOverview
          instrument={props.instrument}
          offlineBodyContent={
            <GenericOfflineInstructions
              instrumentType={props.instrument.instrument.instrumentType}
            />
          }
        />

        {props.instrument.connected && (
          <FluidGauges instrumentId={props.instrument.instrument.id} />
        )}
      </StyledContent>

      <InstrumentPageRightPanel data-testid="pco-maintenance-screen-right">
        <InstrumentPageRightPanelButtonContainer>
          <Button
            data-testid={TestId.QcButton}
            onClick={() =>
              nav(
                `/${INSTRUMENTS}/${props.instrument.instrument.id}/${QUALITY_CONTROL}`
              )
            }
          >
            {t("instrumentScreens.general.buttons.qualityControl")}
          </Button>
          <Button
            data-testid={TestId.DiagnosticsButton}
            onClick={() =>
              nav(
                `/${INSTRUMENTS}/${props.instrument.instrument.id}/diagnostics`
              )
            }
            disabled={
              !props.instrument?.connected ||
              diagnosticsDisabled(props.instrument?.instrumentStatus)
            }
          >
            {t("instrumentScreens.general.buttons.diagnostics")}
          </Button>
          <Button
            data-testid={TestId.EventLogButton}
            onClick={() => nav("eventlog")}
          >
            {t("instrumentScreens.general.buttons.eventLog")}
          </Button>
          <Button
            data-testid={TestId.SettingsButton}
            onClick={() =>
              nav(`/instruments/${props.instrument.instrument.id}/settings`)
            }
            disabled={
              !props.instrument?.connected ||
              settingsDisabled(props.instrument?.instrumentStatus)
            }
          >
            {t("instrumentScreens.general.buttons.settings")}
          </Button>
        </InstrumentPageRightPanelButtonContainer>

        <InstrumentPageRightPanelDivider />

        <InstrumentPageRightPanelButtonContainer>
          <CancelProcessButton
            buttonType="secondary"
            instrumentStatus={props.instrument}
          />
        </InstrumentPageRightPanelButtonContainer>

        <InstrumentPageRightPanelDivider />

        <InstrumentInfo
          properties={{
            [t("instrumentScreens.general.labels.softwareVersion")]:
              props.instrument.instrument.softwareVersion,
            [t("instrumentScreens.proCyteOne.labels.smartQcVersion")]: "", // Work still to be done on IVLS to expose this
            [t("instrumentScreens.general.labels.serialNumber")]:
              props.instrument.instrument.instrumentSerialNumber,
            [t("instrumentScreens.general.labels.ipAddress")]: props.instrument
              .connected
              ? props.instrument.instrument.ipAddress
              : "",
          }}
        />
      </InstrumentPageRightPanel>
    </InstrumentPageRoot>
  );
}

const FluidLevelsRoot = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const GaugesContainer = styled.div`
  border: ${(p: { theme: Theme }) => p.theme.borders?.lightPrimary};
  border-radius: 5px;
  padding: 15px;
  display: flex;
  max-width: 400px;
`;

const GaugeContainer = styled.div`
  height: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 5px;

  .level-gauge {
    margin-bottom: 20px;
  }
`;

const ReplaceButton = styled(Button)`
  padding: 0px;
  margin-top: 20px;
`;

export interface FluidGaugesProps {
  instrumentId: number;
}

export function FluidGauges(props: FluidGaugesProps) {
  const [sheathData, setSheathData] = useState<FluidPackStatusResponseDto>();
  const [reagentData, setReagentData] = useState<FluidPackStatusResponseDto>();
  const [replaceSheathOpen, setReplaceSheathOpen] = useState<boolean>(false);
  const [replaceReagentOpen, setReplaceReagentOpen] = useState<boolean>(false);

  const [requestFluidStatus] = useRequestFluidPackStatusMutation();

  const { t } = useTranslation();

  const sheathDataCallback = useCallback(
    (msg: MessageEvent) => {
      const data: FluidPackStatusResponseDto = JSON.parse(msg.data);
      if (data.instrumentId === props.instrumentId) {
        if (data.packType === "Sheath") {
          setSheathData(data);
        } else if (data.packType === "Reagent") {
          setReagentData(data);
        } else {
          console.warn(`Unknown fluid pack type ${data.packType}`);
        }
      }
    },
    [props.instrumentId, setSheathData, setReagentData]
  );

  useEventListener(EventIds.FluidPackStatusUpdate, sheathDataCallback);

  const maintenanceResultCallback = useCallback(
    (msg: MessageEvent) => {
      const data: InstrumentMaintenanceResultDto = JSON.parse(msg.data);
      if (data.instrument?.id === props.instrumentId) {
        if (data.maintenanceType === MaintenanceProcedure.REPLACE_REAGENT) {
          setReplaceReagentOpen(false);
        } else if (
          data.maintenanceType === MaintenanceProcedure.REPLACE_SHEATH
        ) {
          setReplaceSheathOpen(false);
        }
      }
    },
    [props.instrumentId, setReplaceSheathOpen, setReplaceReagentOpen]
  );

  useEventListener(
    EventIds.InstrumentMaintenanceResult,
    maintenanceResultCallback
  );

  useEffect(() => {
    requestFluidStatus(props.instrumentId);
  }, [props.instrumentId]);

  return (
    <>
      {replaceSheathOpen && (
        <ProCyteOneReplaceFluidModal
          onClose={() => setReplaceSheathOpen(false)}
          onConfirm={() => setReplaceSheathOpen(false)}
          type={"Sheath"}
          open={replaceSheathOpen}
        />
      )}
      {replaceReagentOpen && (
        <ProCyteOneReplaceFluidModal
          onClose={() => setReplaceReagentOpen(false)}
          onConfirm={() => setReplaceReagentOpen(false)}
          type={"Reagent"}
          open={replaceReagentOpen}
        />
      )}
      <FluidLevelsRoot data-testid={TestId.FluidLevels}>
        <SpotText level="h4">
          {t("instrumentScreens.common.fluid.labels.fluidLevels")}
        </SpotText>
        <GaugesContainer>
          <GaugeContainer data-testid={TestId.GaugeContainer("Sheath")}>
            <SheathGauge
              percentFull={sheathData?.percentLeft}
              data-testid={TestId.Gauge("Sheath")}
            />
            <SpotText level="paragraph" bold data-testid={TestId.SheathPercent}>
              {t("instrumentScreens.common.fluid.labels.sheathRemaining", {
                percent: sheathData?.percentLeft ?? "-- ",
              })}
            </SpotText>
            <SpotText level="paragraph" data-testid={TestId.SheathExpires}>
              {t("instrumentScreens.common.fluid.labels.expires", {
                days: sheathData?.daysLeft ?? "--",
              })}
            </SpotText>
            <div>
              <ReplaceButton
                data-testid="replace-sheath-button"
                onClick={() => setReplaceSheathOpen(true)}
                buttonType="link"
              >
                {t("instrumentScreens.common.fluid.buttons.replaceSheath")}
              </ReplaceButton>
            </div>
          </GaugeContainer>

          <GaugeContainer data-testid={TestId.GaugeContainer("Reagent")}>
            <ReagentGauge
              percentFull={reagentData?.percentLeft}
              data-testid={TestId.Gauge("Reagent")}
            />
            <SpotText level="paragraph" bold data-testid={TestId.ReagentRuns}>
              {t("instrumentScreens.common.fluid.labels.reagentRemaining", {
                runs: reagentData?.runsLeft ?? "--",
              })}
            </SpotText>
            <SpotText level="paragraph" data-testid={TestId.ReagentExpires}>
              {t("instrumentScreens.common.fluid.labels.expires", {
                days: reagentData?.daysLeft ?? "--",
              })}
            </SpotText>
            <div>
              <ReplaceButton
                data-testid="replace-reagent-button"
                onClick={() => setReplaceReagentOpen(true)}
                buttonType="link"
              >
                {t("instrumentScreens.common.fluid.buttons.replaceReagent")}
              </ReplaceButton>
            </div>
          </GaugeContainer>
        </GaugesContainer>
      </FluidLevelsRoot>
    </>
  );
}
