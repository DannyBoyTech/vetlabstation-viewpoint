import { Button, SpotText } from "@viewpoint/spot-react";
import {
  InstrumentPageContent,
  InstrumentPageRightPanel,
  InstrumentPageRightPanelButtonContainer,
  InstrumentPageRoot,
} from "../common-components";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  EventIds,
  InstrumentStatus,
  InstrumentStatusDto,
  MaintenanceProcedure,
  MaintenanceProcedureAcceptedEvent,
} from "@viewpoint/api";
import styled from "styled-components";
import { useEventListener } from "../../../context/EventSourceContext";
import { SediVueDxCleaningWizard } from "./cleaning/SediVueDxCleaningWizard";
import { useState } from "react";
import { useRequestSediVueProcedureMutation } from "../../../api/SediVueApi";

const ButtonContainer = styled.div`
  display: flex;
  gap: 20px;
  margin-top: 20px;
  width: 20em;

  & button {
    flex: 1;
    justify-content: center;
  }
`;

export const TestId = {
  CleanButton: "svdx-maintenance-clean-button",
  InitializeButton: "svdx-maintenance-initialize-button",
};

export interface SediVueDxMaintenanceScreenProps {
  instrument: InstrumentStatusDto;
}

export function SediVueDxMaintenanceScreen(
  props: SediVueDxMaintenanceScreenProps
) {
  const [cleaningWizardOpen, setCleaningWizardOpen] = useState(false);
  const { t } = useTranslation();
  const nav = useNavigate();

  const [requestProcedure] = useRequestSediVueProcedureMutation();

  useEventListener(EventIds.MaintenanceProcedureAccepted, (msg) => {
    const data: MaintenanceProcedureAcceptedEvent = JSON.parse(msg.data);
    if (
      data.instrumentId === props.instrument.instrument.id &&
      data.procedure === "Initialize"
    ) {
      nav("/");
    }
  });

  const startCleaning = () => {
    setCleaningWizardOpen(true);
  };

  const cancelCleaning = () => {
    setCleaningWizardOpen(false);
  };

  const finishCleaning = () => {
    setCleaningWizardOpen(false);
    nav("/");
  };

  return (
    <InstrumentPageRoot>
      <InstrumentPageContent>
        <SpotText level="h3">
          {t("instrumentScreens.general.labels.maintenance")}
        </SpotText>
        <ButtonContainer>
          <Button
            data-testid={TestId.CleanButton}
            buttonSize="small"
            onClick={startCleaning}
            disabled={
              props.instrument.instrumentStatus !== InstrumentStatus.Ready
            }
          >
            {t("instrumentScreens.general.buttons.clean")}
          </Button>
          <Button
            data-testid={TestId.InitializeButton}
            buttonSize="small"
            onClick={() =>
              requestProcedure({
                instrumentId: props.instrument.instrument.id,
                procedure: MaintenanceProcedure.INITIALIZE,
              })
            }
          >
            {t("instrumentScreens.sediVueDx.maintenance.buttons.initialize")}
          </Button>
        </ButtonContainer>
      </InstrumentPageContent>
      <InstrumentPageRightPanel>
        <InstrumentPageRightPanelButtonContainer>
          <Button buttonType="secondary" onClick={() => nav(-1)}>
            {t("general.buttons.back")}
          </Button>
        </InstrumentPageRightPanelButtonContainer>
      </InstrumentPageRightPanel>

      {cleaningWizardOpen && (
        <SediVueDxCleaningWizard
          onCancel={cancelCleaning}
          onDone={finishCleaning}
          instrumentId={props.instrument.instrument.id}
        />
      )}
    </InstrumentPageRoot>
  );
}
