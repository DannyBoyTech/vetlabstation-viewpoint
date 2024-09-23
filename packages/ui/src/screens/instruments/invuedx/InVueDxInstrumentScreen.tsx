import {
  InstrumentStatus,
  InstrumentStatusDto,
  MaintenanceProcedure,
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
import { Button } from "@viewpoint/spot-react";
import { useTranslation } from "react-i18next";
import {
  InstrumentInfo,
  TestId as InstrumentInfoTestId,
} from "../InstrumentInfo";
import { SpotText } from "@viewpoint/spot-react/src";
import { useNavigate } from "react-router-dom";
import { useExecuteMaintenanceProcedureMutation } from "../../../api/TheiaApi";
import { useConfirmModal } from "../../../components/global-modals/components/GlobalConfirmModal";
import { CancelProcessButton } from "../common/CancelProcessButton";

export const TestId = {
  QCButton: "invuedx-qc-button",
  MaintenanceButton: "invuedx-maintenance-button",
  DiagnosticsButton: "invuedx-diagnostics-button",
  SettingsButton: "invuedx-settings-button",
  PowerDownButton: "invuedx-powerdown-button",
  ModalPowerDown: "invuedx-modal-powerdown",
  ModalPowerDownButton: "invuedx-modal-powerdown-button",
  InstrumentPageRoot: "invuedx-instruments-screen",
  InstrumentPageContent: "invuedx-instruments-screen-content",
  InfoProperty: InstrumentInfoTestId.InfoProperty,
} as const;

export interface InVueDxInstrumentScreenProps {
  instrumentStatusDto: InstrumentStatusDto;
}

export function InVueDxInstrumentScreen(props: InVueDxInstrumentScreenProps) {
  const { t } = useTranslation();
  const nav = useNavigate();
  const { addConfirmModal } = useConfirmModal();
  const [executeMaintenanceProcedure] =
    useExecuteMaintenanceProcedureMutation();

  const instrumentName = t("instruments.names.THEIA");

  const handlePowerDownButton = () => {
    addConfirmModal({
      "data-testid": TestId.ModalPowerDown,
      dismissable: false,
      headerContent: (
        <SpotText level="h3">
          {t("instrumentScreens.common.powerDownModal.title", {
            instrumentName: instrumentName,
          })}
        </SpotText>
      ),
      bodyContent: t("instrumentScreens.common.powerDownModal.body", {
        instrumentName: instrumentName,
      }),
      onClose: () => {},
      onConfirm: () => {
        executeMaintenanceProcedure({
          instrumentId: instrumentDto.id,
          maintenanceProcedure: MaintenanceProcedure.SHUTDOWN,
        });
        nav("/");
      },
      cancelButtonContent: t("general.buttons.cancel"),
      confirmButtonContent: t("instrumentScreens.general.buttons.powerDown"),
    });
  };

  const instrumentStatusDto = props.instrumentStatusDto;
  const instrumentDto = instrumentStatusDto.instrument;
  const notConnected = !props.instrumentStatusDto.connected;

  return (
    <InstrumentPageRoot data-testid={TestId.InstrumentPageRoot}>
      <InstrumentPageContent data-testid={TestId.InstrumentPageContent}>
        <AnalyzerOverview
          instrument={instrumentStatusDto}
          offlineBodyContent={
            <GenericOfflineInstructions
              instrumentType={instrumentDto.instrumentType}
            />
          }
        />
      </InstrumentPageContent>
      <InstrumentPageRightPanel>
        <InstrumentPageRightPanelButtonContainer>
          <Button
            data-testid={TestId.MaintenanceButton}
            disabled={notConnected}
            onClick={() => nav("maintenance")}
          >
            {t("instrumentScreens.general.buttons.maintenance")}
          </Button>
          <Button data-testid={TestId.QCButton}>
            {t("instrumentScreens.general.buttons.qualityControl")}
          </Button>
          <Button
            data-testid={TestId.DiagnosticsButton}
            disabled={notConnected}
            onClick={() => nav("diagnostics")}
          >
            {t("instrumentScreens.general.buttons.diagnostics")}
          </Button>
          <Button data-testid={TestId.SettingsButton} disabled={notConnected}>
            {t("instrumentScreens.general.buttons.settings")}
          </Button>
        </InstrumentPageRightPanelButtonContainer>

        <InstrumentPageRightPanelDivider />

        <InstrumentPageRightPanelButtonContainer>
          <CancelProcessButton
            buttonType="secondary"
            instrumentStatus={instrumentStatusDto}
          />

          <Button
            data-testid={TestId.PowerDownButton}
            disabled={notConnected}
            buttonType="secondary"
            onClick={handlePowerDownButton}
          >
            {t("instrumentScreens.general.buttons.powerDown")}
          </Button>
        </InstrumentPageRightPanelButtonContainer>

        <InstrumentPageRightPanelDivider />

        <InstrumentInfo
          properties={{
            [t("instrumentScreens.general.labels.softwareVersion")]:
              instrumentDto.softwareVersion,
            [t("instrumentScreens.general.labels.serialNumber")]:
              instrumentDto.instrumentSerialNumber,
            [t("instrumentScreens.general.labels.ipAddress")]:
              instrumentStatusDto.connected ? instrumentDto.ipAddress : "",
          }}
        />
      </InstrumentPageRightPanel>
    </InstrumentPageRoot>
  );
}
