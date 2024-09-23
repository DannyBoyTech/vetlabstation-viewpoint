import {
  InstrumentStatusDto,
  ProCyteDxProcedure,
  ProCyteDxReagent,
} from "@viewpoint/api";
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
import { Trans } from "react-i18next";
import { InlineText } from "../../../../components/typography/InlineText";
import { ReactNode, useState } from "react";
import { ProCyteDxStartupModalBody } from "./ProCyteDxStartupModalBody";
import { ProCyteDxShutDownForShippingWizard } from "./ProCyteDxShutDownForShippingWizard";
import {
  useReplenishProCyteDxReagentMutation,
  useRequestProCyteDxProcedureMutation,
} from "../../../../api/ProCyteDxApi";
import {
  DiagnosticsPageContentHeader,
  DiagnosticsSection,
  DiagnosticsSectionContainer,
} from "../../common/diagnostics/common-diagnostics-screen-components";

import { ConfirmModal } from "../../../../components/confirm-modal/ConfirmModal";

const TestId = {
  mainContent: "main-content",
  autoRinseLink: "auto-rinse-link",
  monthlyRinseLink: "monthly-rinse-link",
  wasteChamberRinseLink: "waste-chamber-rinse-link",
  flowCellRinseLink: "flow-cell-rinse-link",
  drainReactionChamberLink: "drain-reaction-chamber-link",
  drainRBCIsolationChamberLink: "drain-rbc-isolation-chamber-link",
  drainWasteChamberLink: "drain-waste-chamber-link",
  removeClogLink: "remove-clog-link",
  clearPinchValveLink: "remove-clog-link",
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
  startupLink: "startup-link",
  shutdownForShippingLink: "shutdown-for-shipping-link",
  backButton: "back-button",
  reactionChamberModal: "reaction-chamber-modal",
  rbcIsolationModal: "rbc-isolation-modal",
  autoRinseModal: "auto-rinse-modal",
  wasteChamberModal: "waste-chamber-modal",
  removeClogModal: "remove-clog-modal",
  clearPinchModal: "clear-pinch-modal",
  resetAirModal: "reset-air-modal",
  resetAspirationModal: "reset-aspiration-modal",
  resetSheathModal: "reset-sheath-modal",
  resetTubeModal: "reset-tube-modal",
  resetWbModal: "reset-wb-modal",
  replenishStainModal: "replenish-stain-modal",
  replenishLyticModal: "replenish-lytic-modal",
  replenishReticulocyteModal: "replenish-reticulocyte-modal",
  replenishHgbModal: "replenish-hgb-modal",
  replenishSystemModal: "replenish-system-modal",
} as const;

const ActionKeyTypeList = {
  procedure: "procedure",
  reagent: "reagent",
} as const;

const ActionDurationMessageKey = {
  actionWillTakeApproximatelyDuration:
    "general.messages.actionWillTakeApproximatelyDuration",
  actionWillTakeLessThanDuration:
    "general.messages.actionWillTakeLessThanDuration",
} as const;

interface ProCyteDxDiagnosticsScreenProps {
  instrument: InstrumentStatusDto;
}

const StyledDiagnosticSection = styled(DiagnosticsSection)`
  max-width: 240px;
`;

const DurationMessage = (props: { children: ReactNode }) => {
  return <InlineText {...props} level="paragraph" bold />;
};

const startupModalComponents = {
  linebreak: (
    <>
      <br />
      <br />
    </>
  ),
  strong: <InlineText level="paragraph" bold />,
};

const ProCyteDxDiagnosticsScreen = ({
  instrument: instrumentStatus,
}: ProCyteDxDiagnosticsScreenProps) => {
  const { t } = useTranslation();
  const nav = useNavigate();

  const [requestProcedure] = useRequestProCyteDxProcedureMutation();
  const [replenishReagent] = useReplenishProCyteDxReagentMutation();

  const [showShutdownWizard, setShowShutdownWizard] = useState(false);

  const instrumentId = instrumentStatus.instrument.id;

  interface ModalActionProps {
    headerContentKey?: string;
    duration?: number;
    durationType?: string;
    procedure?: ProCyteDxProcedure;
    reagent?: ProCyteDxReagent;
    dataTestId?: string;
  }

  const modalActions: Record<string, ModalActionProps> = {
    autoRinse: {
      headerContentKey: "instrumentScreens.proCyteDx.maintenance.autoRinse",
      duration: 4,
      durationType:
        ActionDurationMessageKey.actionWillTakeApproximatelyDuration,
      procedure: ProCyteDxProcedure.AUTO_RINSE_REQUEST,
      dataTestId: TestId.autoRinseModal,
    },
    monthlyRinse: {
      procedure: ProCyteDxProcedure.MONTHLY_RINSE_REQUEST,
    },
    wasteChamberRinse: {
      procedure: ProCyteDxProcedure.RINSE_WASTE_CHAMBER_REQUEST,
    },
    flowCellRinse: {
      procedure: ProCyteDxProcedure.RINSE_FLOWCELL_REQUEST,
    },
    drainReactionChamber: {
      headerContentKey:
        "instrumentScreens.proCyteDx.maintenance.drainReactionChamber",
      duration: 1,
      durationType: ActionDurationMessageKey.actionWillTakeLessThanDuration,
      procedure: ProCyteDxProcedure.DRAIN_REACTION_CHAMBER_REQUEST,
      dataTestId: TestId.reactionChamberModal,
    },
    drainRBCIsolationChamber: {
      headerContentKey:
        "instrumentScreens.proCyteDx.maintenance.drainRBCIsolationChamber",
      duration: 3,
      durationType:
        ActionDurationMessageKey.actionWillTakeApproximatelyDuration,
      procedure: ProCyteDxProcedure.DRAIN_RBC_ISOLATION_CHAMBER_REQUEST,
      dataTestId: TestId.rbcIsolationModal,
    },
    drainWasteChamber: {
      headerContentKey:
        "instrumentScreens.proCyteDx.maintenance.drainWasteChamber",
      duration: 1,
      durationType: ActionDurationMessageKey.actionWillTakeLessThanDuration,
      procedure: ProCyteDxProcedure.DRAIN_WASTE_FLUID_REQUEST,
      dataTestId: TestId.wasteChamberModal,
    },
    removeClog: {
      headerContentKey: "instrumentScreens.proCyteDx.maintenance.removeClog",
      duration: 1,
      durationType:
        ActionDurationMessageKey.actionWillTakeApproximatelyDuration,
      procedure: ProCyteDxProcedure.REMOVE_CLOGS_REQUEST,
      dataTestId: TestId.removeClogModal,
    },
    clearPinchValve: {
      headerContentKey:
        "instrumentScreens.proCyteDx.maintenance.clearPinchValve",
      duration: 1,
      durationType: ActionDurationMessageKey.actionWillTakeLessThanDuration,
      procedure: ProCyteDxProcedure.PINCH_VALVE_REQUEST,
      dataTestId: TestId.clearPinchModal,
    },
    resetAirPump: {
      headerContentKey: "instrumentScreens.proCyteDx.maintenance.resetAirPump",
      duration: 1,
      durationType: ActionDurationMessageKey.actionWillTakeLessThanDuration,
      procedure: ProCyteDxProcedure.AIR_PUMP_REQUEST,
      dataTestId: TestId.resetAirModal,
    },
    resetAspirationMotor: {
      headerContentKey:
        "instrumentScreens.proCyteDx.maintenance.resetAspirationMotor",
      duration: 1,
      durationType: ActionDurationMessageKey.actionWillTakeLessThanDuration,
      procedure: ProCyteDxProcedure.ASPIRATION_UNIT_MOTOR_REQUEST,
      dataTestId: TestId.resetAspirationModal,
    },
    resetSheathMotor: {
      headerContentKey:
        "instrumentScreens.proCyteDx.maintenance.resetSheathMotor",
      duration: 1,
      durationType: ActionDurationMessageKey.actionWillTakeLessThanDuration,
      procedure: ProCyteDxProcedure.SHEATH_MOTOR_REQUEST,
      dataTestId: TestId.resetSheathModal,
    },
    resetTubeMotor: {
      headerContentKey:
        "instrumentScreens.proCyteDx.maintenance.resetTubeMotor",
      duration: 1,
      durationType: ActionDurationMessageKey.actionWillTakeLessThanDuration,
      procedure: ProCyteDxProcedure.TUBE_HOLDER_MOTOR_REQUEST,
      dataTestId: TestId.resetTubeModal,
    },
    resetWBMotor: {
      headerContentKey: "instrumentScreens.proCyteDx.maintenance.resetWBMotor",
      duration: 1,
      durationType: ActionDurationMessageKey.actionWillTakeLessThanDuration,
      procedure: ProCyteDxProcedure.WB_MOTOR_REQUEST,
      dataTestId: TestId.resetWbModal,
    },
    stain: {
      headerContentKey:
        "instrumentScreens.proCyteDx.maintenance.replenishStain",
      duration: 4,
      durationType:
        ActionDurationMessageKey.actionWillTakeApproximatelyDuration,
      reagent: ProCyteDxReagent.FFS,
      dataTestId: TestId.replenishStainModal,
    },
    lyticReagent: {
      headerContentKey:
        "instrumentScreens.proCyteDx.maintenance.replenishLyticReagent",
      duration: 2,
      durationType:
        ActionDurationMessageKey.actionWillTakeApproximatelyDuration,
      reagent: ProCyteDxReagent.FFD,
      dataTestId: TestId.replenishLyticModal,
    },
    reticulocyteDiluent: {
      headerContentKey:
        "instrumentScreens.proCyteDx.maintenance.replenishReticulocyteDiluent",
      duration: 2,
      durationType:
        ActionDurationMessageKey.actionWillTakeApproximatelyDuration,
      reagent: ProCyteDxReagent.RED,
      dataTestId: TestId.replenishReticulocyteModal,
    },
    hgbReagent: {
      headerContentKey:
        "instrumentScreens.proCyteDx.maintenance.replenishHGBReagent",
      duration: 2,
      durationType:
        ActionDurationMessageKey.actionWillTakeApproximatelyDuration,
      reagent: ProCyteDxReagent.SLS,
      dataTestId: TestId.replenishHgbModal,
    },
    systemDiluent: {
      headerContentKey:
        "instrumentScreens.proCyteDx.maintenance.replenishSystemDiluent",
      duration: 4,
      durationType:
        ActionDurationMessageKey.actionWillTakeApproximatelyDuration,
      reagent: ProCyteDxReagent.EPK,
      dataTestId: TestId.replenishSystemModal,
    },
  };

  const handleMonthlyRinse = () =>
    requestProcedure({
      instrumentId,
      procedure: ProCyteDxProcedure.MONTHLY_RINSE_REQUEST,
    });

  const handleWasteChamberRinse = () =>
    requestProcedure({
      instrumentId,
      procedure: ProCyteDxProcedure.RINSE_WASTE_CHAMBER_REQUEST,
    });

  const handleFlowCellRinse = () =>
    requestProcedure({
      instrumentId,
      procedure: ProCyteDxProcedure.RINSE_FLOWCELL_REQUEST,
    });

  const [modalState, setModalState] = useState<{
    open: boolean;
    headerContent: string;
    dataTestId?: string;
    duration?: number;
    durationType?: string;
    procedure?: ProCyteDxProcedure;
    reagent?: ProCyteDxReagent;
    actionKeyType: string;
  }>();

  const handleOpenModal = async (
    actionKey: keyof typeof modalActions,
    actionKeyType: string
  ) => {
    const action = modalActions[actionKey];

    setModalState({
      open: true,
      headerContent: action.headerContentKey
        ? t(action.headerContentKey as any)
        : "",
      dataTestId: action.dataTestId,
      duration: action.duration,
      durationType: action.durationType,
      procedure: action.procedure || undefined,
      reagent: action.reagent || undefined,
      actionKeyType: actionKeyType,
    });
  };

  const handleModalConfirm = async () => {
    if (modalState) {
      if (
        modalState.actionKeyType == ActionKeyTypeList.procedure &&
        modalState.procedure
      ) {
        await requestProcedure({
          instrumentId,
          procedure: modalState.procedure,
        });
      }
      if (
        modalState.actionKeyType == ActionKeyTypeList.reagent &&
        modalState.reagent
      ) {
        await replenishReagent({
          instrumentId,
          reagent: modalState.reagent,
        });
      }
      setModalState(undefined);

      if (
        modalState.headerContent ==
        t(modalActions.autoRinse.headerContentKey as any)
      ) {
        return;
      }
      nav("../", { relative: "path" });
    }
  };

  const [modalStartupState, setModalStartupState] = useState<{
    open: boolean;
    nextState: boolean;
  } | null>(null);

  const handleStartup = () => {
    setModalStartupState({
      open: true,
      nextState: false,
    });
  };

  const handleModalStartupConfirm = async () => {
    if (modalStartupState) {
      if (modalStartupState.nextState) {
        await requestProcedure({
          instrumentId,
          procedure: ProCyteDxProcedure.SETTING_SEQUENCE_REQUEST,
        });
        nav("../", { relative: "path" });
      } else {
        setModalStartupState({
          open: true,
          nextState: true,
        });
      }
    }
  };

  const handleShutdownForShipping = () => setShowShutdownWizard(true);
  const handleShutdownCancel = () => setShowShutdownWizard(false);
  const handleShutdownConfirm = () => {
    setShowShutdownWizard(false);
    requestProcedure({
      instrumentId,
      procedure: ProCyteDxProcedure.SHUTDOWN_FOR_SHIPPING,
    });
    nav("../", { relative: "path" });
  };

  return (
    <InstrumentPageRoot>
      <InstrumentPageContent
        data-testid={TestId.mainContent}
        className="mainContent"
      >
        <DiagnosticsPageContentHeader level="h3">
          {t("instrumentScreens.proCyteDx.maintenance.diagnostics")}
        </DiagnosticsPageContentHeader>
        <DiagnosticsSectionContainer className="sectionContainer">
          <StyledDiagnosticSection className="section">
            <SpotText level="paragraph" bold>
              {t("instrumentScreens.proCyteDx.maintenance.rinse")}
            </SpotText>
            <ul>
              <li>
                <Link
                  onClick={() =>
                    handleOpenModal("autoRinse", ActionKeyTypeList.procedure)
                  }
                  data-testid={TestId.autoRinseLink}
                >
                  {t("instrumentScreens.proCyteDx.maintenance.autoRinse")}
                </Link>
              </li>
              <li>
                <Link
                  onClick={handleFlowCellRinse}
                  data-test={TestId.flowCellRinseLink}
                >
                  {t("instrumentScreens.proCyteDx.maintenance.flowCellRinse")}
                </Link>
              </li>
              <li>
                <Link
                  onClick={handleMonthlyRinse}
                  data-test={TestId.monthlyRinseLink}
                >
                  {t("instrumentScreens.proCyteDx.maintenance.monthlyRinse")}
                </Link>
              </li>
              <li>
                <Link
                  onClick={handleWasteChamberRinse}
                  data-test={TestId.wasteChamberRinseLink}
                >
                  {t(
                    "instrumentScreens.proCyteDx.maintenance.wasteChamberRinse"
                  )}
                </Link>
              </li>
            </ul>
          </StyledDiagnosticSection>
          <StyledDiagnosticSection>
            <SpotText level="paragraph" bold>
              {t("instrumentScreens.proCyteDx.maintenance.drain")}
            </SpotText>
            <ul>
              <li>
                <Link
                  onClick={() =>
                    handleOpenModal(
                      "drainRBCIsolationChamber",
                      ActionKeyTypeList.procedure
                    )
                  }
                  data-testid={TestId.drainRBCIsolationChamberLink}
                >
                  {t(
                    "instrumentScreens.proCyteDx.maintenance.drainRBCIsolationChamber"
                  )}
                </Link>
              </li>
              <li>
                <Link
                  onClick={() =>
                    handleOpenModal(
                      "drainReactionChamber",
                      ActionKeyTypeList.procedure
                    )
                  }
                  data-testid={TestId.drainReactionChamberLink}
                >
                  {t(
                    "instrumentScreens.proCyteDx.maintenance.drainReactionChamber"
                  )}
                </Link>
              </li>
              <li>
                <Link
                  onClick={() =>
                    handleOpenModal(
                      "drainWasteChamber",
                      ActionKeyTypeList.procedure
                    )
                  }
                  data-testid={TestId.drainWasteChamberLink}
                >
                  {t(
                    "instrumentScreens.proCyteDx.maintenance.drainWasteChamber"
                  )}
                </Link>
              </li>
            </ul>
          </StyledDiagnosticSection>
          <StyledDiagnosticSection>
            <SpotText level="paragraph" bold>
              {t("instrumentScreens.proCyteDx.maintenance.removeClear")}
            </SpotText>
            <ul>
              <li>
                <Link
                  onClick={() =>
                    handleOpenModal(
                      "clearPinchValve",
                      ActionKeyTypeList.procedure
                    )
                  }
                  data-testid={TestId.clearPinchValveLink}
                >
                  {t("instrumentScreens.proCyteDx.maintenance.clearPinchValve")}
                </Link>
              </li>
              <li>
                <Link
                  onClick={() =>
                    handleOpenModal("removeClog", ActionKeyTypeList.procedure)
                  }
                  data-testid={TestId.removeClogLink}
                >
                  {t("instrumentScreens.proCyteDx.maintenance.removeClog")}
                </Link>
              </li>
            </ul>
          </StyledDiagnosticSection>
          <StyledDiagnosticSection>
            <SpotText level="paragraph" bold>
              {t("instrumentScreens.proCyteDx.maintenance.reset")}
            </SpotText>
            <ul>
              <li>
                <Link
                  onClick={() =>
                    handleOpenModal("resetAirPump", ActionKeyTypeList.procedure)
                  }
                  data-testid={TestId.resetAirPumpLink}
                >
                  {t("instrumentScreens.proCyteDx.maintenance.resetAirPump")}
                </Link>
              </li>
              <li>
                <Link
                  onClick={() =>
                    handleOpenModal(
                      "resetAspirationMotor",
                      ActionKeyTypeList.procedure
                    )
                  }
                  data-testid={TestId.resetAspirationMotorLink}
                >
                  {t(
                    "instrumentScreens.proCyteDx.maintenance.resetAspirationMotor"
                  )}
                </Link>
              </li>
              <li>
                <Link
                  onClick={() =>
                    handleOpenModal(
                      "resetSheathMotor",
                      ActionKeyTypeList.procedure
                    )
                  }
                  data-testid={TestId.resetSheathMotorLink}
                >
                  {t(
                    "instrumentScreens.proCyteDx.maintenance.resetSheathMotor"
                  )}
                </Link>
              </li>
              <li>
                <Link
                  onClick={() =>
                    handleOpenModal(
                      "resetTubeMotor",
                      ActionKeyTypeList.procedure
                    )
                  }
                  data-testid={TestId.resetTubeMotorLink}
                >
                  {t("instrumentScreens.proCyteDx.maintenance.resetTubeMotor")}
                </Link>
              </li>
              <li>
                <Link
                  onClick={() =>
                    handleOpenModal("resetWBMotor", ActionKeyTypeList.procedure)
                  }
                  data-testid={TestId.resetWBMotorLink}
                >
                  {t("instrumentScreens.proCyteDx.maintenance.resetWBMotor")}
                </Link>
              </li>
            </ul>
          </StyledDiagnosticSection>
          <StyledDiagnosticSection>
            <SpotText level="paragraph" bold>
              {t("instrumentScreens.proCyteDx.maintenance.replenish")}
            </SpotText>
            <ul>
              <li>
                <Link
                  onClick={() =>
                    handleOpenModal("hgbReagent", ActionKeyTypeList.reagent)
                  }
                  data-testid={TestId.HGBReagentLink}
                >
                  {t(
                    "instrumentScreens.proCyteDx.maintenance.replenishHGBReagent"
                  )}
                </Link>
              </li>
              <li>
                <Link
                  onClick={() =>
                    handleOpenModal("lyticReagent", ActionKeyTypeList.reagent)
                  }
                  data-testid={TestId.lyticReagentLink}
                >
                  {t(
                    "instrumentScreens.proCyteDx.maintenance.replenishLyticReagent"
                  )}
                </Link>
              </li>
              <li>
                <Link
                  onClick={() =>
                    handleOpenModal(
                      "reticulocyteDiluent",
                      ActionKeyTypeList.reagent
                    )
                  }
                  data-testid={TestId.reticulocyteDiluentLink}
                >
                  {t(
                    "instrumentScreens.proCyteDx.maintenance.replenishReticulocyteDiluent"
                  )}
                </Link>
              </li>
              <li>
                <Link
                  onClick={() =>
                    handleOpenModal("stain", ActionKeyTypeList.reagent)
                  }
                  data-testid={TestId.stainLink}
                >
                  {t("instrumentScreens.proCyteDx.maintenance.replenishStain")}
                </Link>
              </li>
              <li>
                <Link
                  onClick={() =>
                    handleOpenModal("systemDiluent", ActionKeyTypeList.reagent)
                  }
                  data-testid={TestId.systemDiluentLink}
                >
                  {t(
                    "instrumentScreens.proCyteDx.maintenance.replenishSystemDiluent"
                  )}
                </Link>
              </li>
            </ul>
          </StyledDiagnosticSection>
          <StyledDiagnosticSection>
            <SpotText level="paragraph" bold>
              {t("instrumentScreens.proCyteDx.maintenance.initialize")}
            </SpotText>
            <ul>
              <li>
                <Link onClick={handleStartup} data-testid={TestId.startupLink}>
                  {t("instrumentScreens.proCyteDx.maintenance.startup")}
                </Link>
              </li>
            </ul>
          </StyledDiagnosticSection>
          <StyledDiagnosticSection>
            <SpotText level="paragraph" bold>
              {t("instrumentScreens.proCyteDx.maintenance.ship")}
            </SpotText>
            <ul>
              <li>
                <Link
                  onClick={handleShutdownForShipping}
                  data-testid={TestId.shutdownForShippingLink}
                >
                  {t(
                    "instrumentScreens.proCyteDx.maintenance.shutdownForShipping"
                  )}
                </Link>
                {showShutdownWizard && (
                  <ProCyteDxShutDownForShippingWizard
                    onCancel={handleShutdownCancel}
                    onDone={handleShutdownConfirm}
                  />
                )}
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
          onClose={() => setModalState(undefined)}
          onConfirm={handleModalConfirm}
          {...(modalState.dataTestId && {
            "data-testid": modalState.dataTestId,
          })}
        />
      )}

      {modalStartupState?.open && (
        <ConfirmModal
          open={true}
          headerContent={t("instrumentScreens.proCyteDx.maintenance.startup")}
          bodyContent={
            modalStartupState.nextState == false ? (
              <Trans
                i18nKey="instrumentScreens.proCyteDx.startupModal.content"
                components={startupModalComponents}
              />
            ) : (
              <ProCyteDxStartupModalBody />
            )
          }
          cancelButtonContent={t("general.buttons.cancel")}
          confirmButtonContent={
            modalStartupState.nextState == false
              ? t("general.buttons.continue")
              : t(
                  "instrumentScreens.proCyteDx.startupConfirmModal.initiateStartup"
                )
          }
          onClose={() => setModalStartupState(null)}
          onConfirm={handleModalStartupConfirm}
        />
      )}

      <InstrumentPageRightPanel data-testid="pdx-diagnostics-page-right">
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

export { ProCyteDxDiagnosticsScreen };
