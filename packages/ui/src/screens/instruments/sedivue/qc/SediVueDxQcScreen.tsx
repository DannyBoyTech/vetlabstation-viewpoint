import { InstrumentStatusDto, QcLotDto } from "@viewpoint/api";
import { Button, SpotText } from "@viewpoint/spot-react";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  useGetQcLotsQuery,
  useRunQcMutation,
} from "../../../../api/QualityControlApi";
import {
  InstrumentPageRightPanel,
  InstrumentPageRightPanelButtonContainer,
} from "../../common-components";
import SpinnerOverlay from "../../../../components/overlay/SpinnerOverlay";
import { orderBy } from "lodash";
import {
  calculateRowProps,
  QCDataTable,
  QCScreenContent,
  QCScreenContentPane,
  QCScreenHeading,
  QCScreenRoot,
} from "../../common/QcScreenComponents";
import { skipToken } from "@reduxjs/toolkit/query";
import { SediVueDxPrepareQcModal } from "./SediVueDxPrepareQcModal";
import { SediVueDxQcLotEntryModal } from "./lotEntry/SediVueQcLotEntryModal";
import { DateCell } from "../../../../components/table/DateCell";
import { DateTime12hCell } from "../../../../components/table/DateTime12hCell";

interface QcLotRow {
  canRun: boolean;
  dto: QcLotDto;
  expiration: number | undefined;
  level: string;
  lot: string;
  type: string;
  recent: number | undefined;

  [key: string]: unknown;
}

const dtoToLotRow = (qcDto: QcLotDto): QcLotRow => {
  return {
    dto: qcDto,
    lot: qcDto.lotNumber!,
    type: (qcDto as QcLotDto).controlType,
    expiration: qcDto.dateExpires,
    recent: qcDto.mostRecentRunDate,
    canRun: qcDto.canRun || false,
    level: qcDto.fluidType?.toString() as string,
  };
};

interface QCButtonClusterProps {
  onRunQc?: () => void;
  onViewQCResults: () => void;
  onAddQCLot: () => void;
  onBack?: () => void;

  runQcDisabled?: boolean;
  viewResultsDisabled?: boolean;
}

export const TestId = {
  LotsTable: "lots-table",
  RunQCButton: "run-qc-button",
  ViewQCResultsButton: "view-all-qc-results-button",
  AddQCLotButton: "add-qc-lot-button",
  ViewLotResultsButton: "view-qc-lot-results-button",
  BackButton: "qc-back-button",
  QCLotEntryModal: "qc-lot-entry-modal",
};

const QCButtonCluster = (props: QCButtonClusterProps) => {
  const { t } = useTranslation();

  return (
    <InstrumentPageRightPanelButtonContainer>
      <Button
        onClick={props.onRunQc}
        disabled={props.runQcDisabled}
        data-testid={TestId.RunQCButton}
      >
        {t("instrumentScreens.general.buttons.runQC")}
      </Button>
      <Button
        onClick={props.onViewQCResults}
        disabled={props.viewResultsDisabled}
        data-testid={TestId.ViewQCResultsButton}
      >
        {t("instrumentScreens.general.buttons.viewQCResults")}
      </Button>
      <Button onClick={props.onAddQCLot} data-testid={TestId.AddQCLotButton}>
        {t("instrumentScreens.sediVueDx.qc.buttons.addQCLot")}
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

interface SediVueDxQcScreenProps {
  instrument?: InstrumentStatusDto;
}

const SediVueDxQcScreen = ({ instrument }: SediVueDxQcScreenProps) => {
  const [selectedIndex, setSelectedIndex] = useState<number>();
  const [runQcOpen, setRunQcOpen] = useState(false);
  const [lotEntryOpen, setLotEntryOpen] = useState(false);

  const { t } = useTranslation();
  const nav = useNavigate();

  const { data: qcLotsDtos, isLoading } = useGetQcLotsQuery(
    instrument != null
      ? {
          instrumentId: instrument.instrument.id,
          instrumentType: instrument.instrument.instrumentType,
        }
      : skipToken
  );

  const [runQc, { isLoading: isRunQcLoading }] = useRunQcMutation();

  const rows = useMemo(
    () =>
      orderBy((qcLotsDtos ?? []).map(dtoToLotRow), ["expiration"], ["desc"]),
    [qcLotsDtos]
  );

  const columns = useMemo(
    () => [
      {
        Header: t("instrumentScreens.sediVueDx.qc.labels.lotNumber"),
        accessor: "lot",
      },
      {
        Header: t("instrumentScreens.sediVueDx.qc.labels.level"),
        accessor: "level",
      },
      {
        Header: t("instrumentScreens.general.labels.expirationDate"),
        accessor: "expiration",
        Cell: DateCell,
      },
      {
        Header: t("instrumentScreens.general.labels.mostRecentResults"),
        accessor: "recent",
        Cell: DateTime12hCell,
      },
    ],
    [t]
  );

  const selectedQc =
    selectedIndex == null ? undefined : rows?.[selectedIndex].dto;

  const handleRunQc = useCallback(async () => {
    setRunQcOpen(false);
    const instrumentId = instrument?.instrument.id;
    const qualityControl = selectedQc;

    if (instrumentId != null && qualityControl != null) {
      runQc({ instrumentId, qualityControl });
    }

    nav("/");
  }, [instrument?.instrument.id, selectedQc, nav, runQc]);

  const handleAddQCLot = () => setLotEntryOpen(true);
  const handleLotEntryClose = () => setLotEntryOpen(false);
  const handleLotEntryConfirm = () => setLotEntryOpen(false);

  const handleViewQCResults = () => nav(`${selectedQc?.id}/results`);

  const handleBack = () => nav(-1);

  return (
    <QCScreenRoot>
      <QCScreenContentPane data-testid="qc-lots-main-page">
        <QCScreenHeading>
          <SpotText level="h3">
            {t("instrumentScreens.general.qcLots")}
          </SpotText>
        </QCScreenHeading>

        <QCScreenContent>
          {isLoading && <SpinnerOverlay />}
          <QCDataTable
            data-testid={TestId.LotsTable}
            clickable={true}
            sortable={true}
            getRowProps={calculateRowProps}
            columns={columns}
            data={rows}
            onRowsSelected={(indices: number[] | undefined) =>
              setSelectedIndex(indices?.[0])
            }
          />
        </QCScreenContent>
      </QCScreenContentPane>
      <InstrumentPageRightPanel data-testid="qc-page-right">
        <QCButtonCluster
          onRunQc={() => setRunQcOpen(true)}
          runQcDisabled={!selectedQc?.canRun || isRunQcLoading}
          viewResultsDisabled={
            selectedQc == null || selectedQc.mostRecentRunDate == null
          }
          onViewQCResults={handleViewQCResults}
          onAddQCLot={handleAddQCLot}
          onBack={handleBack}
        />
      </InstrumentPageRightPanel>

      {runQcOpen && selectedQc != null && (
        <SediVueDxPrepareQcModal
          open={runQcOpen}
          onClose={() => setRunQcOpen(false)}
          onConfirm={handleRunQc}
          qcLotInfo={selectedQc}
        />
      )}
      {lotEntryOpen ? (
        <SediVueDxQcLotEntryModal
          data-testid={TestId.QCLotEntryModal}
          onClose={handleLotEntryClose}
          onConfirm={handleLotEntryConfirm}
        />
      ) : null}
    </QCScreenRoot>
  );
};

export type { SediVueDxQcScreenProps };
export { SediVueDxQcScreen };
