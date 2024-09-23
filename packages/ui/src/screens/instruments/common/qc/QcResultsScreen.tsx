import { useState, useEffect } from "react";
import { TFunction, useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

import {
  InstrumentDto,
  InstrumentStatusDto,
  QcLotDto,
  QualityControlRunDto,
  QualityControlRunRecordDto,
  QualityControlTrendDto,
} from "@viewpoint/api";
import {
  Button,
  DataTable,
  SpotText,
  Checkbox,
  TextArea,
} from "@viewpoint/spot-react";
import {
  InstrumentPageContent,
  InstrumentPageRightPanel,
  InstrumentPageRightPanelButtonContainer,
  InstrumentPageRoot,
} from "../../common-components";
import SpinnerOverlay from "../../../../components/overlay/SpinnerOverlay";
import { PrintPreview } from "../../../../components/print-preview/PrintPreview";
import { Theme } from "../../../../utils/StyleConstants";
import { useFormatDateTime12h } from "../../../../utils/hooks/datetime";
import { useInstrumentNameForId } from "../../../../utils/hooks/hooks";
import {
  useGetQcRunRecordsQuery,
  useSaveQcTrendDtoMutation,
} from "../../../../api/QualityControlApi";
import { useGetDetailedLabRequestQuery } from "../../../../api/LabRequestsApi";
import { skipToken } from "@reduxjs/toolkit/query";
import { InputAware } from "../../../../components/InputAware";
import { Views, pdfViewerOpts } from "../../../../utils/url-utils";

interface QCButtonClusterProps {
  onViewResults: () => void;
  viewResultsDisabled: boolean;
  qcTrendDisabled: boolean;
  onViewQcTrend?: () => void;
  onBack?: () => void;
}

export const TestId = {
  QcResultsTable: "qc-results-table",
  ViewResultsButton: "view-results-button",
  ViewQcTrendButton: "view-qc-trend-button",
  BackButton: "back-button",
  AnalyzerName: "qc-results-modal-analyzer-name",
  ControlType: "qc-results-control-type",
  Lot: "qc-results-lot",
  ExclusionAndComments: "qc-results-comments",
  ExcludeCheckbox: "qc-results-exclude-checkbox",
  ExcludeCommentsTextArea: "qc-results-exclude-comments-textarea",
  ExcludeCommentsSaveButton: "qc-results-exclude-comments-save-button",
};

const QCButtonCluster = (props: QCButtonClusterProps) => {
  const { t } = useTranslation();

  return (
    <InstrumentPageRightPanelButtonContainer>
      <Button
        onClick={props.onViewResults}
        buttonType="primary"
        data-testid={TestId.ViewResultsButton}
        disabled={props.viewResultsDisabled}
      >
        {t("qc.records.viewResults")}
      </Button>
      <Button
        buttonType="secondary"
        onClick={props.onViewQcTrend}
        data-testid={TestId.ViewQcTrendButton}
        disabled={props.qcTrendDisabled}
      >
        {t("qc.records.qcTrend")}
      </Button>
      <Button
        buttonType="secondary"
        onClick={props.onBack}
        data-testid={TestId.BackButton}
      >
        {t("general.buttons.back")}
      </Button>
    </InstrumentPageRightPanelButtonContainer>
  );
};

const Root = styled(InstrumentPageRoot)`
  overflow: hidden;
`;

const ContentPane = styled(InstrumentPageContent)`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow: hidden;
`;
ContentPane.displayName = "ContentPane";

const Heading = styled.div`
  flex: 0;
`;
Heading.displayName = "Heading";

const Content = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;
`;
Content.displayName = "Content";

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 3fr;
  row-gap: 1rem;
  margin: 1rem;
  max-width: 30rem;
`;

const StyledDataTable = styled(DataTable)`
  width: 15rem;
  margin: 0px;
  height: min-content;
  overflow-y: auto;

  thead {
    position: sticky;
    top: 0;
    z-index: 2;
  }

  tbody tr.disabled {
    color: ${(p: { theme: Theme }) => p.theme.colors?.text?.disabled};
  }
`;
StyledDataTable.displayName = "StyledDataTable";

const StyledTableAndCommentSection = styled.div`
  display: flex;
  gap: 3rem;
  margin-top: 2rem;
  width: 100%;
`;

export interface QcResultsScreenProps {
  instrumentStatus: InstrumentStatusDto;
  qcLotInfo: QcLotDto;
  trendReportUrl?: string;
  getQcControlLabel?: (qcLotInfo: QcLotDto, t: TFunction) => string | undefined;
  getQcLotLabel?: (qcLotInfo: QcLotDto, t: TFunction) => string | undefined;
  getAnalyzerLabel?: (
    instrument: InstrumentDto,
    t: TFunction
  ) => string | undefined;
}

const QcResultsScreen = (props: QcResultsScreenProps) => {
  const { t } = useTranslation();
  const nav = useNavigate();

  const [selectedRecord, setSelectedRecord] =
    useState<QualityControlRunRecordDto>();
  const [isViewQcTrendOpen, setIsViewQcTrendOpen] = useState(false);

  const getInstrumentName = useInstrumentNameForId();
  const formatDateTime = useFormatDateTime12h();

  const { currentData: runRecords, isLoading } = useGetQcRunRecordsQuery({
    instrumentId: props.instrumentStatus.instrument.id,
    qualityControlId: props.qcLotInfo.id,
  });
  const { data: selectedQcRun, isFetching: detailedResultsFetching } =
    useGetDetailedLabRequestQuery(
      selectedRecord == null
        ? skipToken
        : { labRequestId: selectedRecord.labRequestId },
      {
        selectFromResult: (result) => ({
          ...result,
          data:
            selectedRecord == null
              ? undefined
              : (result.data?.instrumentRunDtos?.[0] as QualityControlRunDto),
        }),
      }
    );

  const [saveTrendDto, saveTrendDtoStatus] = useSaveQcTrendDtoMutation();

  const handleViewResults = () =>
    nav(`/labRequest/${selectedRecord?.labRequestId}`);

  const handleViewQcTrend = () => setIsViewQcTrendOpen(true);

  const handleBack = () => nav(-1);

  const handleSaveQcTrend = (excluded: boolean, comments?: string) => {
    if (selectedQcRun != null) {
      const trendDto: QualityControlTrendDto = {
        qualityControlRunId: selectedQcRun.id,
        excludeFromTrend: excluded,
        comments,
      };
      saveTrendDto({ trendDto, runId: selectedQcRun.id });
    }
  };

  const getAnalyzerLabel =
    props.getAnalyzerLabel ??
    ((instrument) =>
      `${getInstrumentName(instrument.id)} (${
        instrument.instrumentSerialNumber
      })`);

  const getControlLabel =
    props.getQcControlLabel ??
    ((qcLotInfo) =>
      `${t("qc.level")} ${
        qcLotInfo.level ?? t("general.placeholder.noValue")
      }`);

  const getQcLotLabel =
    props.getQcLotLabel ??
    ((qcLotInfo) => qcLotInfo.lotNumber ?? t("general.placeholder.noValue"));

  return (
    <Root>
      <ContentPane data-testid="qc-lots-main-page">
        <Heading>
          <SpotText level="h3">
            {t("qc.results.header", {
              instrumentName: getInstrumentName(
                props.instrumentStatus.instrument.id
              ),
            })}
          </SpotText>
        </Heading>

        <Content>
          {isLoading && <SpinnerOverlay />}
          <InfoGrid>
            <SpotText level="paragraph" bold>
              {t("qc.analyzer")}
            </SpotText>

            <SpotText level="paragraph" data-testid={TestId.AnalyzerName}>
              {getAnalyzerLabel(props.instrumentStatus.instrument, t)}
            </SpotText>

            <>
              <SpotText level="paragraph" bold>
                {t("qc.control")}
              </SpotText>

              <SpotText level="paragraph" data-testid={TestId.ControlType}>
                {getControlLabel(props.qcLotInfo, t)}
              </SpotText>
            </>

            <SpotText level="paragraph" bold>
              {t("qc.lot")}
            </SpotText>

            <SpotText level="paragraph" data-testid={TestId.Lot}>
              {getQcLotLabel(props.qcLotInfo, t)}
            </SpotText>
          </InfoGrid>
          <StyledTableAndCommentSection>
            <StyledDataTable
              data-testid={TestId.QcResultsTable}
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
            <ExcludeFromTrendDataSection
              visible={selectedRecord != null}
              selectedQcRun={selectedQcRun}
              loading={detailedResultsFetching || saveTrendDtoStatus.isLoading}
              onUpdated={handleSaveQcTrend}
            />
          </StyledTableAndCommentSection>
        </Content>
      </ContentPane>
      <InstrumentPageRightPanel data-testid="qc-results-page-right">
        <QCButtonCluster
          onViewResults={handleViewResults}
          viewResultsDisabled={!selectedRecord}
          qcTrendDisabled={runRecords == null || runRecords.length === 0}
          onViewQcTrend={handleViewQcTrend}
          onBack={handleBack}
        />
      </InstrumentPageRightPanel>
      {props.trendReportUrl != null && isViewQcTrendOpen ? (
        <PrintPreview
          data-testid="trend-qc-modal"
          headerContent={t("qc.records.controlTrendReport", {
            instrumentName: getInstrumentName(
              props.instrumentStatus.instrument.id
            ),
          })}
          url={`${props.trendReportUrl}#${pdfViewerOpts({
            toolbar: false,
            view: Views.FIT_HORIZONTAL,
          })}`}
          open={true}
          onClose={() => setIsViewQcTrendOpen(false)}
          onConfirm={() => setIsViewQcTrendOpen(false)}
          printJobName={t("general.printJobs.resultsReport")}
        />
      ) : null}
    </Root>
  );
};

export { QcResultsScreen };

const StyledExcludeAndCommentSection = styled.div<{ visible: boolean }>`
  position: relative;
  ${(p) => (p.visible ? "" : "visibility: hidden;")}
  display: flex;
  flex-grow: 1;
  gap: 1rem;
  flex-direction: column;
  margin: 0.5rem;
`;

const CommentsHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 10px;

  .spot-form__checkbox {
    margin: 0;
  }
`;

const SaveButton = styled(Button)`
  margin-top: 5px;
`;

interface ExcludeFromTrendDataSectionProps {
  visible: boolean;
  selectedQcRun?: QualityControlRunDto;
  loading?: boolean;
  onUpdated: (excluded: boolean, comments?: string) => void;
}

function ExcludeFromTrendDataSection(props: ExcludeFromTrendDataSectionProps) {
  const [comments, setComments] = useState("");
  const { t } = useTranslation();

  useEffect(() => {
    if (props.selectedQcRun != null) {
      setComments(props.selectedQcRun.excludeTrendingReason ?? "");
    }
  }, [props.selectedQcRun]);

  return (
    <StyledExcludeAndCommentSection visible={props.visible}>
      <div data-testid={TestId.ExclusionAndComments}>
        <CommentsHeader>
          <Checkbox
            data-testid={TestId.ExcludeCheckbox}
            disabled={props.selectedQcRun == null || props.loading}
            checked={props.selectedQcRun?.excludeTrendingReason != null}
            onChange={(ev) =>
              props.onUpdated(
                ev.currentTarget.checked,
                comments.length > 0 ? comments : undefined
              )
            }
            label={t("qc.records.excludeFromQcTrend")}
          />
        </CommentsHeader>
        {props.selectedQcRun?.excludeTrendingReason != null && (
          <>
            <InputAware>
              <TextArea
                data-testid={TestId.ExcludeCommentsTextArea}
                style={{ resize: "none" }}
                value={comments}
                disabled={props.selectedQcRun == null || props.loading}
                onChange={(ev) => setComments(ev.target.value)}
                placeholder={t("qc.records.tapToEnterComments")}
              />
            </InputAware>
            <SaveButton
              data-testid={TestId.ExcludeCommentsSaveButton}
              buttonSize="small"
              onClick={() =>
                props.onUpdated(
                  true,
                  comments.length > 0 ? comments : undefined
                )
              }
              disabled={
                props.selectedQcRun == null ||
                props.loading ||
                comments === props.selectedQcRun?.excludeTrendingReason ||
                (comments.length === 0 &&
                  props.selectedQcRun?.excludeTrendingReason.length === 0)
              }
            >
              {t("general.buttons.save")}
            </SaveButton>
          </>
        )}
      </div>
      {props.loading && <SpinnerOverlay />}
    </StyledExcludeAndCommentSection>
  );
}
