import { InstrumentStatusDto } from "@viewpoint/api";
import { SpotText, Button } from "@viewpoint/spot-react";
import {
  calculateRowProps,
  QCDataTable,
  QCScreenContent,
  QCScreenContentPane,
  QCScreenHeading,
  QCScreenRoot,
} from "../common/QcScreenComponents";
import SpinnerOverlay from "../../../components/overlay/SpinnerOverlay";
import {
  InstrumentPageRightPanel,
  InstrumentPageRightPanelButtonContainer,
} from "../common-components";
import { QCResultsModal } from "../../../components/qc/QCResultsModal";
import { useTranslation } from "react-i18next";
import { useMemo, useState } from "react";
import { useGetQcLotsQuery } from "../../../api/QualityControlApi";
import { orderBy } from "lodash";
import { useNavigate } from "react-router-dom";
import { DateCell } from "../../../components/table/DateCell";
import { DateTime12hCell } from "../../../components/table/DateTime12hCell";

export interface VetTestQcScreenProps {
  instrument: InstrumentStatusDto;
}

export function VetTestQcScreen(props: VetTestQcScreenProps) {
  const [viewingResults, setViewingResults] = useState(false);
  const [viewingSingleLotResults, setViewingSingleLotResults] = useState(false);
  const [selectedLotIndex, setSelectedLotIndex] = useState<number>();

  const { t } = useTranslation();
  const nav = useNavigate();

  const { data: qcLotsDtos, isLoading } = useGetQcLotsQuery({
    instrumentId: props.instrument.instrument.id,
    instrumentType: props.instrument.instrument.instrumentType,
  });

  const rows = useMemo(
    () => orderBy(qcLotsDtos, ["dateExpires"], ["desc"]),
    [qcLotsDtos]
  );

  const columns = useMemo(
    () => [
      {
        Header: t("instrumentScreens.general.labels.qcLot"),
        accessor: "lotNumber",
      },
      {
        Header: t("instrumentScreens.general.labels.expirationDate"),
        accessor: "dateExpires",
        Cell: DateCell,
      },
      {
        Header: t("instrumentScreens.general.labels.mostRecentResults"),
        accessor: "mostRecentRunDate",
        Cell: DateTime12hCell,
      },
    ],
    [t]
  );

  const selectedLot =
    selectedLotIndex == null ? undefined : rows?.[selectedLotIndex];

  return (
    <QCScreenRoot>
      <QCScreenContentPane data-testid="vettest-qc-page-main">
        <QCScreenHeading>
          <SpotText level="h3">
            {t("instrumentScreens.general.qcLots")}
          </SpotText>
        </QCScreenHeading>

        <QCScreenContent>
          {isLoading && <SpinnerOverlay />}
          <QCDataTable
            clickable={true}
            sortable={true}
            getRowProps={calculateRowProps}
            columns={columns}
            data={rows as unknown as Record<string, unknown>[]}
            onRowsSelected={(indices: number[] | undefined) =>
              setSelectedLotIndex(indices?.[0])
            }
          />
        </QCScreenContent>
      </QCScreenContentPane>
      <InstrumentPageRightPanel data-testid="vettest-qc-page-right">
        <InstrumentPageRightPanelButtonContainer>
          <Button
            onClick={() => {
              setViewingResults(true);
              setViewingSingleLotResults(false);
            }}
          >
            {t("instrumentScreens.general.buttons.viewAllQCResults")}
          </Button>
          <Button
            onClick={() => {
              setViewingSingleLotResults(true);
              setViewingResults(false);
            }}
            disabled={selectedLotIndex == null}
          >
            {t("instrumentScreens.general.buttons.viewLotResults")}
          </Button>
          <Button buttonType="secondary" onClick={() => nav(-1)}>
            {t("general.buttons.back")}
          </Button>
        </InstrumentPageRightPanelButtonContainer>
      </InstrumentPageRightPanel>

      <QCResultsModal
        visible={viewingResults || viewingSingleLotResults}
        qualityControl={viewingSingleLotResults ? selectedLot : undefined}
        onClose={() => {
          setViewingResults(false);
          setViewingSingleLotResults(false);
        }}
        instrumentId={props.instrument.instrument.id}
        instrumentSerialNumber={
          props.instrument.instrument.instrumentSerialNumber
        }
        instrumentType={props.instrument.instrument.instrumentType}
        onViewResults={(record) => nav(`/labRequest/${record.labRequestId}`)}
      />
    </QCScreenRoot>
  );
}
