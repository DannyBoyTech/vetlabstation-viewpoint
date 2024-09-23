import { Modal, SpotText, DataTable, Button } from "@viewpoint/spot-react";
import styled from "styled-components";
import {
  CatalystQualityControlLotDto,
  InstrumentType,
  QualityControlDto,
  QualityControlRunRecordDto,
} from "@viewpoint/api";
import { useTranslation } from "react-i18next";
import { useInstrumentNameForId } from "../../utils/hooks/hooks";
import { useState } from "react";
import { useFormatDateTime12h } from "../../utils/hooks/datetime";
import { Theme } from "../../utils/StyleConstants";
import { useGetQcRunRecordsQuery } from "../../api/QualityControlApi";
import { FullSizeSpinner } from "../spinner/FullSizeSpinner";

export interface QCResultsModalProps {
  visible: boolean;
  onClose: () => void;
  qualityControl?: QualityControlDto;
  instrumentId: number;
  instrumentSerialNumber: string;

  instrumentType: InstrumentType;
  onViewResults: (record: QualityControlRunRecordDto) => void;
}

// Block overflow in modal styles and use flex to grow/constrain the scrollable table
const StyledModal = styled(Modal)`
  .spot-modal__content {
    overflow-y: hidden;
    display: flex;
    flex-direction: column;
  }

  .spot-modal__content-wrapper {
    display: flex;
    flex-direction: column;
    overflow-y: hidden;
    flex: 1;
  }

  .spot-modal__copy {
    display: flex;
    overflow-y: hidden;
    flex-direction: column;
    flex: 1;
  }
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  row-gap: 20px;
  margin: 15px;
`;

const TableWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;

  table thead {
    position: sticky;
    top: 0;
    z-index: 2;
    background-color: ${(p: { theme: Theme }) =>
      p.theme.colors?.background?.primary};
  }
`;

const NoResultsText = styled(SpotText)`
  margin: 30px auto;
`;

const Spinner = styled(FullSizeSpinner)`
  height: 200px;
`;

function hasControlLabel(type?: InstrumentType) {
  if (type === InstrumentType.VetTest) {
    return false;
  }
  return true;
}

function getControlLabelText(qc?: QualityControlDto): string | undefined {
  switch (qc?.instrumentType) {
    case InstrumentType.CatalystOne:
    case InstrumentType.CatalystDx:
      return (qc as CatalystQualityControlLotDto).controlType;
    default:
      return undefined;
  }
}

export const TestId = {
  Modal: "qc-results-modal",
  AnalyzerName: "qc-results-modal-analyzer-name",
  ControlType: "qc-results-control-type",
  Lot: "qc-results-lot",
  ViewResultsButton: "qc-results-view-results-button",
};

export function QCResultsModal(props: QCResultsModalProps) {
  const { t } = useTranslation();
  const getInstrumentName = useInstrumentNameForId();
  const formatDateTime = useFormatDateTime12h();
  const [selectedRecord, setSelectedRecord] =
    useState<QualityControlRunRecordDto>();

  const { currentData: runRecords, isFetching } = useGetQcRunRecordsQuery({
    instrumentId: props.instrumentId,
    qualityControlId: props.qualityControl?.id,
  });

  const selectedQc = selectedRecord?.qualityControl ?? props.qualityControl;

  return (
    <StyledModal
      visible={props.visible}
      onClose={props.onClose}
      data-testid={TestId.Modal}
    >
      <Modal.Header onClose={props.onClose}>
        <SpotText level="h3">{t("qc.records.header")}</SpotText>
      </Modal.Header>

      <Modal.Body>
        <InfoGrid>
          <SpotText level="paragraph" bold>
            {t("qc.analyzer")}
          </SpotText>

          <SpotText level="paragraph" data-testid={TestId.AnalyzerName}>
            {getInstrumentName(props.instrumentId) ??
              t(`instruments.names.${props.instrumentType}`)}{" "}
            ({props.instrumentSerialNumber})
          </SpotText>

          {hasControlLabel(props.instrumentType) && (
            <>
              <SpotText level="paragraph" bold>
                {t("qc.control")}
              </SpotText>

              <SpotText level="paragraph" data-testid={TestId.ControlType}>
                {getControlLabelText(selectedQc) ?? "--"}
              </SpotText>
            </>
          )}

          <SpotText level="paragraph" bold>
            {t("qc.lot")}
          </SpotText>

          <SpotText level="paragraph" data-testid={TestId.Lot}>
            {selectedQc?.lotNumber ?? "--"}
          </SpotText>
        </InfoGrid>

        <TableWrapper>
          <DataTable
            clickable
            columns={[
              {
                Header: t("qc.records.dateTime"),
                accessor: (data) => formatDateTime(data.testDate as number),
              },
            ]}
            data={(runRecords ?? []) as unknown as Record<string, unknown>[]}
            onRowsSelected={(indexes) =>
              setSelectedRecord(runRecords?.[indexes[0]])
            }
          />
          {isFetching && <Spinner />}

          {!isFetching && runRecords?.length === 0 && (
            <NoResultsText level="secondary">
              {t("qc.records.noResults")}
            </NoResultsText>
          )}
        </TableWrapper>
      </Modal.Body>

      <Modal.Footer>
        <Modal.FooterCancelButton onClick={props.onClose}>
          {t("general.buttons.close")}
        </Modal.FooterCancelButton>
        <Button
          disabled={selectedRecord == null}
          onClick={() => props.onViewResults(selectedRecord!)}
          buttonType="primary"
          data-testid={TestId.ViewResultsButton}
        >
          {t("qc.records.viewResults")}
        </Button>
      </Modal.Footer>
    </StyledModal>
  );
}
