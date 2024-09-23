import React, { useMemo, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { ConfirmModal } from "../../../../confirm-modal/ConfirmModal";
import {
  InstrumentDto,
  InstrumentStatus,
  InstrumentType,
  PatientDto,
  TheiaMatchingRunResultDto,
} from "@viewpoint/api";
import { DataTableColumn, SpotText } from "@viewpoint/spot-react/src";
import { useFormatMediumDateTime12h } from "../../../../../utils/hooks/datetime";
import { useFormatPersonalName } from "../../../../../utils/hooks/LocalizationHooks";
import { AnalyzerIcon } from "../../../../analyzer-status/AnalyzerStatus";
import { StickyHeaderDataTable } from "../../../../table/StickyHeaderTable";
import { BloodModalWrapper, TableRoot } from "./blood-common";
import { CommonTransComponents } from "../../../../../utils/i18n-utils";

interface PreviousResultsProps {
  suggestions: TheiaMatchingRunResultDto[];
  onRowsSelected: (suggestion?: TheiaMatchingRunResultDto) => void;
}

function PreviousResultsList({
  suggestions,
  onRowsSelected,
}: PreviousResultsProps) {
  const { t } = useTranslation();
  const formatDateTime = useFormatMediumDateTime12h();
  const formatName = useFormatPersonalName();
  const columns = useMemo(
    () =>
      [
        {
          Header: t("orderFulfillment.bloodMorphology.tableHeaders.analyzer"),
          accessor: (suggestion: TheiaMatchingRunResultDto) => suggestion,
          Cell: ({ value }: { value: TheiaMatchingRunResultDto }) => (
            <div
              data-testid={"previous-result-" + value.instrumentRunId}
              style={{
                display: "flex",
                gap: "5px",
                alignItems: "center",
                padding: "10px 0px",
              }}
            >
              <AnalyzerIcon
                instrumentType={value.instrumentType}
                instrumentStatus={InstrumentStatus.Ready}
              />
              <SpotText level="paragraph">
                {t(`instruments.names.${value.instrumentType}`)}
              </SpotText>
            </div>
          ),
        },
        {
          Header: t("orderFulfillment.bloodMorphology.tableHeaders.runTime"),
          accessor: (run: TheiaMatchingRunResultDto) =>
            formatDateTime(run.testDateUtc * 1000),
          Cell: ({ value }: { value: string }) => (
            <SpotText level="paragraph">{value}</SpotText>
          ),
        },
        {
          Header: t("orderFulfillment.bloodMorphology.tableHeaders.doctor"),
          accessor: (run: TheiaMatchingRunResultDto) =>
            run.doctorDto == null
              ? t("general.placeholder.noValue")
              : formatName(run.doctorDto),
          Cell: ({ value }: { value: string }) => (
            <SpotText level="paragraph">{value}</SpotText>
          ),
        },
      ] as unknown as DataTableColumn<Record<string, unknown>>[],
    [formatDateTime, formatName, t]
  );
  return (
    <TableRoot>
      <StickyHeaderDataTable
        clickable={true}
        sortable={false}
        columns={columns}
        data={suggestions as unknown as Record<string, unknown>[]}
        onRowsSelected={(rows) => {
          onRowsSelected(rows.length === 0 ? undefined : suggestions[rows[0]]);
        }}
      />
    </TableRoot>
  );
}

export interface ImportPreviousResultsModalProps {
  patient: PatientDto;
  suggestions: TheiaMatchingRunResultDto[];
  onSuggestionSelected: (suggestion: TheiaMatchingRunResultDto) => void;
  onClose: () => void;
  onBack: () => void;
}

export function ImportPreviousResultsModal(
  props: ImportPreviousResultsModalProps
) {
  const { t } = useTranslation();
  const [suggestion, setSuggestion] = useState<TheiaMatchingRunResultDto>();
  const valid = suggestion != null;

  const bodyContent = (
    <BloodModalWrapper>
      <SpotText level="secondary">
        <Trans
          i18nKey="orderFulfillment.bloodMorphology.historical.run.instructions"
          values={{ patientName: props.patient.patientName }}
          components={CommonTransComponents}
        />
      </SpotText>
      <PreviousResultsList
        suggestions={props.suggestions}
        onRowsSelected={(suggestion?: TheiaMatchingRunResultDto) => {
          if (suggestion != null) {
            setSuggestion(suggestion);
          } else {
            setSuggestion(undefined);
          }
        }}
      />
    </BloodModalWrapper>
  );

  return (
    <ConfirmModal
      responsive
      headerContent={t(
        "orderFulfillment.bloodMorphology.historical.run.header"
      )}
      secondaryHeaderContent={t(
        "orderFulfillment.bloodMorphology.historical.run.secondaryHeader"
      )}
      bodyContent={bodyContent}
      cancelButtonContent={t("general.buttons.back")}
      confirmButtonContent={t("general.buttons.save")}
      confirmable={valid}
      onConfirm={() => {
        if (valid) {
          props.onSuggestionSelected(suggestion);
        }
      }}
      onClose={valid ? props.onBack : props.onClose}
      open
    ></ConfirmModal>
  );
}
