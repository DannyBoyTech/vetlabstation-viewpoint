import styled from "styled-components";
import { InstrumentRunDto } from "@viewpoint/api";
import { Trans, useTranslation } from "react-i18next";
import { useMemo } from "react";
import { CardBody, DataTableColumn, SpotText } from "@viewpoint/spot-react";
import { SpotIcon } from "@viewpoint/spot-icons";
import { useFormatDateTime12h } from "../../../utils/hooks/datetime";
import { CommonTransComponents } from "../../../utils/i18n-utils";
import { StickyHeaderDataTable } from "../../table/StickyHeaderTable";
import { CardContent, StyledCard } from "./common-components";

const EditResultsRoot = styled.div`
  display: flex;
  gap: 18px;
  width: 675px;
`;
const ListRoot = styled.div`
  flex: 2;
`;
const Spacer = styled.div`
  margin-top: 18px;
`;

interface EditResultsContentProps {
  editableRuns: InstrumentRunDto[];
  labRequestId: number;
  onRunSelected: (runId?: number) => void;
  selectedRunId?: number;
}

export function EditResultsContent(props: EditResultsContentProps) {
  const formatDate = useFormatDateTime12h();
  const { t } = useTranslation();

  const columns = useMemo(
    () =>
      [
        {
          Header: "Service Category",
          accessor: (run: InstrumentRunDto) =>
            t(
              `ServiceCategory.${run.serviceCategory}`,
              t("general.placeholder.noValue")
            ) as string,
          id: "categoryColumn",
          Cell: ({ value }: { value: string }) => (
            <SpotText level="secondary">{value}</SpotText>
          ),
        },
        {
          Header: "Instrument",
          accessor: (run: InstrumentRunDto) =>
            t(
              (run.snapDeviceDto?.displayNamePropertyKey as any) ??
                `instruments.names.${run.instrumentType}`
            ),
          id: "instrumentColumn",
          Cell: ({ value }: { value: string }) => (
            <SpotText level="secondary">{value}</SpotText>
          ),
        },
        {
          Header: "Run Date",
          accessor: (run: InstrumentRunDto) =>
            run.testDate == null
              ? t("general.placeholder.noValue")
              : formatDate(run.testDate),
          id: "runDateColumn",
          Cell: ({ value }: { value: string }) => (
            <SpotText level="secondary">{value}</SpotText>
          ),
        },
      ] as unknown as DataTableColumn<Record<string, unknown>>[],
    [formatDate, t]
  );

  return (
    <EditResultsRoot>
      <StyledCard variant="secondary">
        <CardBody>
          <SpotIcon name={"edit"} />
          <CardContent>
            <Trans
              i18nKey={"resultsPage.manageResults.descriptions.editResults"}
              components={CommonTransComponents}
            />
            <Spacer />
            <Trans
              i18nKey={
                "resultsPage.manageResults.descriptions.editResultsInstructions"
              }
              components={CommonTransComponents}
            />
          </CardContent>
        </CardBody>
      </StyledCard>

      <ListRoot>
        <StickyHeaderDataTable
          clickable
          columns={columns}
          onRowsSelected={(indices) =>
            props.onRunSelected(props.editableRuns[indices[0]]?.id)
          }
          data={
            (props.editableRuns ?? []) as unknown as Record<string, unknown>[]
          }
        ></StickyHeaderDataTable>
      </ListRoot>
    </EditResultsRoot>
  );
}
