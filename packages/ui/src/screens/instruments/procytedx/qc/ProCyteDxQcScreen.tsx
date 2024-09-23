import { InstrumentStatusDto, InstrumentType, QcLotDto } from "@viewpoint/api";
import { Button, DataTable, SpotText } from "@viewpoint/spot-react";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import {
  useGetQcLotsQuery,
  useRunQcMutation,
} from "../../../../api/QualityControlApi";
import {
  isFormattable,
  useFormatDate,
  useFormatDateTime12h,
} from "../../../../utils/hooks/datetime";
import {
  InstrumentPageContent,
  InstrumentPageRightPanel,
  InstrumentPageRightPanelButtonContainer,
  InstrumentPageRoot,
} from "../../common-components";
import SpinnerOverlay from "../../../../components/overlay/SpinnerOverlay";
import { Theme } from "../../../../utils/StyleConstants";
import { orderBy } from "lodash";
import { calculateRowProps } from "../../common/QcScreenComponents";
import { skipToken } from "@reduxjs/toolkit/query";
import { ProCyteDxRunQcModal } from "./ProCyteDxRunQcModal";
import { ProCyteDxLotEntryModal } from "./ProCyteDxLotEntryModal";
import { ProCyteDxQcLotInfoModal } from "./ProCyteDxQcLotInfoModal";
import { ProCyteDxExpiredQcWarningModal } from "./ProCyteDxExpiredQcWarningModal";

interface QcLotRow {
  canRun: boolean;
  dto: QcLotDto;
  expiration: number | undefined;
  level: string;
  lot: string;
  type: string;
  recent: number | undefined;
  isExpired: boolean | undefined;

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
    level: qcDto.level,
    isExpired: qcDto.isExpired,
  };
};

interface QCButtonClusterProps {
  onRunQc?: () => void;
  onViewQCResults: () => void;
  onAddQCLot: () => void;
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
  ViewQCResultsButton: "view-all-qc-results-button",
  AddQCLotButton: "add-qc-lot-button",
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
        onClick={props.onViewQCResults}
        disabled={props.viewResultsDisabled}
        data-testid={TestId.ViewQCResultsButton}
      >
        {t("instrumentScreens.general.buttons.viewQCResults")}
      </Button>
      <Button onClick={props.onAddQCLot} data-testid={TestId.AddQCLotButton}>
        {t("instrumentScreens.proCyteDx.buttons.addQCLot")}
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

interface ProCyteDxQcScreenProps {
  instrument?: InstrumentStatusDto;
}

const Root = styled(InstrumentPageRoot)`
  overflow: hidden;
`;

const ContentPane = styled(InstrumentPageContent)`
  display: flex;
  flex-direction: column;
  gap: 20px;
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

const StyledDataTable = styled(DataTable)`
  width: 100%;
  margin: 0;

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

const DateCell = ({ value }: { value: unknown }) => {
  const formatDate = useFormatDate();

  return (
    <>{value != null && isFormattable(value) ? formatDate(value) : "--"}</>
  );
};

const DateTime12hCell = ({ value }: { value: unknown }) => {
  const formatDateTime12h = useFormatDateTime12h();
  return (
    <>
      {value != null && isFormattable(value) ? formatDateTime12h(value) : "--"}
    </>
  );
};

const ProCyteDxQcScreen = ({ instrument }: ProCyteDxQcScreenProps) => {
  const [selectedIndex, setSelectedIndex] = useState<number>();
  const [lotInfoOpen, setLotInfoOpen] = useState(false);
  const [runQcOpen, setRunQcOpen] = useState(false);
  const [expiredQcWarningOpen, setExpiredQcWarningOpen] = useState(false);
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

  const rows = useMemo(
    () =>
      orderBy(
        (qcLotsDtos ?? []).map(dtoToLotRow),
        ["expiration", "lot"],
        ["desc", "asc"]
      ),
    [qcLotsDtos]
  );

  const columns = useMemo(
    () => [
      {
        Header: t("instrumentScreens.proCyteDx.labels.lotNumber"),
        accessor: "lot",
      },
      {
        Header: t("instrumentScreens.proCyteDx.labels.level"),
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

  const [runQc, { isLoading: isRunQcLoading }] = useRunQcMutation();

  const selectedQc =
    selectedIndex == null ? undefined : rows?.[selectedIndex].dto;

  const handleRunQc = useCallback(async () => {
    setRunQcOpen(false);
    const instrumentId = instrument?.instrument.id;
    const qualityControl = selectedQc;

    if (instrumentId != null && qualityControl != null) {
      await runQc({ instrumentId, qualityControl }).unwrap();
    }

    nav("/");
  }, [instrument?.instrument.id, selectedQc, nav, runQc]);

  const handleRunQcButtonClick = () => {
    if (selectedQc?.isExpired) {
      setExpiredQcWarningOpen(true);
    } else {
      setRunQcOpen(true);
    }
  };

  const handleCloseRunQc = () => setRunQcOpen(false);

  const handleContinueRunExpiredQc = () => {
    setExpiredQcWarningOpen(false);
    setRunQcOpen(true);
  };

  const hanldeCancelRunExpiredQc = () => setExpiredQcWarningOpen(false);

  const handleAddQCLot = () => setLotEntryOpen(true);

  const handleViewQCResults = () => nav(`${selectedQc?.id}/results`);

  const handleViewLotInfo = () => setLotInfoOpen(true);

  const handleBack = () => nav(-1);

  return (
    <Root>
      <ContentPane data-testid="qc-lots-main-page">
        <Heading>
          <SpotText level="h3">
            {t("instrumentScreens.general.qcLots")}
          </SpotText>
        </Heading>

        <Content>
          {isLoading && <SpinnerOverlay />}
          <StyledDataTable
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
        </Content>
      </ContentPane>
      <InstrumentPageRightPanel data-testid="qc-page-right">
        <QCButtonCluster
          onRunQc={handleRunQcButtonClick}
          runQcDisabled={!selectedQc?.canRun || isRunQcLoading}
          viewResultsDisabled={
            selectedQc == null || selectedQc.mostRecentRunDate == null
          }
          onViewQCResults={handleViewQCResults}
          onAddQCLot={handleAddQCLot}
          onViewLotInfo={handleViewLotInfo}
          viewLotInfoDisabled={selectedQc == null}
          onBack={handleBack}
        />
      </InstrumentPageRightPanel>

      {selectedQc ? (
        <ProCyteDxQcLotInfoModal
          open={lotInfoOpen}
          onClose={() => setLotInfoOpen(false)}
          instrumentType={InstrumentType.ProCyteDx!}
          qualityControl={selectedQc}
        />
      ) : null}

      {runQcOpen && selectedQc != null && (
        <ProCyteDxRunQcModal
          open={runQcOpen}
          onClose={handleCloseRunQc}
          onConfirm={handleRunQc}
          qcLotInfo={selectedQc}
        />
      )}

      {expiredQcWarningOpen && selectedQc != null && (
        <ProCyteDxExpiredQcWarningModal
          open={expiredQcWarningOpen}
          onClose={hanldeCancelRunExpiredQc}
          onConfirm={handleContinueRunExpiredQc}
        />
      )}

      {lotEntryOpen && instrument != null && (
        <ProCyteDxLotEntryModal
          open={lotEntryOpen}
          onClose={() => setLotEntryOpen(false)}
          onConfirm={() => {
            setLotEntryOpen(false);
          }}
          instrumentStatus={instrument}
        />
      )}
    </Root>
  );
};

export type { ProCyteDxQcScreenProps };
export { ProCyteDxQcScreen };
