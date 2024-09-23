import {
  EventIds,
  HealthCode,
  InstrumentStatus,
  InstrumentStatusDto,
  ProCyteDxFluidType,
  ProCyteDxProcedure,
  ReagentStatusChangedDto,
} from "@viewpoint/api";
import {
  InstrumentPageContent,
  InstrumentPageRightPanel,
  InstrumentPageRightPanelButtonContainer,
  InstrumentPageRightPanelDivider,
  InstrumentPageRoot,
} from "../common-components";
import {
  AnalyzerOverview,
  GenericOfflineInstructions,
} from "../AnalyzerOverview";
import { Button, SpotText } from "@viewpoint/spot-react";
import { Trans, useTranslation } from "react-i18next";
import { InstrumentInfo } from "../InstrumentInfo";
import {
  useEnterStandbyMutation,
  useExitStandbyMutation,
  useGetDetailedInstrumentStatusQuery,
  useStartupInstrumentMutation,
} from "../../../api/InstrumentApi";
import { InlineText } from "../../../components/typography/InlineText";
import { useRequestProCyteDxProcedureMutation } from "../../../api/ProCyteDxApi";
import { useEffect, useState } from "react";
import { useEventListener } from "../../../context/EventSourceContext";
import { ProCyteDxProcedures } from "./ProCyteDxProcedures";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { QUALITY_CONTROL } from "../../../constants/routes";
import { useConfirmModal } from "../../../components/global-modals/components/GlobalConfirmModal";
import {
  ProCyteDxFluidGauges,
  ProCyteDxFluidGaugesHeader,
} from "./ProCyteDxFluidGauges";
import { CancelProcessButton } from "../common/CancelProcessButton";

export interface ProCyteDxInstrumentScreenProps {
  instrumentStatus: InstrumentStatusDto;
}

const diagnosticsButtonEnabled = (
  status: InstrumentStatusDto,
  healthCode?: HealthCode
) => healthCode == HealthCode.NOT_READY || healthCode == HealthCode.READY;

const settingsButtonEnabled = (
  status: InstrumentStatusDto,
  healthCode?: HealthCode
) => healthCode == HealthCode.NOT_READY || healthCode == HealthCode.READY;

const standbyButtonEnabled = (
  status: InstrumentStatusDto,
  healthCode?: HealthCode
) =>
  healthCode == HealthCode.READY ||
  status.instrumentStatus == InstrumentStatus.Standby ||
  status.instrumentStatus == InstrumentStatus.Sleep;

const powerDownButtonEnabled = (
  status: InstrumentStatusDto,
  healthCode?: HealthCode
) =>
  healthCode == HealthCode.READY ||
  status.instrumentStatus == InstrumentStatus.Standby ||
  status.instrumentStatus == InstrumentStatus.Sleep;

const changeReagentButtonEnabled = (
  status: InstrumentStatusDto,
  healthCode?: HealthCode
) => healthCode == HealthCode.NOT_READY || healthCode == HealthCode.READY;

export const TestId = {
  QCButton: "pdx-qc-button",
  DiagnosticsButton: "pdx-diagnostics-button",
  SettingsButton: "pdx-settings-button",
  EnterStandbyButton: "pdx-enter-standby-button",
  EnterStandbyModal: "pdx-enter-standby-modal",
  ExitStandbyButton: "pdx-exit-standby-button",
  ExitStandbyModal: "pdx-exit-standby-modal",
  PowerDownButton: "pdx-power-down-button",
  PowerDownModal: "pdx-power-down-modal",
  PowerOnButton: "pdx-power-on-button",
  PowerOnModal: "pdx-power-on-modal",
};

const OrderedList = styled.ol`
  list-style: none;
`;

const StyledContent = styled(InstrumentPageContent)`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const ProceduresContainer = styled.div`
  display: flex;
`;

export function ProCyteDxInstrumentScreen(
  props: ProCyteDxInstrumentScreenProps
) {
  const [reagentStatus, setReagentStatus] = useState<ReagentStatusChangedDto>();

  const { t } = useTranslation();
  const nav = useNavigate();
  const { data: detailedStatus } = useGetDetailedInstrumentStatusQuery(
    props.instrumentStatus.instrument.id
  );
  const { addConfirmModal } = useConfirmModal();
  const [requestProcedure] = useRequestProCyteDxProcedureMutation();
  const [startupInstrument] = useStartupInstrumentMutation();
  const [enterStandby] = useEnterStandbyMutation();
  const [exitStandby] = useExitStandbyMutation();

  useEffect(() => {
    requestProcedure({
      instrumentId: props.instrumentStatus.instrument.id,
      procedure: ProCyteDxProcedure.REAGENT_STATUS_QUERY,
    });
  }, [props.instrumentStatus.instrument.id, requestProcedure]);

  useEventListener(EventIds.ReagentStatusChanged, (msg) => {
    const data: ReagentStatusChangedDto = JSON.parse(msg.data);
    if (data.instrumentId === props.instrumentStatus.instrument.id) {
      setReagentStatus(data);
    }
  });

  const handleQc = () => {
    nav(QUALITY_CONTROL);
  };

  const handleDiagnostics = () => {
    nav("diagnostics");
  };
  const handleSettings = () => nav(`settings`);

  const handleEnterStandby = () => {
    addConfirmModal({
      "data-testid": TestId.EnterStandbyModal,
      headerContent: t("instrumentScreens.proCyteDx.enterStandbyModal.title"),
      bodyContent: (
        <Trans
          i18nKey="instrumentScreens.proCyteDx.enterStandbyModal.content"
          components={{
            linebreak: (
              <>
                <br />
                <br />
              </>
            ),
            strong: <InlineText level="paragraph" bold />,
          }}
        />
      ),
      onClose: () => {},
      onConfirm: () => {
        enterStandby(props.instrumentStatus.instrument.id);
        nav("/");
      },
      cancelButtonContent: t("general.buttons.cancel"),
      confirmButtonContent: t(
        "instrumentScreens.proCyteDx.buttons.enterStandby"
      ),
    });
  };

  const handleExitStandby = () => {
    addConfirmModal({
      "data-testid": TestId.ExitStandbyModal,
      headerContent: t("instrumentScreens.common.exitStandbyModal.title"),
      bodyContent: (
        <Trans
          i18nKey="instrumentScreens.common.exitStandbyModal.content.CRIMSON"
          values={{ instrumentName: t("instruments.names.CRIMSON") }}
          components={{
            linebreak: (
              <>
                <br />
                <br />
              </>
            ),
            strong: <InlineText level="paragraph" bold />,
          }}
        />
      ),
      cancelButtonContent: t("general.buttons.cancel"),
      confirmButtonContent: t("general.buttons.ok"),
      onClose: () => {},
      onConfirm: () => {
        exitStandby(props.instrumentStatus.instrument.id);
        nav("/");
      },
    });
  };

  const handlePowerDown = () => {
    addConfirmModal({
      "data-testid": TestId.PowerDownModal,
      headerContent: t("instrumentScreens.proCyteDx.powerDownModal.title"),
      bodyContent: (
        <>
          <SpotText level="paragraph">
            {t("instrumentScreens.proCyteDx.powerDownModal.toPowerDown")}
          </SpotText>
          <OrderedList>
            <li>
              <Trans
                i18nKey="instrumentScreens.proCyteDx.powerDownModal.step1"
                components={{
                  strong: <InlineText level="paragraph" bold />,
                }}
              />
            </li>
            <li>{t("instrumentScreens.proCyteDx.powerDownModal.step2")}</li>
          </OrderedList>
          <SpotText level="paragraph" bold>
            {t("instrumentScreens.proCyteDx.powerDownModal.durationMessage")}
          </SpotText>
        </>
      ),
      cancelButtonContent: t("general.buttons.cancel"),
      confirmButtonContent: t("instrumentScreens.general.buttons.powerDown"),
      onClose: () => {},
      onConfirm: () => {
        requestProcedure({
          instrumentId: props.instrumentStatus.instrument.id,
          procedure: ProCyteDxProcedure.SHUTDOWN,
        });

        nav("/");
      },
    });
  };

  const handlePowerOn = () => {
    addConfirmModal({
      "data-testid": TestId.PowerOnModal,
      headerContent: t("instrumentScreens.proCyteDx.powerOnModal.title"),
      bodyContent: (
        <Trans
          i18nKey="instrumentScreens.proCyteDx.powerOnModal.content"
          components={{
            strong: <InlineText level="paragraph" bold />,
            linebreak: (
              <>
                <br />
                <br />
              </>
            ),
          }}
        />
      ),
      cancelButtonContent: t("general.buttons.cancel"),
      confirmButtonContent: t("instrumentScreens.general.buttons.powerOn"),
      onClose: () => {},
      onConfirm: () => {
        startupInstrument(props.instrumentStatus.instrument.id);
        nav("/");
      },
    });
  };

  return (
    <InstrumentPageRoot>
      <StyledContent data-testid="pDx-instruments-screen-main">
        <AnalyzerOverview
          instrument={props.instrumentStatus}
          offlineBodyContent={
            <GenericOfflineInstructions
              instrumentType={props.instrumentStatus.instrument.instrumentType}
            />
          }
        />
        {props.instrumentStatus.connected && (
          <>
            <ProceduresContainer>
              <ProCyteDxProcedures
                loading={reagentStatus == null}
                reminderKeys={reagentStatus?.reminderKeys}
              />
            </ProceduresContainer>

            <ProCyteDxFluidGaugesHeader
              instrumentId={props.instrumentStatus.instrument.id}
            />
            <ProCyteDxFluidGauges
              {...reagentStatus}
              canChangePacks={changeReagentButtonEnabled(
                props.instrumentStatus,
                detailedStatus?.status
              )}
              onClickChange={(type) =>
                // skip the sufficient volume confirmation when the fluid type is not REAGENT
                nav(
                  `lotEntry?fluidType=${type}&skipSufficientVolumeConfirmation=${
                    type !== ProCyteDxFluidType.REAGENT
                  }`
                )
              }
            />
          </>
        )}
      </StyledContent>
      <InstrumentPageRightPanel data-testid="pDx-instruments-screen-right">
        <InstrumentPageRightPanelButtonContainer>
          <Button
            data-testid={TestId.QCButton}
            onClick={handleQc}
            buttonType="primary"
          >
            {t("instrumentScreens.general.buttons.qualityControl")}
          </Button>
          <Button
            data-testid={TestId.DiagnosticsButton}
            onClick={handleDiagnostics}
            buttonType="primary"
            disabled={
              !diagnosticsButtonEnabled(
                props.instrumentStatus,
                detailedStatus?.status
              )
            }
          >
            {t("instrumentScreens.general.buttons.diagnostics")}
          </Button>
          <Button
            data-testid={TestId.SettingsButton}
            onClick={handleSettings}
            buttonType="primary"
            disabled={
              !settingsButtonEnabled(
                props.instrumentStatus,
                detailedStatus?.status
              )
            }
          >
            {t("instrumentScreens.general.buttons.settings")}
          </Button>
        </InstrumentPageRightPanelButtonContainer>
        <InstrumentPageRightPanelDivider />
        <InstrumentPageRightPanelButtonContainer>
          <CancelProcessButton
            buttonType="secondary"
            instrumentStatus={props.instrumentStatus}
          />

          {props.instrumentStatus.instrumentStatus ===
            InstrumentStatus.Standby ||
          props.instrumentStatus.instrumentStatus === InstrumentStatus.Sleep ? (
            <Button
              data-testid={TestId.ExitStandbyButton}
              onClick={handleExitStandby}
              buttonType="secondary"
              disabled={
                !standbyButtonEnabled(
                  props.instrumentStatus,
                  detailedStatus?.status
                )
              }
            >
              {t("instrumentScreens.proCyteDx.buttons.exitStandby")}
            </Button>
          ) : (
            <Button
              data-testid={TestId.EnterStandbyButton}
              onClick={handleEnterStandby}
              buttonType="secondary"
              disabled={
                !standbyButtonEnabled(
                  props.instrumentStatus,
                  detailedStatus?.status
                )
              }
            >
              {t("instrumentScreens.proCyteDx.buttons.enterStandby")}
            </Button>
          )}

          {props.instrumentStatus.connected ? (
            <Button
              data-testid={TestId.PowerDownButton}
              onClick={handlePowerDown}
              buttonType="secondary"
              disabled={
                !powerDownButtonEnabled(
                  props.instrumentStatus,
                  detailedStatus?.status
                )
              }
            >
              {t("instrumentScreens.general.buttons.powerDown")}
            </Button>
          ) : (
            <Button
              data-testid={TestId.PowerOnButton}
              onClick={handlePowerOn}
              buttonType="secondary"
            >
              {t("instrumentScreens.general.buttons.powerOn")}
            </Button>
          )}
        </InstrumentPageRightPanelButtonContainer>
        <InstrumentPageRightPanelDivider />

        <InstrumentInfo
          properties={{
            [t("instrumentScreens.general.labels.softwareVersion")]:
              props.instrumentStatus.instrument.softwareVersion,
            [t("instrumentScreens.general.labels.serialNumber")]:
              props.instrumentStatus.instrument.instrumentStringProperties?.[
                "serial.mainunit"
              ],
            [t("instrumentScreens.proCyteDx.labels.ipuSerialNumber")]:
              props.instrumentStatus.instrument.instrumentStringProperties?.[
                "serial.ipu"
              ],
            [t("instrumentScreens.general.labels.ipAddress")]: props
              .instrumentStatus.connected
              ? props.instrumentStatus.instrument.ipAddress
              : "",
          }}
        />
      </InstrumentPageRightPanel>
    </InstrumentPageRoot>
  );
}
