import {
  InstrumentPageContent,
  InstrumentPageRightPanel,
  InstrumentPageRightPanelButtonContainer,
  InstrumentPageRoot,
} from "../common-components";
import { useNavigate } from "react-router-dom";
import { Button, SpotText } from "@viewpoint/spot-react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import React from "react";
import { useExecuteMaintenanceProcedureMutation } from "../../../api/TheiaApi";
import { InstrumentStatusDto, MaintenanceProcedure } from "@viewpoint/api";

export const TestId = {
  BackButton: "invuedx-maintenance-back-button",
  InstrumentMaintenancePageRoot: "invuedx-maintenance-screen",
  InstrumentMaintenance1Button: "invuedx-maintenance-maintenance1-button",
  InstrumentMaintenance2Button: "invuedx-maintenance-maintenance2-button",
  InstrumentMaintenance3Button: "invuedx-maintenance-maintenance3-button",
  InstrumentMaintenance4Button: "invuedx-maintenance-maintenance4-button",
  InstrumentMaintenance5Button: "invuedx-maintenance-maintenance5-button",
  InstrumentMaintenance6Button: "invuedx-maintenance-maintenance6-button",
};

const ButtonContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 30px;
  margin-top: 20px;

  & button {
    justify-content: center;
    width: 20em;
  }
`;

export interface InVueDxMaintenanceScreenProps {
  instrument: InstrumentStatusDto;
}

export function InVueDxMaintenanceScreen(props: InVueDxMaintenanceScreenProps) {
  const nav = useNavigate();
  const { t } = useTranslation();
  const [executeMaintenanceProcedure] =
    useExecuteMaintenanceProcedureMutation();

  const instrumentId = props.instrument.instrument.id;

  return (
    <InstrumentPageRoot data-testid={TestId.InstrumentMaintenancePageRoot}>
      <InstrumentPageContent>
        <SpotText level="h3">
          {t("instrumentScreens.general.labels.maintenance")}
        </SpotText>
        <ButtonContainer>
          <Button
            data-testid={TestId.InstrumentMaintenance1Button}
            buttonType="primary"
            onClick={() => {
              executeMaintenanceProcedure({
                instrumentId: instrumentId,
                maintenanceProcedure: MaintenanceProcedure.MAINTENANCE_1,
              });
            }}
          >
            Maintenance 1
          </Button>
          <Button
            data-testid={TestId.InstrumentMaintenance2Button}
            buttonType="primary"
            onClick={() => {
              executeMaintenanceProcedure({
                instrumentId: instrumentId,
                maintenanceProcedure: MaintenanceProcedure.MAINTENANCE_2,
              });
            }}
          >
            Maintenance 2
          </Button>
          <Button
            data-testid={TestId.InstrumentMaintenance3Button}
            buttonType="primary"
            onClick={() => {
              executeMaintenanceProcedure({
                instrumentId: instrumentId,
                maintenanceProcedure: MaintenanceProcedure.MAINTENANCE_3,
              });
            }}
          >
            Maintenance 3
          </Button>
          <Button
            data-testid={TestId.InstrumentMaintenance4Button}
            buttonType="primary"
            onClick={() => {
              executeMaintenanceProcedure({
                instrumentId: instrumentId,
                maintenanceProcedure: MaintenanceProcedure.MAINTENANCE_4,
              });
            }}
          >
            Maintenance 4
          </Button>
          <Button
            data-testid={TestId.InstrumentMaintenance5Button}
            buttonType="primary"
            onClick={() => {
              executeMaintenanceProcedure({
                instrumentId: instrumentId,
                maintenanceProcedure: MaintenanceProcedure.MAINTENANCE_5,
              });
            }}
          >
            Maintenance 5
          </Button>
          <Button
            data-testid={TestId.InstrumentMaintenance6Button}
            buttonType="primary"
            onClick={() => {
              executeMaintenanceProcedure({
                instrumentId: instrumentId,
                maintenanceProcedure: MaintenanceProcedure.MAINTENANCE_6,
              });
            }}
          >
            Maintenance 6
          </Button>
        </ButtonContainer>
      </InstrumentPageContent>
      <InstrumentPageRightPanel>
        <InstrumentPageRightPanelButtonContainer>
          <Button
            buttonType="secondary"
            onClick={() => nav(-1)}
            data-testid={TestId.BackButton}
          >
            {t("general.buttons.back")}
          </Button>
        </InstrumentPageRightPanelButtonContainer>
      </InstrumentPageRightPanel>
    </InstrumentPageRoot>
  );
}
