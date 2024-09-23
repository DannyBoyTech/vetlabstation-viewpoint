import styled from "styled-components";
import { Button, SpotText } from "@viewpoint/spot-react";
import { useNavigate, useParams } from "react-router-dom";
import { Trans, useTranslation } from "react-i18next";
import { FullSizeSpinner } from "../../../components/spinner/FullSizeSpinner";
import { useEventLogQuery } from "../../../api/InstrumentApi";
import {
  useFormatDateTime12h,
  useFormatLongDateTime12h,
} from "../../../utils/hooks/datetime";
import { EventLogDto, InstrumentType } from "@viewpoint/api";
import { ReactNode, useMemo, useState } from "react";
import {
  InstrumentPageContent,
  InstrumentPageRightPanel,
  InstrumentPageRightPanelButtonContainer,
  InstrumentPageRoot,
} from "../common-components";
import { useGetInstrumentQuery } from "../../../api/InstrumentApi";
import { skipToken } from "@reduxjs/toolkit/query";
import { useHeaderTitle } from "../../../utils/hooks/hooks";
import { StickyHeaderDataTable } from "../../../components/table/StickyHeaderTable";
import { BasicModal } from "../../../components/basic-modal/BasicModal";
import { CommonTransComponents } from "../../../utils/i18n-utils";
import { I18nNs } from "../../../i18n/config";

const Root = styled(InstrumentPageRoot)`
  overflow: hidden;
`;

const Content = styled(InstrumentPageContent)`
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow: hidden;
`;

const EventLogTable = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow-y: hidden;
`;

const NoMatchingResults = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const NoWrapText = styled(SpotText)`
  white-space: nowrap;
`;

function clientShouldTranslateEvents(instrumentType?: InstrumentType) {
  return instrumentType === InstrumentType.ProCyteOne;
}

export function EventLogScreen() {
  const [selectedIndex, setSelectedIndex] = useState<number>();
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const nav = useNavigate();
  const { t } = useTranslation();
  const formatDate = useFormatDateTime12h();

  const { instrumentId: instrumentIdParam } = useParams();

  const { data: instrument } = useGetInstrumentQuery(
    Number(instrumentIdParam!)
  );

  const instrumentType = instrument?.instrument.instrumentType;

  const { data: records, isLoading } = useEventLogQuery(
    instrument == null
      ? skipToken
      : {
          identifier: instrument?.instrument.instrumentSerialNumber,
        }
  );

  const selectedEvent =
    selectedIndex != null ? records?.[selectedIndex] : undefined;

  const { title: selectedEventTitle, details: selectedEventDetails } =
    useMemo(() => {
      if (selectedEvent == null) {
        return {};
      }

      if (clientShouldTranslateEvents(instrumentType)) {
        return {
          title: (
            <Trans
              i18nKey={`${instrumentType}.${selectedEvent?.code}.title` as any}
              values={selectedEvent?.args}
              ns={I18nNs.Alerts}
            />
          ),
          details: (
            <Trans
              i18nKey={`${instrumentType}.${selectedEvent?.code}.body` as any}
              values={selectedEvent?.args}
              ns={I18nNs.Alerts}
              components={CommonTransComponents}
            />
          ),
        };
      } else {
        return {
          title: selectedEvent?.localizedText,
          details: selectedEvent?.localizedText,
        };
      }
    }, [selectedEvent, instrumentType]);

  useHeaderTitle({
    label:
      instrument == null
        ? undefined
        : t(`instrumentScreens.common.eventLog.title`, {
            instrumentName: t(
              `instruments.names.${instrument.instrument.instrumentType}`
            ),
          }),
  });

  const eventTitleAccessor = useMemo(() => {
    if (clientShouldTranslateEvents(instrumentType)) {
      return ({ code, args }: EventLogDto) => (
        <Trans
          i18nKey={`${instrumentType}.${code}.title` as any}
          values={args}
          ns={I18nNs.Alerts}
        />
      );
    } else {
      return ({ localizedText }: EventLogDto) => localizedText;
    }
  }, [instrumentType]);

  const columns = useMemo(
    () => [
      {
        Header: t("instrumentScreens.common.eventLog.time"),
        accessor: ({ sourceDate }: EventLogDto) => sourceDate,
        id: "timeColumn",
        Cell: ({ value }: { value?: number }) => (
          <NoWrapText level="secondary">
            {value
              ? formatDate(value * 1000)
              : t("general.placeholder.noValue")}
          </NoWrapText>
        ),
      },
      {
        Header: t("instrumentScreens.common.eventLog.event"),
        accessor: eventTitleAccessor,
        id: "eventColumn",
        Cell: ({ value }: { value?: string }) => (
          <SpotText level="secondary">
            {value ?? t("general.placeholder.noValue")}
          </SpotText>
        ),
      },
      {
        Header: t("instrumentScreens.common.eventLog.patient"),
        accessor: ({ patient }: EventLogDto) => patient,
        id: "patientColumn",
        Cell: ({ value }: { value?: string }) => (
          <SpotText level="secondary">
            {value ?? t("general.placeholder.noValue")}
          </SpotText>
        ),
      },
    ],
    [eventTitleAccessor, formatDate, t]
  );

  return (
    <Root>
      <Content>
        <SpotText level="h3">
          {t("instrumentScreens.common.eventLog.eventLog")}
        </SpotText>
        <SpotText level="secondary">
          {t("instrumentScreens.common.eventLog.analyzer", {
            serialNumber: instrument?.instrument.instrumentSerialNumber,
          })}
        </SpotText>
        <EventLogTable data-testid="event-log-table">
          {(() => {
            if (isLoading) {
              return <FullSizeSpinner />;
            } else if (records?.length === 0) {
              return (
                <NoMatchingResults>
                  <SpotText level="h3">{t("general.noResults")}</SpotText>
                </NoMatchingResults>
              );
            } else {
              return (
                <StickyHeaderDataTable
                  clickable
                  columns={columns}
                  onRowsSelected={(indices) => setSelectedIndex(indices[0])}
                  data={(records ?? []) as unknown as Record<string, unknown>[]}
                ></StickyHeaderDataTable>
              );
            }
          })()}
        </EventLogTable>
      </Content>

      <InstrumentPageRightPanel data-testid="instrument-page-right">
        <InstrumentPageRightPanelButtonContainer>
          <Button
            onClick={() => setDetailsModalOpen(true)}
            disabled={selectedIndex == null}
          >
            {t("general.buttons.viewDetails")}
          </Button>
          <Button
            onClick={() => nav(-1)}
            data-testid="back-button"
            buttonType="secondary"
          >
            {t("general.buttons.back")}
          </Button>
        </InstrumentPageRightPanelButtonContainer>
      </InstrumentPageRightPanel>

      {selectedEvent != null && (
        <EventLogDetailsModal
          eventTitle={selectedEventTitle}
          eventDetails={selectedEventDetails}
          event={selectedEvent}
          open={detailsModalOpen}
          onClose={() => setDetailsModalOpen(false)}
        />
      )}
    </Root>
  );
}

const EventLogDetailsModalBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 30px;
`;

const EventLogDetailsModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  width: 100%;
`;

const HeaderTitle = styled.div`
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
`;

const EventLogModal = styled(BasicModal)`
  > .spot-modal__header > .spot-modal__titles {
    overflow: hidden;
  }
`;

interface EventLogDetailsModalProps {
  eventTitle?: ReactNode;
  eventDetails?: ReactNode;
  title?: ReactNode;
  event: EventLogDto;
  open: boolean;
  onClose: () => void;
}

function EventLogDetailsModal(props: EventLogDetailsModalProps) {
  const formatDate = useFormatLongDateTime12h();
  const { t } = useTranslation();

  return (
    <EventLogModal
      open={props.open}
      onClose={props.onClose}
      headerContent={
        <HeaderTitle className="spot-modal__title">
          {props.eventTitle}
        </HeaderTitle>
      }
      bodyContent={
        <EventLogDetailsModalBody>
          <div>{props.eventDetails}</div>
          <div>{props.event.code}</div>
          <div>
            {props.event.sourceDate != null
              ? formatDate(props.event.sourceDate * 1000)
              : undefined}
          </div>
        </EventLogDetailsModalBody>
      }
      footerContent={
        <EventLogDetailsModalFooter>
          <Button onClick={props.onClose}>{t("general.buttons.ok")}</Button>
        </EventLogDetailsModalFooter>
      }
    />
  );
}
