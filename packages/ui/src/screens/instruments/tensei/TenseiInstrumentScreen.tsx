import { InstrumentStatus, InstrumentStatusDto } from "@viewpoint/api";
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
  INSTRUMENTS,
  QUALITY_CONTROL,
  SETTINGS,
} from "../../../constants/routes";
import {
  InstrumentInfo,
  TestId as InstrumentInfoTestId,
} from "../InstrumentInfo";
import { useNavigate } from "react-router-dom";
import { CancelProcessButton } from "../common/CancelProcessButton";

export const TestId = {
  QCButton: "tensei-qc-button",
  DiagnosticsButton: "tensei-diagnostics-button",
  SettingsButton: "tensei-settings-button",
  InstrumentPageRoot: "tensei-instruments-screen",
  InstrumentPageContent: "tensei-instruments-screen-content",
  InfoProperty: InstrumentInfoTestId.InfoProperty,
} as const;

export interface TenseiInstrumentScreenProps {
  instrumentStatusDto: InstrumentStatusDto;
}

export function TenseiInstrumentScreen(props: TenseiInstrumentScreenProps) {
  const { t } = useTranslation();
  const nav = useNavigate();

  const instrumentStatusDto = props.instrumentStatusDto;
  const instrumentDto = instrumentStatusDto.instrument;
  const notReadyStatus =
    instrumentStatusDto.instrumentStatus !== InstrumentStatus.Ready;
  const handleDiagnostics = () => {
    nav("diagnostics");
  };
  const handleQualityControl = () => {
    nav(QUALITY_CONTROL);
  };
  const handleSettings = () => {
    nav(SETTINGS);
  };
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
          <Button data-testid={TestId.QCButton} onClick={handleQualityControl}>
            {t("instrumentScreens.general.buttons.qualityControl")}
          </Button>
          <Button
            data-testid={TestId.DiagnosticsButton}
            disabled={notReadyStatus}
            onClick={handleDiagnostics}
          >
            {t("instrumentScreens.general.buttons.diagnostics")}
          </Button>
          <Button
            data-testid={TestId.SettingsButton}
            disabled={notReadyStatus}
            onClick={handleSettings}
          >
            {t("instrumentScreens.general.buttons.settings")}
          </Button>
        </InstrumentPageRightPanelButtonContainer>

        <InstrumentPageRightPanelDivider />

        <InstrumentPageRightPanelButtonContainer>
          <CancelProcessButton
            buttonType="secondary"
            instrumentStatus={props.instrumentStatusDto}
          />
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
