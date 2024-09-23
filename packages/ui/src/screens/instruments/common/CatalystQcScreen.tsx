import {
  CatalystQualityControlLotDto,
  InstrumentStatusDto,
  InstrumentType,
  QualityControlDto,
} from "@viewpoint/api";
import { Button, SpotText } from "@viewpoint/spot-react";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import {
  useGetCatalystQcLotsQuery,
  useRunQcMutation,
} from "../../../api/QualityControlApi";
import {
  InstrumentPageRightPanel,
  InstrumentPageRightPanelButtonContainer,
} from "../common-components";
import SpinnerOverlay from "../../../components/overlay/SpinnerOverlay";
import { QCResultsModal } from "../../../components/qc/QCResultsModal";
import { orderBy } from "lodash";
import { QCLotInfoModal } from "../../../components/qc/QCLotInfoModal";
import {
  calculateRowProps,
  QCDataTable,
  QCScreenContent,
  QCScreenContentPane,
  QCScreenHeading,
  QCScreenRoot,
} from "./QcScreenComponents";
import {
  CatOneFluidPrepWizard,
  CatOneFluidPrepWizardProps,
} from "../catone/qc/CatOneFluidPrepWizard";
import { DateCell } from "../../../components/table/DateCell";
import { DateTime12hCell } from "../../../components/table/DateTime12hCell";
import { skipToken } from "@reduxjs/toolkit/query";
import { CatOneQcFluid } from "../catone/qc/utils";

interface QcLotRow {
  lot: string;
  type: string;
  expiration: number | undefined;
  recent: number | undefined;

  canRun: boolean;
  dto: QualityControlDto;

  [key: string]: unknown;
}

const dtoToLotRow = (qcDto: QualityControlDto): QcLotRow => {
  const lotRow: QcLotRow = {
    dto: qcDto,
    lot: qcDto.lotNumber!,
    type: (qcDto as CatalystQualityControlLotDto).controlType,
    expiration: qcDto.dateExpires,
    recent: qcDto.mostRecentRunDate,
    canRun: qcDto.canRun || false,
  };

  return lotRow;
};

interface QCButtonClusterProps {
  onRunQc?: () => void;
  onViewAllResults: () => void;
  onViewResults?: () => void;
  onViewLotInfo?: () => void;
  onBack?: () => void;

  runQcDisabled?: boolean;
  viewLotInfoDisabled?: boolean;
  viewResultsDisabled?: boolean;
}

const StyledButton = styled(Button)`
  && {
    height: auto;
    padding: 10px 0;
  }
`;

export const TestId = {
  LotsTable: "lots-table",
  RunQCButton: "run-qc-button",
  ViewAllResultsButton: "view-all-qc-results-button",
  ViewLotResultsButton: "view-qc-lot-results-button",
  ViewLotInfoButton: "view-qc-lot-info-button",
  BackButton: "qc-back-button",
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
        onClick={props.onViewAllResults}
        data-testid={TestId.ViewAllResultsButton}
      >
        {t("instrumentScreens.general.buttons.viewAllQCResults")}
      </Button>
      <Button
        onClick={props.onViewResults}
        disabled={props.viewResultsDisabled}
        data-testid={TestId.ViewLotResultsButton}
      >
        {t("instrumentScreens.general.buttons.viewLotResults")}
      </Button>
      <StyledButton
        onClick={props.onViewLotInfo}
        disabled={props.viewLotInfoDisabled}
        data-testid={TestId.ViewLotInfoButton}
      >
        {t("instrumentScreens.general.buttons.viewQCLotInfo")}
      </StyledButton>
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

interface CatalystQcScreenProps {
  instrument?: InstrumentStatusDto;
}

const CatalystQcScreen = ({ instrument }: CatalystQcScreenProps) => {
  const [selectedIndex, setSelectedIndex] = useState<number>();
  const [viewingSingleLotResults, setViewingSingleLotResults] = useState(false);
  const [viewingAllResults, setViewingAllResults] = useState(false);
  const [lotInfoOpen, setLotInfoOpen] = useState(false);
  // state that maintains data for the currently shown instance of the CatOneFluidPrepWizard, closes wizard when undefined
  const [qcWizardData, setQcWizardData] =
    useState<Omit<CatOneFluidPrepWizardProps, "onCancel" | "onDone">>();

  const { t } = useTranslation();
  const nav = useNavigate();

  const { data: qcLotsDtos, isLoading } = useGetCatalystQcLotsQuery(
    instrument != null
      ? {
          instrumentId: instrument.instrument.id,
          instrumentType: instrument.instrument.instrumentType,
          filter: "QualityControl",
        }
      : skipToken
  );

  const rows = useMemo(
    () =>
      orderBy(
        (qcLotsDtos ?? []).map(dtoToLotRow),
        ["type", "lot"],
        ["desc", "asc"]
      ),
    [qcLotsDtos]
  );

  const columns = useMemo(
    () => [
      {
        Header: t("instrumentScreens.general.labels.qcLot"),
        accessor: "lot",
      },
      {
        Header: t("instrumentScreens.general.labels.qcType"),
        accessor: "type",
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

  const [runQc, { isLoading: isRunQcLoading }] = useRunQcMutation();

  const selectedRow = selectedIndex == null ? undefined : rows?.[selectedIndex];
  const selectedQc = selectedRow?.dto;
  const selectedQcType = selectedRow?.type;

  const matchedCatOneQcFluid: string | undefined = useMemo(() => {
    /*Note that the matching here is intentionally not exact, we only expect that the QC fluid type string contain one
     * of the known substrings.*/
    return Object.values(CatOneQcFluid).find(
      (value) =>
        selectedQcType != null &&
        selectedQcType.toLowerCase().includes(value.toLowerCase())
    );
  }, [selectedQcType]);

  const executeQc = useCallback(async () => {
    const instrumentId = instrument?.instrument.id;
    const qualityControl = selectedQc;

    if (instrumentId != null && qualityControl != null) {
      await runQc({ instrumentId, qualityControl }).unwrap();
    }

    nav("/");
  }, [runQc, instrument?.instrument.id, selectedQc, nav]);

  const handleRunQc = useCallback(() => {
    const instrumentType = instrument?.instrument.instrumentType;

    switch (instrumentType) {
      case InstrumentType.CatalystDx:
        // CatDx does not have and QC fluid prep wizards, just execute the QC run
        executeQc();
        break;
      case InstrumentType.CatalystOne:
        if (matchedCatOneQcFluid != null && selectedQc && instrument) {
          setQcWizardData({
            qcFluidType: matchedCatOneQcFluid,
            qualityControl: selectedQc,
            instrumentStatusDto: instrument,
          });
        } else {
          /*If the selected QC fluid type does not match one in the set known to map to a qc prep wizard, send the QC run request
           * immediately without showing a wizard. This matches FX client functionality put in place because IVLS does not own
           * available QC lot data. i.e. - it's possible a Catalyst may provide a fluid type that does not map to a known
           * QC fluid type.*/
          executeQc();
        }
        break;
      default:
        break;
    }
  }, [matchedCatOneQcFluid, executeQc, instrument, selectedQc]);

  const handleViewResults = useCallback(() => {
    setViewingAllResults(false);
    setViewingSingleLotResults(true);
  }, [setViewingAllResults, setViewingSingleLotResults]);

  const handleViewAllResults = useCallback(() => {
    setViewingSingleLotResults(false);
    setViewingAllResults(true);
  }, [setViewingAllResults, setViewingSingleLotResults]);

  const handleViewLotInfo = useCallback(() => {
    setLotInfoOpen(true);
  }, [setLotInfoOpen]);

  const handleBack = useCallback(() => {
    nav(-1);
  }, [nav]);

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
      <InstrumentPageRightPanel data-testid="catalyst-qc-page-right">
        <QCButtonCluster
          onRunQc={handleRunQc}
          runQcDisabled={!selectedQc?.canRun || isRunQcLoading}
          onViewResults={handleViewResults}
          viewResultsDisabled={selectedQc == null}
          onViewAllResults={handleViewAllResults}
          onViewLotInfo={handleViewLotInfo}
          viewLotInfoDisabled={selectedQc == null}
          onBack={handleBack}
        />
      </InstrumentPageRightPanel>

      {selectedQc && selectedQc.instrumentType && (
        <QCLotInfoModal
          open={lotInfoOpen}
          onClose={() => setLotInfoOpen(false)}
          instrumentType={selectedQc.instrumentType}
          qualityControl={selectedQc}
        />
      )}

      {instrument != null && (
        <QCResultsModal
          visible={viewingAllResults || viewingSingleLotResults}
          onClose={() => {
            setViewingAllResults(false);
            setViewingSingleLotResults(false);
          }}
          qualityControl={viewingSingleLotResults ? selectedQc : undefined}
          instrumentId={instrument.instrument.id}
          instrumentSerialNumber={instrument.instrument.instrumentSerialNumber}
          instrumentType={instrument.instrument.instrumentType}
          onViewResults={(record) => nav(`/labRequest/${record.labRequestId}`)}
        />
      )}

      {qcWizardData && (
        <CatOneFluidPrepWizard
          {...qcWizardData}
          onCancel={() => {
            setQcWizardData(undefined);
          }}
          onDone={() => {
            setQcWizardData(undefined);
            nav("/");
          }}
        />
      )}
    </QCScreenRoot>
  );
};

export type { CatalystQcScreenProps };
export { CatalystQcScreen };
