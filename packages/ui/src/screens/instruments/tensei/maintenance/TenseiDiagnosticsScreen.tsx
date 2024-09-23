import { InstrumentStatusDto } from "@viewpoint/api";
import { Button, Link, SpotText } from "@viewpoint/spot-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import {
  InstrumentPageContent,
  InstrumentPageRightPanel,
  InstrumentPageRightPanelButtonContainer,
  InstrumentPageRoot,
} from "../../common-components";
import { ReactNode, useState } from "react";
import { InlineText } from "../../../../components/typography/InlineText";
import {
  useRequestDrainRbcIsolationChamberMutation,
  useRequestDrainReactionChamberMutation,
  useRequestDrainWasteChamberMutation,
  useRequestAutoRinseMutation,
  useRequestMonthlyRinseMutation,
  useRequestFlowCellRinseMutation,
  useRequestWasteChamberRinseMutation,
  useRequestClearPinchValveMutation,
  useRequestRemoveClogMutation,
  useRequestResetAirPumpMutation,
  useRequestResetAspirationMotorMutation,
  useRequestResetSheathMotorMutation,
  useRequestResetTubeMotorMutation,
  useRequestResetWBMotorMutation,
  useRequestReplenishLyticReagentMutation,
  useRequestReplenishStainMutation,
  useRequestReplenishReticulocyteDiluentMutation,
  useRequestReplenishHGBReagentMutation,
  useRequestReplenishSystemDiluentMutation,
} from "../../../../api/TenseiApi";

import { ConfirmModal } from "../../../../components/confirm-modal/ConfirmModal";
import {
  DiagnosticsPageContentHeader,
  DiagnosticsSection,
  DiagnosticsSectionContainer,
} from "../../common/diagnostics/common-diagnostics-screen-components";

const TestId = {
  mainContent: "main-content",
  drainReactionChamberLink: "drain-reaction-chamber-link",
  drainRBCIsolationChamberLink: "drain-rbc-isolation-chamber-link",
  drainWasteChamberLink: "drain-waste-chamber-link",
  autoRinseLink: "auto-rinse-link",
  flowCellRinseLink: "flow-cell-rinse-link",
  monthlyRinseLink: "monthly-rinse-link",
  wasteChamberRinseLink: "waste-chamber-rinse-link",
  clearPinchValveLink: "clear-pinch-valve-link",
  removeClogLink: "remove-clog-link",
  resetAirPumpLink: "reset-air-pump-link",
  resetAspirationMotorLink: "reset-aspiration-motor-link",
  resetSheathMotorLink: "reset-sheath-motor-link",
  resetTubeMotorLink: "reset-tube-motor-link",
  resetWBMotorLink: "reset-wb-motor-link",
  stainLink: "stain-link",
  lyticReagentLink: "lytic-reagent-link",
  reticulocyteDiluentLink: "reticulocyte-diluent-link",
  HGBReagentLink: "hgb-reagent-link",
  systemDiluentLink: "system-diluent-link",
  backButton: "back-button",
  reactionChamberModal: "reaction-chamber-modal",
  rbcIsolationModal: "rbc-isolation-modal",
  wasteChamberModal: "waste-chamber-modal",
  autoRinseModal: "auto-rinse-modal",
  clearPinchValveModal: "clear-pinch-valve-modal",
  removeClogModal: "remove-clog-modal",
  resetAirPumpModal: "reset-air-pump-modal",
  resetAspirationMotorModal: "reset-aspiration-motor-modal",
  resetSheathMotorModal: "reset-sheath-motor-modal",
  resetTubeMotorModal: "reset-tube-motor-modal",
  resetWBMotorModal: "reset-wb-motor-modal",
  replenishStainModal: "replenish-stain-modal",
  replenishLyticReagentModal: "replenish-lytic-modal",
  replenishReticulocyteDiluentModal: "replenish-reticulocyte-modal",
  replenishHGBReagentModal: "replenish-hgb-modal",
  replenishSystemDiluentModal: "replenish-system-modal",
} as const;

const ActionDurationMessageKey = {
  actionWillTakeApproximatelyDuration:
    "general.messages.actionWillTakeApproximatelyDuration",
  actionWillTakeLessThanDuration:
    "general.messages.actionWillTakeLessThanDuration",
} as const;

const StyledDiagnosticSection = styled(DiagnosticsSection)`
  max-width: 240px;
`;

const DurationMessage = (props: { children: ReactNode }) => {
  return <InlineText {...props} level="paragraph" bold />;
};

interface TenseiDiagnosticsScreenProps {
  instrument: InstrumentStatusDto;
}
const TenseiDiagnosticsScreen = ({
  instrument: instrumentStatus,
}: TenseiDiagnosticsScreenProps) => {
  const { t } = useTranslation();
  const nav = useNavigate();

  const [requestDrainReactionChamber] =
    useRequestDrainReactionChamberMutation();
  const [requestDrainRbcIsolationChamber] =
    useRequestDrainRbcIsolationChamberMutation();
  const [requestDrainWasteChamber] = useRequestDrainWasteChamberMutation();
  const [requestAutoRinse] = useRequestAutoRinseMutation();
  const [requestMonthlyRinse] = useRequestMonthlyRinseMutation();
  const [requestFlowCellRinse] = useRequestFlowCellRinseMutation();
  const [requestWasteChamberRinse] = useRequestWasteChamberRinseMutation();
  const [requestClearPinchValve] = useRequestClearPinchValveMutation();
  const [requestRemoveClog] = useRequestRemoveClogMutation();
  const [requestResetAirPump] = useRequestResetAirPumpMutation();
  const [requestResetAspirationMotor] =
    useRequestResetAspirationMotorMutation();
  const [requestResetSheathMotor] = useRequestResetSheathMotorMutation();
  const [requestResetTubeMotor] = useRequestResetTubeMotorMutation();
  const [requestResetWBMotor] = useRequestResetWBMotorMutation();

  const [requestReplenishLyticReagent] =
    useRequestReplenishLyticReagentMutation();
  const [requestReplenishStain] = useRequestReplenishStainMutation();
  const [requestReplenishReticulocyteDiluent] =
    useRequestReplenishReticulocyteDiluentMutation();
  const [requestReplenishHGBReagent] = useRequestReplenishHGBReagentMutation();
  const [requestReplenishSystemDiluent] =
    useRequestReplenishSystemDiluentMutation();

  const instrumentId = instrumentStatus.instrument.id;

  const modalActions: Record<
    string,
    {
      headerContentKey: string;
      duration: number;
      durationType: string;
      apiFunc: (instrumentId: number) => unknown;
      dataTestId: string;
    }
  > = {
    autoRinse: {
      headerContentKey: "instrumentScreens.tensei.maintenance.autoRinse",
      duration: 4,
      durationType:
        ActionDurationMessageKey.actionWillTakeApproximatelyDuration,
      apiFunc: requestAutoRinse,
      dataTestId: TestId.autoRinseModal,
    },
    drainReactionChamber: {
      headerContentKey:
        "instrumentScreens.tensei.maintenance.drainReactionChamber",
      duration: 1,
      durationType: ActionDurationMessageKey.actionWillTakeLessThanDuration,
      apiFunc: requestDrainReactionChamber,
      dataTestId: TestId.reactionChamberModal,
    },
    drainRBCIsolationChamber: {
      headerContentKey:
        "instrumentScreens.tensei.maintenance.drainRBCIsolationChamber",
      duration: 3,
      durationType:
        ActionDurationMessageKey.actionWillTakeApproximatelyDuration,
      apiFunc: requestDrainRbcIsolationChamber,
      dataTestId: TestId.rbcIsolationModal,
    },
    drainWasteChamber: {
      headerContentKey:
        "instrumentScreens.tensei.maintenance.drainWasteChamber",
      duration: 1,
      durationType: ActionDurationMessageKey.actionWillTakeLessThanDuration,
      apiFunc: requestDrainWasteChamber,
      dataTestId: TestId.wasteChamberModal,
    },
    removeClog: {
      headerContentKey: "instrumentScreens.tensei.maintenance.removeClog",
      duration: 1,
      durationType:
        ActionDurationMessageKey.actionWillTakeApproximatelyDuration,
      apiFunc: requestRemoveClog,
      dataTestId: TestId.removeClogModal,
    },
    clearPinchValve: {
      headerContentKey: "instrumentScreens.tensei.maintenance.clearPinchValve",
      duration: 1,
      durationType: ActionDurationMessageKey.actionWillTakeLessThanDuration,
      apiFunc: requestClearPinchValve,
      dataTestId: TestId.clearPinchValveModal,
    },
    resetAirPump: {
      headerContentKey: "instrumentScreens.tensei.maintenance.resetAirPump",
      duration: 1,
      durationType: ActionDurationMessageKey.actionWillTakeLessThanDuration,
      apiFunc: requestResetAirPump,
      dataTestId: TestId.resetAirPumpModal,
    },
    resetAspirationMotor: {
      headerContentKey:
        "instrumentScreens.tensei.maintenance.resetAspirationMotor",
      duration: 1,
      durationType: ActionDurationMessageKey.actionWillTakeLessThanDuration,
      apiFunc: requestResetAspirationMotor,
      dataTestId: TestId.resetAspirationMotorModal,
    },
    resetSheathMotor: {
      headerContentKey: "instrumentScreens.tensei.maintenance.resetSheathMotor",
      duration: 1,
      durationType: ActionDurationMessageKey.actionWillTakeLessThanDuration,
      apiFunc: requestResetSheathMotor,
      dataTestId: TestId.resetSheathMotorModal,
    },
    resetTubeMotor: {
      headerContentKey: "instrumentScreens.tensei.maintenance.resetTubeMotor",
      duration: 1,
      durationType: ActionDurationMessageKey.actionWillTakeLessThanDuration,
      apiFunc: requestResetTubeMotor,
      dataTestId: TestId.resetTubeMotorModal,
    },
    resetWBMotor: {
      headerContentKey: "instrumentScreens.tensei.maintenance.resetWBMotor",
      duration: 1,
      durationType: ActionDurationMessageKey.actionWillTakeLessThanDuration,
      apiFunc: requestResetWBMotor,
      dataTestId: TestId.resetWBMotorModal,
    },
    replenishStain: {
      headerContentKey: "instrumentScreens.tensei.maintenance.replenishStain",
      duration: 4,
      durationType:
        ActionDurationMessageKey.actionWillTakeApproximatelyDuration,
      apiFunc: requestReplenishStain,
      dataTestId: TestId.replenishStainModal,
    },
    replenishLyticReagent: {
      headerContentKey:
        "instrumentScreens.tensei.maintenance.replenishLyticReagent",
      duration: 2,
      durationType:
        ActionDurationMessageKey.actionWillTakeApproximatelyDuration,
      apiFunc: requestReplenishLyticReagent,
      dataTestId: TestId.replenishLyticReagentModal,
    },
    replenishReticulocyteDiluent: {
      headerContentKey:
        "instrumentScreens.tensei.maintenance.replenishReticulocyteDiluent",
      duration: 2,
      durationType:
        ActionDurationMessageKey.actionWillTakeApproximatelyDuration,
      apiFunc: requestReplenishReticulocyteDiluent,
      dataTestId: TestId.replenishReticulocyteDiluentModal,
    },
    replenishHGBReagent: {
      headerContentKey:
        "instrumentScreens.tensei.maintenance.replenishHGBReagent",
      duration: 2,
      durationType:
        ActionDurationMessageKey.actionWillTakeApproximatelyDuration,
      apiFunc: requestReplenishHGBReagent,
      dataTestId: TestId.replenishHGBReagentModal,
    },
    replenishSystemDiluent: {
      headerContentKey:
        "instrumentScreens.tensei.maintenance.replenishSystemDiluent",
      duration: 4,
      durationType:
        ActionDurationMessageKey.actionWillTakeApproximatelyDuration,
      apiFunc: requestReplenishSystemDiluent,
      dataTestId: TestId.replenishSystemDiluentModal,
    },
  };

  const handleMonthlyRinse = () => {
    requestMonthlyRinse(instrumentId);
  };

  const handleWasteChamberRinse = () => {
    requestWasteChamberRinse(instrumentId);
  };
  const handleFlowCellRinse = () => {
    requestFlowCellRinse(instrumentId);
  };

  const [modalState, setModalState] = useState<{
    open: boolean;
    headerContent: string;
    dataTestId: string;
    duration: number;
    durationType: string;
    apiFunc: (instrumentId: number) => unknown;
  } | null>(null);

  const handleOpenModal = (actionKey: keyof typeof modalActions) => {
    const action = modalActions[actionKey];
    setModalState({
      open: true,
      headerContent: action.headerContentKey
        ? t(action.headerContentKey as any)
        : "",
      dataTestId: action.dataTestId,
      duration: action.duration,
      durationType: action.durationType,
      apiFunc: action.apiFunc,
    });
  };

  const handleModalConfirm = async () => {
    if (modalState) {
      await modalState.apiFunc(instrumentId);
      if (modalState.headerContent == modalActions.autoRinse.headerContentKey) {
        return;
      }
      setModalState(null);
      nav("../", { relative: "path" });
    }
  };

  return (
    <InstrumentPageRoot>
      <InstrumentPageContent
        data-testid={TestId.mainContent}
        className="mainContent"
      >
        <DiagnosticsPageContentHeader level="h3">
          {t("instrumentScreens.tensei.maintenance.diagnostics")}
        </DiagnosticsPageContentHeader>
        <DiagnosticsSectionContainer className="sectionContainer">
          <StyledDiagnosticSection className="section">
            <SpotText level="paragraph" bold>
              {t("instrumentScreens.tensei.maintenance.rinse")}
            </SpotText>
            <ul>
              <li>
                <Link
                  onClick={() => handleOpenModal("autoRinse")}
                  data-testid={TestId.autoRinseLink}
                >
                  {t("instrumentScreens.tensei.maintenance.autoRinse")}
                </Link>
              </li>
              <li>
                <Link
                  onClick={handleFlowCellRinse}
                  data-testid={TestId.flowCellRinseLink}
                >
                  {t("instrumentScreens.tensei.maintenance.flowCellRinse")}
                </Link>
              </li>
              <li>
                <Link
                  onClick={handleMonthlyRinse}
                  data-testid={TestId.monthlyRinseLink}
                >
                  {t("instrumentScreens.tensei.maintenance.monthlyRinse")}
                </Link>
              </li>
              <li>
                <Link
                  onClick={handleWasteChamberRinse}
                  data-testid={TestId.wasteChamberRinseLink}
                >
                  {t("instrumentScreens.tensei.maintenance.wasteChamberRinse")}
                </Link>
              </li>
            </ul>
          </StyledDiagnosticSection>
          <StyledDiagnosticSection>
            <SpotText level="paragraph" bold>
              {t("instrumentScreens.tensei.maintenance.drain")}
            </SpotText>
            <ul>
              <li>
                <Link
                  onClick={() => handleOpenModal("drainRBCIsolationChamber")}
                  data-testid={TestId.drainRBCIsolationChamberLink}
                >
                  {t(
                    "instrumentScreens.tensei.maintenance.drainRBCIsolationChamber"
                  )}
                </Link>
              </li>
              <li>
                <Link
                  onClick={() => handleOpenModal("drainReactionChamber")}
                  data-testid={TestId.drainReactionChamberLink}
                >
                  {t(
                    "instrumentScreens.tensei.maintenance.drainReactionChamber"
                  )}
                </Link>
              </li>
              <li>
                <Link
                  onClick={() => handleOpenModal("drainWasteChamber")}
                  data-testid={TestId.drainWasteChamberLink}
                >
                  {t("instrumentScreens.tensei.maintenance.drainWasteChamber")}
                </Link>
              </li>
            </ul>
          </StyledDiagnosticSection>
          <StyledDiagnosticSection>
            <SpotText level="paragraph" bold>
              {t("instrumentScreens.tensei.maintenance.removeClear")}
            </SpotText>
            <ul>
              <li>
                <Link
                  onClick={() => handleOpenModal("clearPinchValve")}
                  data-testid={TestId.clearPinchValveLink}
                >
                  {t("instrumentScreens.tensei.maintenance.clearPinchValve")}
                </Link>
              </li>
              <li>
                <Link
                  onClick={() => handleOpenModal("removeClog")}
                  data-testid={TestId.removeClogLink}
                >
                  {t("instrumentScreens.tensei.maintenance.removeClog")}
                </Link>
              </li>
            </ul>
          </StyledDiagnosticSection>
          <StyledDiagnosticSection>
            <SpotText level="paragraph" bold>
              {t("instrumentScreens.tensei.maintenance.reset")}
            </SpotText>
            <ul>
              <li>
                <Link
                  onClick={() => handleOpenModal("resetAirPump")}
                  data-testid={TestId.resetAirPumpLink}
                >
                  {t("instrumentScreens.tensei.maintenance.resetAirPump")}
                </Link>
              </li>
              <li>
                <Link
                  onClick={() => handleOpenModal("resetAspirationMotor")}
                  data-testid={TestId.resetAspirationMotorLink}
                >
                  {t(
                    "instrumentScreens.tensei.maintenance.resetAspirationMotor"
                  )}
                </Link>
              </li>
              <li>
                <Link
                  onClick={() => handleOpenModal("resetSheathMotor")}
                  data-testid={TestId.resetSheathMotorLink}
                >
                  {t("instrumentScreens.tensei.maintenance.resetSheathMotor")}
                </Link>
              </li>
              <li>
                <Link
                  onClick={() => handleOpenModal("resetTubeMotor")}
                  data-testid={TestId.resetTubeMotorLink}
                >
                  {t("instrumentScreens.tensei.maintenance.resetTubeMotor")}
                </Link>
              </li>
              <li>
                <Link
                  onClick={() => handleOpenModal("resetWBMotor")}
                  data-testid={TestId.resetWBMotorLink}
                >
                  {t("instrumentScreens.tensei.maintenance.resetWBMotor")}
                </Link>
              </li>
            </ul>
          </StyledDiagnosticSection>
          <StyledDiagnosticSection>
            <SpotText level="paragraph" bold>
              {t("instrumentScreens.tensei.maintenance.replenish")}
            </SpotText>
            <ul>
              <li>
                <Link
                  onClick={() => handleOpenModal("replenishHGBReagent")}
                  data-testid={TestId.HGBReagentLink}
                >
                  {t(
                    "instrumentScreens.tensei.maintenance.replenishHGBReagent"
                  )}
                </Link>
              </li>
              <li>
                <Link
                  onClick={() => handleOpenModal("replenishLyticReagent")}
                  data-testid={TestId.lyticReagentLink}
                >
                  {t(
                    "instrumentScreens.tensei.maintenance.replenishLyticReagent"
                  )}
                </Link>
              </li>
              <li>
                <Link
                  onClick={() =>
                    handleOpenModal("replenishReticulocyteDiluent")
                  }
                  data-testid={TestId.reticulocyteDiluentLink}
                >
                  {t(
                    "instrumentScreens.tensei.maintenance.replenishReticulocyteDiluent"
                  )}
                </Link>
              </li>
              <li>
                <Link
                  onClick={() => handleOpenModal("replenishStain")}
                  data-testid={TestId.stainLink}
                >
                  {t("instrumentScreens.tensei.maintenance.replenishStain")}
                </Link>
              </li>
              <li>
                <Link
                  onClick={() => handleOpenModal("replenishSystemDiluent")}
                  data-testid={TestId.systemDiluentLink}
                >
                  {t(
                    "instrumentScreens.tensei.maintenance.replenishSystemDiluent"
                  )}
                </Link>
              </li>
            </ul>
          </StyledDiagnosticSection>
          <StyledDiagnosticSection>
            <SpotText level="paragraph" bold>
              {t("instrumentScreens.tensei.maintenance.initialize")}
            </SpotText>
            <ul>
              <li>
                <Link>{t("instrumentScreens.tensei.maintenance.startup")}</Link>
              </li>
            </ul>
          </StyledDiagnosticSection>
          <StyledDiagnosticSection>
            <SpotText level="paragraph" bold>
              {t("instrumentScreens.tensei.maintenance.ship")}
            </SpotText>
            <ul>
              <li>
                <Link>
                  {t(
                    "instrumentScreens.tensei.maintenance.shutdownForShipping"
                  )}
                </Link>
              </li>
            </ul>
          </StyledDiagnosticSection>
        </DiagnosticsSectionContainer>
      </InstrumentPageContent>

      {modalState?.open && (
        <ConfirmModal
          open={true}
          headerContent={modalState.headerContent}
          bodyContent={
            <DurationMessage>
              {t(modalState.durationType as any, {
                action: t("general.ThisProcedure"),
                duration: t("general.duration.minute", {
                  count: modalState.duration,
                }),
              })}
            </DurationMessage>
          }
          confirmButtonContent={t("general.buttons.ok")}
          cancelButtonContent={t("general.buttons.cancel")}
          onClose={() => setModalState(null)}
          onConfirm={handleModalConfirm}
          data-testid={modalState.dataTestId}
        />
      )}

      <InstrumentPageRightPanel data-testid="tensei-diagnostics-page-right">
        <InstrumentPageRightPanelButtonContainer>
          <Button
            buttonType="secondary"
            onClick={() => nav(-1)}
            data-testid={TestId.backButton}
          >
            {t("general.buttons.back")}
          </Button>
        </InstrumentPageRightPanelButtonContainer>
      </InstrumentPageRightPanel>
    </InstrumentPageRoot>
  );
};

export { TenseiDiagnosticsScreen };
