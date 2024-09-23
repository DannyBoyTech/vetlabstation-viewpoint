import { Modal, SpotText, DataTable, Button } from "@viewpoint/spot-react";
import styled from "styled-components";
import {
  InstrumentType,
  QualityControlDto,
  AcadiaQualityControlRunRecordDto,
  MostRecentResultEnum,
} from "@viewpoint/api";
import { useTranslation } from "react-i18next";
import { useInstrumentNameForId } from "../../../../utils/hooks/hooks";
import { useState } from "react";
import { useFormatDateTime12h } from "../../../../utils/hooks/datetime";
import { Theme } from "../../../../utils/StyleConstants";
import { useGetProCyteOneQcLotRunsQuery } from "../../../../api/ProCyteOneQualityControlApi";
import { FullSizeSpinner } from "../../../../components/spinner/FullSizeSpinner";
import { Views, pdfViewerOpts } from "../../../../utils/url-utils";

export interface ResultsModalProps {
  visible: boolean;
  onClose: () => void;
  qualityControl?: QualityControlDto;
  instrumentId: number;
  instrumentSerialNumber: string;

  instrumentType: InstrumentType;
  onPrintResults: (objectUrl: string) => void;
  dismissable: boolean;
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

const StyledSpan = styled.span<{ isOutOfRange: boolean }>`
  ${(props) => props.isOutOfRange && `color: red`};
`;

export const TestId = {
  Modal: "qc-results-modal",
  AnalyzerName: "qc-results-modal-analyzer-name",
  ControlType: "qc-results-control-type",
  Lot: "qc-results-lot",
  ViewResultButton: "qc-results-view-result-button",
  ViewResultsButton: "qc-results-view-results-button",
};

export function ProCyteOneResultsModal(props: ResultsModalProps) {
  const {
    instrumentId,
    instrumentType,
    qualityControl,
    instrumentSerialNumber,
    dismissable,
    visible,
    onClose,
    onPrintResults,
  } = props;
  const { t } = useTranslation();
  const getInstrumentName = useInstrumentNameForId();
  const formatDateTime = useFormatDateTime12h();
  const [selectedRecord, setSelectedRecord] =
    useState<AcadiaQualityControlRunRecordDto>();

  const { currentData: runRecords, isFetching } =
    useGetProCyteOneQcLotRunsQuery({
      instrumentId,
      lotNumber: qualityControl?.lotNumber,
    });
  const objectUrl = `/labstation-webapp/api/report/acadiaQualityReport?instrumentId=${instrumentId}&instrumentSerialNumber=${instrumentSerialNumber}&lotNumber=${qualityControl?.lotNumber}`;

  return (
    <StyledModal
      dismissable={dismissable}
      visible={visible}
      onClose={onClose}
      data-testid={TestId.Modal}
    >
      <Modal.Header onClose={onClose}>
        <SpotText level="h3">{t("qc.records.header")}</SpotText>
      </Modal.Header>

      <Modal.Body>
        <InfoGrid>
          <>
            <SpotText level="paragraph" bold>
              {t("qc.analyzer")}
            </SpotText>

            <SpotText level="paragraph" data-testid={TestId.AnalyzerName}>
              {getInstrumentName(instrumentId) ??
                t(`instruments.names.${instrumentType}`)}{" "}
              ({instrumentSerialNumber})
            </SpotText>

            <SpotText level="paragraph" bold>
              {t("qc.lot")}
            </SpotText>

            <SpotText level="paragraph" data-testid={TestId.Lot}>
              {qualityControl?.lotNumber ?? "--"}
            </SpotText>
          </>
        </InfoGrid>

        <TableWrapper>
          <DataTable
            clickable={true}
            sortable={true}
            columns={[
              {
                Header: t("instrumentScreens.proCyteOne.labels.runTime"),
                accessor: (data) => formatDateTime(data.runDate as number),
              },
              {
                Header: t("instrumentScreens.proCyteOne.labels.results"),
                accessor: "result",
                Cell: ({ value }: { value: unknown }) => (
                  <>
                    {value != null ? (
                      <StyledSpan
                        isOutOfRange={value === MostRecentResultEnum.OUTOFRANGE}
                      >
                        {t(
                          `instrumentScreens.proCyteOne.qualityControl.${
                            value as MostRecentResultEnum
                          }`
                        )}
                      </StyledSpan>
                    ) : (
                      "--"
                    )}
                  </>
                ),
              },
            ]}
            data={(runRecords ?? []) as unknown as Record<string, unknown>[]}
            onRowsSelected={(indexes) => {
              setSelectedRecord(runRecords?.[indexes[0]]);
            }}
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
        <Modal.FooterCancelButton onClick={onClose}>
          {t("general.buttons.close")}
        </Modal.FooterCancelButton>
        <Button
          disabled={selectedRecord == null}
          onClick={() => {
            onPrintResults(
              `${objectUrl}&runIds=${selectedRecord?.runId}#${pdfViewerOpts({
                toolbar: false,
                view: Views.FIT_HORIZONTAL,
              })}`
            );
          }}
          buttonType="primary"
          data-testid={TestId.ViewResultButton}
        >
          {t("instrumentScreens.general.buttons.print")}
        </Button>
        <Button
          onClick={() => {
            onPrintResults(
              `${objectUrl}&runIds=${runRecords?.reduce(
                (acc, curr) => (acc += `${curr.runId},`),
                ""
              )}#${pdfViewerOpts({
                toolbar: false,
                view: Views.FIT_HORIZONTAL,
              })}`
            );
          }}
          buttonType="primary"
          data-testid={TestId.ViewResultsButton}
        >
          {t("instrumentScreens.general.buttons.printAll")}
        </Button>
      </Modal.Footer>
    </StyledModal>
  );
}

const Spinner = styled(FullSizeSpinner)`
  height: 200px;
`;
