import { ConfirmModal } from "../../../../confirm-modal/ConfirmModal";
import { useTranslation } from "react-i18next";
import React from "react";
import { Button, CardBody, SpotText } from "@viewpoint/spot-react/src";
import { StyledCard } from "../../../../results/manage-results/common-components";
import styled from "styled-components";
import ImportPreviousResults from "../../../../../assets/instruments/theia/config/import_hematology_results.png";
import SelectHematologyRuns from "../../../../../assets/instruments/theia/config/run_with_hematology_instrument.png";
import EnterCbcValues from "../../../../../assets/instruments/theia/config/enter_cbc_values.png";
import { BloodModalContentRoot, BloodModalWrapper } from "./blood-common";

export interface BloodRunModalProps {
  onClose: () => void;
  onConfirm: () => void;
  selectHematologyInstrumentsEnabled: boolean;
  onSelectHematologyInstruments: () => void;
  importPreviousResultsEnabled: boolean;
  onImportPreviousResults: () => void;
  onEnterCbcValues: () => void;
}

const ImageIcon = styled.img`
  height: 120px;
  width: 120px;
`;

const BloodModalStyledCard = styled(StyledCard)`
  .spot-card--body {
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
    height: 100%;
  }
`;

const TitleSpotText = styled(SpotText)`
  text-align: center;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
`;

export function BloodRunModal(props: BloodRunModalProps) {
  const { t } = useTranslation();

  const bodyContent = (
    <BloodModalWrapper>
      <SpotText level="secondary">
        {t("orderFulfillment.bloodMorphology.confirmModal.instructions")}
      </SpotText>
      <BloodModalContentRoot>
        <BloodModalStyledCard
          disabled={!props.selectHematologyInstrumentsEnabled}
          variant="secondary"
          data-testid="select-hematology-instruments"
        >
          <CardBody>
            <TitleSpotText level="secondary">
              {t("orderFulfillment.bloodMorphology.hematology.run.import")}
            </TitleSpotText>
            <Container>
              <ImageIcon
                src={SelectHematologyRuns}
                alt="select-hematology-run"
              />
              <Button
                disabled={!props.selectHematologyInstrumentsEnabled}
                onClick={props.onSelectHematologyInstruments}
              >
                {t("general.select")}
              </Button>
            </Container>
          </CardBody>
        </BloodModalStyledCard>
        <BloodModalStyledCard
          disabled={!props.importPreviousResultsEnabled}
          variant="secondary"
          data-testid="import-previous-results"
        >
          <CardBody>
            <TitleSpotText level="secondary">
              {t("orderFulfillment.bloodMorphology.historical.run.import")}
            </TitleSpotText>
            <Container>
              <ImageIcon src={ImportPreviousResults} alt="historical-results" />
              <Button
                disabled={!props.importPreviousResultsEnabled}
                onClick={props.onImportPreviousResults}
              >
                {t("general.select")}
              </Button>
            </Container>
          </CardBody>
        </BloodModalStyledCard>
        <BloodModalStyledCard
          variant="secondary"
          data-testid="enter-cbc-values"
        >
          <CardBody>
            <TitleSpotText level="secondary">
              {t("orderFulfillment.bloodMorphology.cbc.values.enter")}
            </TitleSpotText>
            <Container>
              <ImageIcon src={EnterCbcValues} alt="cbc-values" />
              <Button onClick={props.onEnterCbcValues}>
                {t("general.select")}
              </Button>
            </Container>
          </CardBody>
        </BloodModalStyledCard>
      </BloodModalContentRoot>
    </BloodModalWrapper>
  );

  return (
    <ConfirmModal
      responsive
      headerContent={t("orderFulfillment.bloodMorphology.confirmModal.header")}
      secondaryHeaderContent={t(
        "orderFulfillment.bloodMorphology.confirmModal.secondaryHeader"
      )}
      bodyContent={bodyContent}
      cancelButtonContent={t("general.buttons.cancel")}
      confirmButtonContent={t("general.buttons.skip")}
      onClose={props.onClose}
      onConfirm={props.onConfirm}
      open
    ></ConfirmModal>
  );
}
