import { ConfirmModal } from "../../../components/confirm-modal/ConfirmModal";
import { StickyHeaderDataTable } from "../../../components/table/StickyHeaderTable";
import { useMemo } from "react";
import { CrimsonInstalledReagentDto } from "@viewpoint/api";
import { useTranslation } from "react-i18next";
import { DataTableColumn, SpotText } from "@viewpoint/spot-react";
import styled from "styled-components";
import { useGetReagentHistoryQuery } from "../../../api/ProCyteDxApi";
import { FullSizeSpinner } from "../../../components/spinner/FullSizeSpinner";
import { useFormatDateTime12h } from "../../../utils/hooks/datetime";

export const TestId = {
  Modal: "pdx-reagent-log-modal",
  Spinner: "pdx-reagent-log-spinner",
};

export interface ProCyteDxReagentLogModalProps {
  open: boolean;
  onClose: () => void;

  instrumentId: number;
}

export function ProCyteDxReagentLogModal(props: ProCyteDxReagentLogModalProps) {
  const { data: reagentHistory } = useGetReagentHistoryQuery(
    props.instrumentId
  );
  const { t } = useTranslation();
  return (
    <ConfirmModal
      responsive
      data-testid={TestId.Modal}
      open={props.open}
      onClose={props.onClose}
      onConfirm={props.onClose}
      bodyContent={<ReagentTable reagentData={reagentHistory} />}
      confirmButtonContent={"Done"}
      headerContent={t("instrumentScreens.proCyteDx.fluid.log.title")}
    />
  );
}

const TableRoot = styled.div`
  width: 750px;
  height: 400px;

  .spot-data-table {
    width: 100%;
  }
`;

const EmptyContainer = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

interface ReagentTableProps {
  reagentData?: CrimsonInstalledReagentDto[];
}

function ReagentTable(props: ReagentTableProps) {
  const { t } = useTranslation();
  const formatDateTime = useFormatDateTime12h();
  const columns = useMemo(
    () =>
      [
        {
          Header: t("instrumentScreens.proCyteDx.fluid.log.headers.reagent"),
          accessor: ({ name }: CrimsonInstalledReagentDto) =>
            t(`instrumentScreens.proCyteDx.fluid.log.reagents.${name}` as any),
          id: "reagentColumn",
          Cell: ({ value }: { value?: string }) => (
            <SpotText level="secondary">{value ?? "--"}</SpotText>
          ),
        },
        {
          Header: t("instrumentScreens.proCyteDx.fluid.log.headers.lot"),
          accessor: ({ lotNumber }: CrimsonInstalledReagentDto) => lotNumber,
          id: "lotColumn",
          Cell: ({ value }: { value?: string }) => (
            <SpotText level="secondary">{value ?? "--"}</SpotText>
          ),
        },
        {
          Header: t(
            "instrumentScreens.proCyteDx.fluid.log.headers.changedDate"
          ),
          accessor: ({ changedDate }: CrimsonInstalledReagentDto) =>
            formatDateTime(changedDate),
          id: "changedDateColumn",
          Cell: ({ value }: { value?: string }) => (
            <SpotText level="secondary">{value ?? "--"}</SpotText>
          ),
        },
        {
          Header: t("instrumentScreens.proCyteDx.fluid.log.headers.daysInUse"),

          accessor: ({ daysInUse }: CrimsonInstalledReagentDto) => daysInUse,
          id: "daysInUseColumn",
          Cell: ({ value }: { value?: string }) => (
            <SpotText level="secondary">{value ?? "--"}</SpotText>
          ),
        },
      ] as unknown as DataTableColumn<Record<string, unknown>>[],
    [t, formatDateTime]
  );
  return (
    <TableRoot>
      <StickyHeaderDataTable
        sortable
        columns={columns}
        data={(props.reagentData ?? []) as unknown as Record<string, unknown>[]}
      />
      {props.reagentData == null && (
        <FullSizeSpinner data-testid={TestId.Spinner} />
      )}
      {props.reagentData != null && props.reagentData.length === 0 && (
        <EmptyContainer>
          <SpotText level="secondary">
            {t("general.messages.emptyTable")}
          </SpotText>
        </EmptyContainer>
      )}
    </TableRoot>
  );
}
