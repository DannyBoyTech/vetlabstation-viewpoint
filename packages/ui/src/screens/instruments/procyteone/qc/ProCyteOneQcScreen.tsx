import {
  AcadiaQualityControlLotDto,
  InstrumentStatusDto,
  MostRecentResultEnum,
} from "@viewpoint/api";
import { Button, SpotText } from "@viewpoint/spot-react";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { skipToken } from "@reduxjs/toolkit/query";
import { useGetProCyteOneQcLotsQuery } from "../../../../api/ProCyteOneQualityControlApi";
import { useRunSmartQcMutation } from "../../../../api/QualityControlApi";
import {
  InstrumentPageRightPanel,
  InstrumentPageRightPanelButtonContainer,
} from "../../common-components";
import SpinnerOverlay from "../../../../components/overlay/SpinnerOverlay";
import { ProCyteOneResultsModal } from "./ProCyteOneResultsModal";
import { orderBy } from "lodash";
import { QCLotInfoModal } from "../../../../components/qc/QCLotInfoModal";
import { ReplaceQcModal } from "../ReplaceQcModal";
import { RunQCModal } from "./RunQCModal";
import { PrintPreview } from "../../../../components/print-preview/PrintPreview";
import {
  calculateRowProps,
  QCDataTable,
  QCScreenContent,
  QCScreenContentPane,
  QCScreenHeading,
  QCScreenRoot,
} from "../../common/QcScreenComponents";
import styled from "styled-components";
import { DateTime12hCell } from "../../../../components/table/DateTime12hCell";
import { DateCell } from "../../../../components/table/DateCell";

interface QcLotRow {
  lotNumber: string;
  expirationDate: Date | undefined;
  recentRunDate: Date | undefined;
  mostRecentResult: string | undefined;
  canRun: boolean;
  dto: AcadiaQualityControlLotDto;

  [key: string]: unknown;
}

const dtoToLotRow = (qcDto: AcadiaQualityControlLotDto): QcLotRow => ({
  dto: qcDto,
  lotNumber: qcDto.lotNumber!,
  expirationDate: qcDto.expirationOpenDate,
  recentRunDate: qcDto.mostRecentRunDate,
  mostRecentResult: qcDto.mostRecentResult,
  canRun: qcDto.canRun || false,
});

interface QCButtonClusterProps {
  onRunQc?: () => void;
  onChangeQC: () => void;
  onViewResults?: () => void;
  onBack?: () => void;

  runQcDisabled?: boolean;
  viewResultsDisabled?: boolean;
}

export const TestId = {
  LotsTable: "lots-table",
  LotInfoModal: "lot-info-modal",
  RunQCButton: "run-qc-button",
  RunQCModal: "run-qc-modal",
  ChangeQCButton: "change-qc-button",
  ChangeQCModal: "change-qc-modal",
  ViewResultsModal: "",
  ViewResultsButton: "view-results-button",
  BackButton: "qc-back-button",
  PrintPreview: "print-results",
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
      <Button onClick={props.onChangeQC} data-testid={TestId.ChangeQCButton}>
        {t("instrumentScreens.general.buttons.changeQC")}
      </Button>
      <Button
        onClick={props.onViewResults}
        disabled={props.viewResultsDisabled}
        data-testid={TestId.ViewResultsButton}
      >
        {t("instrumentScreens.general.buttons.viewQCResults")}
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

const StyledSpan = styled.span<{ isOutOfRange: boolean }>`
  ${(props) => props.isOutOfRange && `color: red`};
`;

interface ProCyteOneQcScreenProps {
  instrument?: InstrumentStatusDto;
}

const ProCyteOneQcScreen = ({ instrument }: ProCyteOneQcScreenProps) => {
  const [selectedIndex, setSelectedIndex] = useState<number>();
  const [viewingAllResults, setViewingAllResults] = useState(false);
  const [lotInfoOpen, setLotInfoOpen] = useState(false);
  const [changeQCOpen, setChangeQCOpen] = useState(false);
  const [runQCOpen, setRunQCOpen] = useState(false);

  const [runSmartQc] = useRunSmartQcMutation();
  const [printOpen, setPrintOpen] = useState(false);
  const [printUrl, setPrintUrl] = useState("");

  const { t } = useTranslation();
  const nav = useNavigate();

  const { data: qcLotsDtos, isLoading } = useGetProCyteOneQcLotsQuery(
    instrument != null
      ? {
          instrumentId: instrument.instrument.id,
          filter: "QualityControl",
        }
      : skipToken
  );

  const rows = useMemo(
    () =>
      orderBy((qcLotsDtos ?? []).map(dtoToLotRow), ["recentRunDate"], ["desc"]),
    [qcLotsDtos]
  );

  const columns = useMemo(
    () => [
      {
        Header: t("instrumentScreens.proCyteOne.labels.lotNumber"),
        accessor: "lotNumber",
      },
      {
        Header: t("instrumentScreens.proCyteOne.labels.runTime"),
        accessor: "recentRunDate",
        Cell: DateTime12hCell,
      },
      {
        Header: t("instrumentScreens.general.labels.expirationDate"),
        accessor: "expirationDate",
        Cell: DateCell,
      },
      {
        Header: t("instrumentScreens.general.labels.mostRecentResults"),
        accessor: "mostRecentResult",
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
    ],
    [t]
  );

  const selectedQc =
    selectedIndex == null ? undefined : rows?.[selectedIndex].dto;

  const handleViewResults = useCallback(() => {
    setViewingAllResults(true);
  }, [setViewingAllResults]);

  const handlePrintResults = (printUrl: string) => {
    setPrintUrl(printUrl);
    setPrintOpen(true);
  };

  const handleRunQC = () => setRunQCOpen(true);
  const handleRunQCClose = () => setRunQCOpen(false);
  const handleRunQCConfirm = () => {
    setRunQCOpen(false);

    if (instrument?.instrument.id) {
      runSmartQc(instrument.instrument.id);
    }

    nav("/");
  };

  const handleChangeQC = () => setChangeQCOpen(true);
  const handleChangeQCClose = () => setChangeQCOpen(false);
  const handleChangeQCConfirm = () => setChangeQCOpen(false);

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
      <InstrumentPageRightPanel data-testid="pco-qc-page-right">
        <QCButtonCluster
          onRunQc={handleRunQC}
          runQcDisabled={false}
          onViewResults={handleViewResults}
          onChangeQC={handleChangeQC}
          viewResultsDisabled={selectedQc == null}
          onBack={handleBack}
        />
      </InstrumentPageRightPanel>

      {selectedQc?.instrumentType != null ? (
        <QCLotInfoModal
          data-testid={TestId.LotInfoModal}
          open={lotInfoOpen}
          onClose={() => setLotInfoOpen(false)}
          instrumentType={selectedQc.instrumentType}
          qualityControl={selectedQc as QcLotRow}
        />
      ) : null}

      {changeQCOpen ? (
        <ReplaceQcModal
          data-testid={TestId.ChangeQCModal}
          onClose={handleChangeQCClose}
          onConfirm={handleChangeQCConfirm}
        />
      ) : null}

      {runQCOpen ? (
        <RunQCModal
          data-testid={TestId.RunQCModal}
          onClose={handleRunQCClose}
          onConfirm={handleRunQCConfirm}
        />
      ) : null}

      {instrument != null && (
        <ProCyteOneResultsModal
          data-testid={TestId.ViewResultsModal}
          visible={viewingAllResults}
          dismissable={!printOpen}
          onClose={() => setViewingAllResults(false)}
          qualityControl={selectedQc as QcLotRow}
          instrumentId={instrument.instrument.id}
          instrumentSerialNumber={instrument.instrument.instrumentSerialNumber}
          instrumentType={instrument.instrument.instrumentType}
          onPrintResults={handlePrintResults}
        />
      )}
      {printOpen ? (
        <PrintPreview
          data-testid={TestId.PrintPreview}
          headerContent={t("printResultsModal.title")}
          url={printUrl}
          open={true}
          onClose={() => setPrintOpen(false)}
          onConfirm={() => setPrintOpen(false)}
          printJobName={t("general.printJobs.resultsReport")}
        />
      ) : null}
    </QCScreenRoot>
  );
};

export type { ProCyteOneQcScreenProps };
export { ProCyteOneQcScreen };
