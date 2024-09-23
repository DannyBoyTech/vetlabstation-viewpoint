import React, { useMemo, useState } from "react";
import { ConfirmModal } from "../../../../confirm-modal/ConfirmModal";
import { InstrumentDto, InstrumentStatus } from "@viewpoint/api";
import { useTranslation } from "react-i18next";
import { DataTableColumn, SpotText } from "@viewpoint/spot-react/src";
import { AnalyzerIcon } from "../../../../analyzer-status/AnalyzerStatus";
import { StickyHeaderDataTable } from "../../../../table/StickyHeaderTable";
import { BloodModalWrapper, TableRoot } from "./blood-common";

interface HematologyInstrumentsProps {
  hematologyInstruments: InstrumentDto[];
  onRowsSelected: (instrument?: InstrumentDto) => void;
}

function HematologyInstrumentsList({
  hematologyInstruments,
  onRowsSelected,
}: HematologyInstrumentsProps) {
  const { t } = useTranslation();
  const columns = useMemo(
    () =>
      [
        {
          Header: t("orderFulfillment.bloodMorphology.tableHeaders.analyzer"),
          accessor: (instrument: InstrumentDto) => instrument,
          Cell: ({ value }: { value: InstrumentDto }) => (
            <div
              data-testid={
                "hematology-instrument-" + value.instrumentSerialNumber
              }
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
          Header: t("instrumentScreens.general.labels.serialNumber"),
          accessor: (instrument: InstrumentDto) => instrument,
          Cell: ({ value }: { value: InstrumentDto }) => (
            <SpotText level="paragraph">
              {value.instrumentSerialNumber}
            </SpotText>
          ),
        },
      ] as unknown as DataTableColumn<Record<string, unknown>>[],
    [t]
  );
  return (
    <TableRoot>
      <StickyHeaderDataTable
        clickable={true}
        sortable={false}
        columns={columns}
        data={hematologyInstruments as unknown as Record<string, unknown>[]}
        onRowsSelected={(rows) => {
          onRowsSelected(
            rows.length === 0 ? undefined : hematologyInstruments[rows[0]]
          );
        }}
      />
    </TableRoot>
  );
}

export interface SelectHematologyInstrumentsModalProps {
  hematologyInstruments: InstrumentDto[];
  onHematologyInstrumentSelected: (instrument: InstrumentDto) => void;
  onClose: () => void;
  onBack: () => void;
}

export function SelectHematologyInstrumentsModal(
  props: SelectHematologyInstrumentsModalProps
) {
  const { t } = useTranslation();
  const [hematologyInstrument, setHematologyInstrument] =
    useState<InstrumentDto>();
  const valid = hematologyInstrument != null;

  const bodyContent = (
    <BloodModalWrapper>
      <SpotText level="secondary">
        {t("orderFulfillment.bloodMorphology.hematology.run.instructions")}
      </SpotText>
      <HematologyInstrumentsList
        hematologyInstruments={props.hematologyInstruments}
        onRowsSelected={(hematologyInstrument?: InstrumentDto) => {
          if (hematologyInstrument != null) {
            setHematologyInstrument(hematologyInstrument);
          } else {
            setHematologyInstrument(undefined);
          }
        }}
      />
    </BloodModalWrapper>
  );

  return (
    <ConfirmModal
      responsive
      headerContent={t(
        "orderFulfillment.bloodMorphology.hematology.run.header"
      )}
      secondaryHeaderContent={t(
        "orderFulfillment.bloodMorphology.hematology.run.secondaryHeader"
      )}
      bodyContent={bodyContent}
      cancelButtonContent={t("general.buttons.back")}
      confirmButtonContent={t("general.buttons.next")}
      confirmable={valid}
      onConfirm={() => {
        if (valid) {
          props.onHematologyInstrumentSelected(hematologyInstrument);
        }
      }}
      onClose={valid ? props.onBack : props.onClose}
      open
    ></ConfirmModal>
  );
}
