import {
  InstrumentPageRightPanel,
  InstrumentPageRightPanelButtonContainer,
} from "../../common-components";
import { Button, SpotText } from "@viewpoint/spot-react/src";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useGetCatOneSmartQcRunsQuery } from "../../../../api/CatOneApi";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  InstrumentStatus,
  InstrumentStatusDto,
  InstrumentType,
  SmartQCResult,
  SmartQCRunRecordDto,
} from "@viewpoint/api";
import { DateTime12hCell } from "../../../../components/table/DateTime12hCell";
import { SmartQCResultCell } from "../../../../components/table/SmartQCResultCell";
import {
  QCScreenContent,
  QCScreenContentPane,
  QCScreenHeading,
  QCScreenRoot,
  SmartQCDataTable,
} from "../../common/QcScreenComponents";
import SpinnerOverlay from "../../../../components/overlay/SpinnerOverlay";
import { useRunSmartQcMutation } from "../../../../api/QualityControlApi";
import { orderBy } from "lodash";
import { PrintPreview } from "../../../../components/print-preview/PrintPreview";
import { pdfViewerOpts, Views } from "../../../../utils/url-utils";
import { CatalystSmartQcSettings } from "../../common/qc/CatalystSmartQcSettings";
import { CatOneSmartQcCleaningInstructionsModal } from "./CatOneSmartQcInstructions";

export const TestId = {
  RunSmartQC: "run-smartqc",
  BackButton: "back-button",
  PrintSmartQC: "print-smartqc",
  PrintPreview: "print-results",
} as const;

interface CatOneSmartQcScreenProps {
  instrumentStatus: InstrumentStatusDto;
}

interface SmartQCRunRecordRow {
  dto: SmartQCRunRecordDto;
  runDate: Date;
  result: SmartQCResult;

  [key: string]: unknown;
}

const dtoToRow = (dto: SmartQCRunRecordDto): SmartQCRunRecordRow => ({
  dto: dto,
  runDate: dto.runDate,
  result: dto.result,
});

function CatOneSmartQcScreen(props: CatOneSmartQcScreenProps) {
  const { t } = useTranslation();
  const nav = useNavigate();
  const [selectedRecord, setSelectedRecord] = useState<SmartQCRunRecordDto>();
  const [printOpen, setPrintOpen] = useState(false);
  const [smartQcCleaningModalOpen, setSmartQcCleaningModalOpen] =
    useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const instrumentSerialNumber =
    props.instrumentStatus.instrument.instrumentSerialNumber;

  const { data: records, isLoading } = useGetCatOneSmartQcRunsQuery(
    props.instrumentStatus.instrument.id
  );

  const runSmartQcDisabled = (instrumentStatus: InstrumentStatus) =>
    instrumentStatus !== InstrumentStatus.Ready;
  const [runSmartQc] = useRunSmartQcMutation();

  const printDisabled = selectedRecord == null;

  const hasNoRecords = records == null || records.length === 0;

  const handleRunSmartQc = useCallback(() => {
    runSmartQc(props.instrumentStatus.instrument.id);
    nav("/");
  }, [nav, props.instrumentStatus.instrument.id, runSmartQc]);

  function handlePrint() {
    if (selectedRecord != null) {
      setPrintOpen(true);
    }
  }

  function handleRecordSelection(rowIndices: number[]) {
    if (records != null) {
      if (rowIndices == null || rowIndices.length === 0) {
        setSelectedRecord(undefined);
      } else {
        setSelectedRecord(records[rowIndices[0]]);
      }
    }
  }

  function handleBack() {
    nav(-1);
  }

  function buildPrintUrl() {
    if (selectedRecord != null) {
      const instrumentId = props.instrumentStatus.instrument.id;
      const pdfViewOptions = `${pdfViewerOpts({
        toolbar: false,
        view: Views.FIT_HORIZONTAL,
      })}`;
      return `/labstation-webapp/api/report/catOneSmartQCReport?instrumentId=${instrumentId}&instrumentSerialNumber=${instrumentSerialNumber}&runId=${selectedRecord.runId}#${pdfViewOptions}`;
    }
  }

  const columns = useMemo(
    () => [
      {
        Header: t("instrumentScreens.smartQc.table.runTime"),
        accessor: "runDate",
        Cell: DateTime12hCell,
      },
      {
        Header: t("instrumentScreens.smartQc.table.result"),
        accessor: "result",
        Cell: SmartQCResultCell,
      },
    ],
    [t]
  );

  const rows = useMemo(
    () => orderBy((records ?? []).map(dtoToRow), ["runDate"], ["desc"]),
    [records]
  );

  useEffect(() => {
    if (searchParams.get("startSmartQC") === "true") {
      setSearchParams({}, { replace: true });
      setSmartQcCleaningModalOpen(true);
    }
  }, [searchParams, setSearchParams]);

  return (
    <QCScreenRoot>
      <QCScreenContentPane>
        <QCScreenHeading>
          <SpotText level="h3">
            {t("instrumentScreens.smartQc.label.smartQc")}
          </SpotText>
        </QCScreenHeading>

        <SpotText level="h5">
          {t("instrumentScreens.smartQc.label.analyzerSerialNumber", {
            serialNumber: instrumentSerialNumber,
          })}
        </SpotText>

        <CatalystSmartQcSettings instrumentType={InstrumentType.CatalystOne} />

        <QCScreenContent>
          {isLoading && <SpinnerOverlay />}
          <SmartQCDataTable
            clickable={true}
            sortable={true}
            columns={columns}
            data={rows}
            onRowsSelected={handleRecordSelection}
          />
          {hasNoRecords && (
            <SpotText level="secondary">{t("qc.records.noResults")}</SpotText>
          )}
        </QCScreenContent>
      </QCScreenContentPane>
      <InstrumentPageRightPanel>
        <InstrumentPageRightPanelButtonContainer>
          <Button
            data-testid={TestId.RunSmartQC}
            onClick={() => setSmartQcCleaningModalOpen(true)}
            disabled={runSmartQcDisabled(
              props.instrumentStatus.instrumentStatus
            )}
          >
            {t("instrumentScreens.smartQc.button.runSmartQc")}
          </Button>

          <Button
            data-testid={TestId.PrintSmartQC}
            onClick={handlePrint}
            disabled={printDisabled}
          >
            {t("instrumentScreens.general.buttons.print")}
          </Button>
          <Button
            data-testid={TestId.BackButton}
            buttonType="secondary"
            onClick={handleBack}
          >
            {t("general.buttons.back")}
          </Button>
        </InstrumentPageRightPanelButtonContainer>
      </InstrumentPageRightPanel>

      {printOpen ? (
        <PrintPreview
          data-testid={TestId.PrintPreview}
          headerContent={t("printResultsModal.title")}
          url={buildPrintUrl()}
          open={true}
          onClose={() => setPrintOpen(false)}
          onConfirm={() => setPrintOpen(false)}
          printJobName={t("general.printJobs.resultsReport")}
        />
      ) : null}

      {smartQcCleaningModalOpen && (
        <CatOneSmartQcCleaningInstructionsModal
          instrumentId={props.instrumentStatus.instrument.id}
          open={true}
          onClose={() => setSmartQcCleaningModalOpen(false)}
          onConfirm={handleRunSmartQc}
        />
      )}
    </QCScreenRoot>
  );
}

export { CatOneSmartQcScreen };
