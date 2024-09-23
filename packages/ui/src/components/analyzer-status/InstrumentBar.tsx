import styled from "styled-components";
import {
  useExitStandbyMutation,
  useGetInstrumentStatusesQuery,
} from "../../api/InstrumentApi";
import { useNavigate } from "react-router-dom";
import { AnalyzerStatus } from "./AnalyzerStatus";
import { useState } from "react";
import {
  InstrumentStatus,
  InstrumentStatusDto,
  InstrumentType,
  ProgressType,
} from "@viewpoint/api";
import { HorizontalScrollContainer } from "./HorizontalScrollContainer";
import { ConfirmModal } from "../confirm-modal/ConfirmModal";
import { Trans, useTranslation } from "react-i18next";
import { CommonTransComponents } from "../../utils/i18n-utils";
import { numberedInstrumentName } from "../../utils/instrument-utils";
import { selectInstrumentProgressFor } from "../../redux/store";
import { useSelector } from "react-redux";

export const TestId = {
  InstrumentBar: "instrument-bar-root",
};

const TestIds = {
  displayedInstruments: "displayed-instruments",
} as const;

const InstrumentBarContainer = styled.div`
  display: flex;
  flex: auto;
  gap: 15px;
  justify-content: center;
  height: 100%;
  padding-right: 50px;
  padding-left: 8px;
`;

const PIMS_INSTRUMENT_TYPES: readonly InstrumentType[] = [
  InstrumentType.InterlinkPims,
  InstrumentType.SerialPims,
] as const;

function includeInstrument(instrumentStatusDto: InstrumentStatusDto) {
  const { instrument } = instrumentStatusDto;
  const { supportsInstrumentScreen, instrumentType } = instrument;
  return (
    supportsInstrumentScreen || PIMS_INSTRUMENT_TYPES.includes(instrumentType)
  );
}

export function InstrumentBar() {
  const [exitStandbyInstrument, setExitStandbyInstrument] =
    useState<InstrumentStatusDto>();
  const { data: instruments } = useGetInstrumentStatusesQuery(undefined, {
    selectFromResult: (res) => ({
      ...res,
      data: [...(res.data ?? [])]
        .filter(includeInstrument)
        .sort(
          (is1, is2) =>
            is1.instrument.displayOrder - is2.instrument.displayOrder
        ),
    }),
  });
  const nav = useNavigate();
  const [exitStandby] = useExitStandbyMutation();
  const { t } = useTranslation();

  const handleInstrumentSelected = (instrumentStatus: InstrumentStatusDto) => {
    if (instrumentStatus.instrumentStatus === InstrumentStatus.Standby) {
      setExitStandbyInstrument(instrumentStatus);
    } else if (
      [InstrumentType.InterlinkPims, InstrumentType.SerialPims].includes(
        instrumentStatus.instrument.instrumentType
      )
    ) {
      nav("/settings/practice_management");
    } else {
      const params = new URLSearchParams();
      if (instrumentStatus.instrumentStatus === InstrumentStatus.Alert) {
        params.set("showAlerts", "true");
      }
      nav(
        `/instruments/${instrumentStatus.instrument.id}?${params.toString()}`
      );
    }
  };

  const handleExitStandby = (instrumentStatus: InstrumentStatusDto) => {
    exitStandby(instrumentStatus.instrument.id);
    setExitStandbyInstrument(undefined);
  };

  return (
    <HorizontalScrollContainer data-testid={TestId.InstrumentBar}>
      <InstrumentBarContainer data-testid={TestIds.displayedInstruments}>
        {instruments?.map((is) => (
          <AnalyzerStatusWithListeners
            key={is.instrument.id}
            instrumentStatus={is}
            onClick={() => handleInstrumentSelected(is)}
          />
        ))}
      </InstrumentBarContainer>
      {exitStandbyInstrument != null && (
        <ConfirmModal
          open={true}
          onClose={() => setExitStandbyInstrument(undefined)}
          onConfirm={() => handleExitStandby(exitStandbyInstrument)}
          bodyContent={
            <Trans
              defaults={t(
                "instrumentScreens.common.exitStandbyModal.content.default"
              )}
              i18nKey={
                `instrumentScreens.common.exitStandbyModal.content.${exitStandbyInstrument.instrument.instrumentType}` as any
              }
              values={{
                instrumentName: t(
                  `instruments.names.${exitStandbyInstrument.instrument.instrumentType}`
                ),
              }}
              components={CommonTransComponents}
            />
          }
          confirmButtonContent={t("general.buttons.ok")}
          cancelButtonContent={t("general.buttons.cancel")}
          headerContent={t("instrumentScreens.common.exitStandbyModal.title")}
          secondaryHeaderContent={t(
            `instruments.names.${exitStandbyInstrument.instrument.instrumentType}`
          )}
        />
      )}
    </HorizontalScrollContainer>
  );
}

interface AnalyzerStatusWithListenersProps {
  instrumentStatus: InstrumentStatusDto;
  onClick: () => void;
}

export function AnalyzerStatusWithListeners(
  props: AnalyzerStatusWithListenersProps
) {
  const { t } = useTranslation();

  const {
    instrumentStatus: {
      instrumentStatus,
      instrument: { id: instrumentId },
    },
  } = props;

  const progressEvent = useSelector(selectInstrumentProgressFor(instrumentId));

  const progress =
    progressEvent?.progressType === ProgressType.PERCENT_COMPLETE &&
    instrumentStatus !== InstrumentStatus.Alert &&
    props.instrumentStatus.instrument.instrumentType !== InstrumentType.SNAP
      ? progressEvent.progress / 100
      : undefined;
  const timeRemaining =
    progressEvent?.progressType === ProgressType.TIME_REMAINING &&
    instrumentStatus !== InstrumentStatus.Alert &&
    props.instrumentStatus.instrument.instrumentType !== InstrumentType.SNAP
      ? progressEvent.progress * 1000
      : undefined;

  const instrumentName =
    props.instrumentStatus.instrument.instrumentType ===
    InstrumentType.InterlinkPims
      ? props.instrumentStatus.instrument.instrumentSerialNumber
      : numberedInstrumentName(
          t,
          props.instrumentStatus.instrument.instrumentType,
          props.instrumentStatus.instrument.displayNumber,
          true
        );

  return (
    <AnalyzerStatus
      onClick={props.onClick}
      instrumentName={instrumentName}
      instrumentType={props.instrumentStatus.instrument.instrumentType}
      status={props.instrumentStatus.instrumentStatus}
      progress={progress}
      timeRemaining={timeRemaining}
    />
  );
}
