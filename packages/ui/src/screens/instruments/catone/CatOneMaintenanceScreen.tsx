import { Button, SpotText } from "@viewpoint/spot-react";
import {
  InstrumentPageContent,
  InstrumentPageRightPanel,
  InstrumentPageRightPanelButtonContainer,
  InstrumentPageRoot,
} from "../common-components";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import {
  FeatureFlagName,
  InstrumentStatus,
  InstrumentStatusDto,
} from "@viewpoint/api";
import { useState } from "react";
import {
  useCancelGeneralCleanMutation,
  useCancelOpticsCalibrationMutation,
  useCompleteGeneralCleanMutation,
  useCompleteOpticsCalibrationMutation,
  useRequestGeneralCleanMutation,
} from "../../../api/CatOneApi";
import { useFeatureFlagQuery } from "../../../api/FeatureFlagApi";
import { CatOneCalibrationWizard } from "./calibrate/CatOneCalibrationWizard";
import { CatOneCleaningWizard } from "./cleaning/CatOneCleaningWizard";

export const TestId = {
  MaintenanceHeader: "maintenance-header",
  QCButtons: "qc-buttons",
  SmartQCButton: "smartqc-button",
} as const;

const Root = styled.div`
  display: flex;
  flex-direction: column;
  gap: 30px;
  width: 87%;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 30px;
`;

const StyledButton = styled(Button)`
  flex: 1;
  justify-content: center;
`;

export interface CatOneMaintenanceScreenProps {
  instrument: InstrumentStatusDto;
}

export const MaintenanceActions = {
  Calibrate: "CALIBRATE",
  Clean: "CLEAN",
};

export const MAINTENANCE_ACTION_PARAM = "maintenanceAction";

export function CatOneMaintenanceScreen(props: CatOneMaintenanceScreenProps) {
  const instrumentId = props.instrument.instrument.id;

  const [searchParams, setSearchParams] = useSearchParams();
  const maintenanceAction = searchParams.get(MAINTENANCE_ACTION_PARAM);

  const [calibrateWizardOpen, setCalibrateWizardOpen] = useState(
    maintenanceAction === MaintenanceActions.Calibrate
  );
  const [cleanWizardOpen, setCleanWizardOpen] = useState(
    maintenanceAction === MaintenanceActions.Clean
  );

  const nav = useNavigate();
  const { t } = useTranslation();

  const [cancelCalibration] = useCancelOpticsCalibrationMutation();
  const [completeCalibration] = useCompleteOpticsCalibrationMutation();

  const [requestClean] = useRequestGeneralCleanMutation();
  const [cancelClean] = useCancelGeneralCleanMutation();
  const [completeClean] = useCompleteGeneralCleanMutation();

  const { data: isSmartQcEnabled, isLoading: isRunningFeatureFlagQuery } =
    useFeatureFlagQuery(FeatureFlagName.CATONE_SMARTQC);

  const cleanOrCalibrateDisabled = (instrumentStatus?: InstrumentStatus) =>
    instrumentStatus != null &&
    ![InstrumentStatus.Ready, InstrumentStatus.Alert].includes(
      instrumentStatus
    );

  const resetParams = () => setSearchParams({});

  const handleCalibrate = () => {
    setCalibrateWizardOpen(true);
  };

  const handleClean = () => {
    requestClean(instrumentId);
    setCleanWizardOpen(true);
  };

  const handleCancelClean = () => {
    cancelClean(instrumentId);
    setCleanWizardOpen(false);
    resetParams();
  };

  const handleDoneClean = () => {
    completeClean(instrumentId);
    setCleanWizardOpen(false);
    resetParams();
  };

  const handleCancelCalibrate = () => {
    cancelCalibration(props.instrument.instrument.id);
    setCalibrateWizardOpen(false);
    resetParams();
  };

  const handleCompleteCalibrate = () => {
    completeCalibration(props.instrument.instrument.id);
    setCalibrateWizardOpen(false);
    resetParams();
  };

  return (
    <InstrumentPageRoot>
      <InstrumentPageContent>
        <Root>
          <SpotText data-testid={TestId.MaintenanceHeader} level="h3">
            {t("instrumentScreens.general.labels.maintenance")}
          </SpotText>

          {!isRunningFeatureFlagQuery && (
            <ButtonContainer data-testid={TestId.QCButtons}>
              <StyledButton
                buttonType="primary"
                onClick={handleClean}
                disabled={cleanOrCalibrateDisabled(
                  props.instrument?.instrumentStatus
                )}
              >
                {t("instrumentScreens.general.buttons.clean")}
              </StyledButton>

              <StyledButton
                buttonType="primary"
                onClick={handleCalibrate}
                disabled={cleanOrCalibrateDisabled(
                  props.instrument?.instrumentStatus
                )}
              >
                {t("instrumentScreens.general.buttons.calibrate")}
              </StyledButton>

              <StyledButton
                buttonType="primary"
                onClick={() =>
                  nav(`/instruments/${props.instrument.instrument.id}/qc`)
                }
              >
                {t("instrumentScreens.general.buttons.qualityControl")}
              </StyledButton>

              {isSmartQcEnabled && (
                <StyledButton
                  data-testid={TestId.SmartQCButton}
                  buttonType="primary"
                  onClick={() =>
                    nav(
                      `/instruments/${props.instrument.instrument.id}/smartQc`
                    )
                  }
                >
                  {t("instrumentScreens.general.buttons.smartQC")}
                </StyledButton>
              )}
            </ButtonContainer>
          )}
        </Root>
      </InstrumentPageContent>
      <InstrumentPageRightPanel>
        <InstrumentPageRightPanelButtonContainer>
          <Button buttonType="secondary" onClick={() => nav(-1)}>
            {t("general.buttons.back")}
          </Button>
        </InstrumentPageRightPanelButtonContainer>
      </InstrumentPageRightPanel>

      {calibrateWizardOpen && (
        <CatOneCalibrationWizard
          instrumentStatus={props.instrument}
          onCancel={handleCancelCalibrate}
          onDone={handleCompleteCalibrate}
        />
      )}

      {cleanWizardOpen && (
        <CatOneCleaningWizard
          instrumentStatus={props.instrument}
          onCancel={handleCancelClean}
          onDone={handleDoneClean}
        />
      )}
    </InstrumentPageRoot>
  );
}

export function getMaintenanceActionPath(
  instrumentId: number,
  action: (typeof MaintenanceActions)[keyof typeof MaintenanceActions]
) {
  return `/instruments/${instrumentId}/maintenance?${MAINTENANCE_ACTION_PARAM}=${action}`;
}
