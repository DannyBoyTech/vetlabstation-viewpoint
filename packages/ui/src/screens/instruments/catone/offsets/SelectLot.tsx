import { Spinner, SpotText } from "@viewpoint/spot-react";
import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import {
  CatalystQualityControlLotDto,
  InstrumentType,
  OffsetsDto,
  QcLotsFilters,
} from "@viewpoint/api";
import { useGetCatalystQcLotsQuery } from "../../../../api/QualityControlApi";
import { StickyHeaderDataTable } from "../../../../components/table/StickyHeaderTable";
import { Theme } from "../../../../utils/StyleConstants";
import classNames from "classnames";
import { DateCell } from "../../../../components/table/DateCell";

const Root = styled.div`
  flex: auto;
  display: flex;
  gap: 50px;
  padding: 20px;
`;

const PromptColumn = styled.div`
  flex: 1;
`;

const LotsColumn = styled.div`
  flex: 1.6;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  > div {
    width: 100%;
  }

  .spot-loading-spinner {
    position: absolute;
  }
`;

const LotsTable = styled(StickyHeaderDataTable)`
  tbody tr.expired {
    color: ${(p: { theme: Theme }) => p.theme.colors?.text?.disabled};
  }
`;
LotsTable.displayName = "LotsTable";

/**
 * Transforms the props for each row based on the data context (meta) and
 * existing props like className (among others).
 *
 * @param currentProps - props on the existing row
 * @param meta - the react-datatable (v7) metadata
 * @returns new props
 */
function transformLotsTableRowProps(
  currentProps: Record<string, unknown>,
  meta: any
) {
  const nextProps = { ...currentProps };

  const currentClasses =
    typeof currentProps.className === "string"
      ? currentProps.className
      : undefined;

  const expiredClass =
    meta?.row?.original?.canRun !== true ? "expired" : undefined;

  const nextClasses = classNames(currentClasses, expiredClass);

  if (nextClasses) {
    nextProps.className = nextClasses;
  }

  return nextProps;
}

function toOffsetsDto(catQcLot: CatalystQualityControlLotDto): OffsetsDto {
  const calibrationVersion = catQcLot.calibrationVersion;
  const controlType = catQcLot.controlType;
  const expirationDate = catQcLot.dateExpires ?? NaN;
  const lotNumber = catQcLot.lotNumber ?? "";

  return {
    calibrationVersion,
    controlType,
    expirationDate,
    lotNumber,
  };
}

export interface SelectLotProps {
  instrumentId: number;
  onSelection?: (selection?: OffsetsDto) => void;
}

export function SelectLot(props: SelectLotProps) {
  const { t } = useTranslation();
  const { currentData: lots, isFetching: lotsLoading } =
    useGetCatalystQcLotsQuery({
      filter: QcLotsFilters.Offsets,
      instrumentId: props.instrumentId,
      instrumentType: InstrumentType.CatalystOne,
    });

  const data = useMemo(
    () => (lots as CatalystQualityControlLotDto[] | undefined) ?? [],
    [lots]
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
    ],
    [t]
  );

  const { onSelection } = props;
  const handleRowsSelected = useCallback(
    (selectedIndices: number[]) => {
      const selected =
        selectedIndices.length > 0 ? data[selectedIndices[0]] : undefined;

      onSelection?.(selected != null ? toOffsetsDto(selected) : undefined);
    },
    [onSelection, data]
  );

  return (
    <Root>
      <PromptColumn>
        <SpotText level="paragraph">
          {t("instrumentScreens.catOne.offsetsWizard.selectLot.prompt")}
        </SpotText>
      </PromptColumn>
      <LotsColumn className="lots-column">
        <LotsTable
          clickable={true}
          sortable={true}
          columns={columns}
          data={data as unknown as Record<string, unknown>[]}
          getRowProps={transformLotsTableRowProps}
          onRowsSelected={handleRowsSelected}
        />
        {lotsLoading && <Spinner size="large" />}
      </LotsColumn>
    </Root>
  );
}
