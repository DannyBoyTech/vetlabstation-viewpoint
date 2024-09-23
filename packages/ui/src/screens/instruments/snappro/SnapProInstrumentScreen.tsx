import { useMemo, useState } from "react";
import {
  useGetSnapStatusesQuery,
  useSuppressMutation,
} from "../../../api/InstrumentApi";
import {
  InstrumentPageContent,
  InstrumentPageRightPanel,
  InstrumentPageRightPanelButtonContainer,
  InstrumentPageRoot,
} from "../common-components";
import { Button } from "@viewpoint/spot-react";
import { useTranslation } from "react-i18next";
import { InstrumentStatus, SnapProInstrumentStatusDto } from "@viewpoint/api";
import styled from "styled-components";
import { SnapProCard } from "../../../components/snappro-card/SnapProCard";
import { CancelProcessButton } from "../common/CancelProcessButton";

const TestId = {
  InstrumentList: "snap-pro-instrument-list",
  Instrument: (id: number) => `snap-pro-instrument-${id}`,
  CancelProcessButton: "cancel-process-button",
  RemoveInstrumentButton: "snap-pro-remove-instrument-button",
} as const;

const buttonDisabled = (
  selected: SnapProInstrumentStatusDto | undefined,
  fetching: boolean
) =>
  fetching ||
  selected == null ||
  !new Set([InstrumentStatus.Offline, InstrumentStatus.Standby]).has(
    selected.instrumentStatus
  );

const SnapProList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

interface Connected {
  lastConnectedDate?: number;
}

/**
 * Returns a new array of connected items with the same elements sorted by
 * lastConnectedDate ascending (most recent last).
 *
 * @param items - array of items that maybe have 'lastConnectedDate'
 * @returns - new array of items sorted with least recent lastConnectedDate first
 */
function sortByLastConnectedAsc<T extends Connected>(items: T[]): T[] {
  return items?.slice().sort((a, b) => {
    const aVal = a.lastConnectedDate;
    const bVal = b.lastConnectedDate;

    if (aVal === bVal) {
      return 0;
    } else if (aVal != null && bVal != null) {
      return aVal - bVal;
    } else {
      return aVal == null ? -1 : 1;
    }
  });
}

function SnapProInstrumentScreen() {
  const { t } = useTranslation();
  const { currentData: statuses, isFetching: statusesFetching } =
    useGetSnapStatusesQuery();
  const [selectedId, setSelectedId] = useState<number>();
  const [removeSnap] = useSuppressMutation();

  const handleRemoveInstrument = () => {
    if (selectedId != null) {
      removeSnap({ instrumentId: selectedId });
    }
  };

  const sortedStatuses = useMemo(
    () =>
      sortByLastConnectedAsc(statuses ?? ([] as SnapProInstrumentStatusDto[])),
    [statuses]
  );

  const selectedSnapStatus = useMemo(
    () =>
      selectedId != null
        ? sortedStatuses.find((it) => it.instrument.id === selectedId)
        : undefined,
    [selectedId, sortedStatuses]
  );

  return (
    <InstrumentPageRoot>
      <InstrumentPageContent>
        <SnapProList data-testid={TestId.InstrumentList} role="list">
          {sortedStatuses.map((it) => (
            <SnapProCard
              role="listitem"
              data-testid={TestId.Instrument(it.instrument.id)}
              key={it.instrument.id}
              selected={selectedId === it.instrument.id}
              status={it}
              onClick={() =>
                setSelectedId((prev) =>
                  it.instrument.id !== prev ? it.instrument.id : undefined
                )
              }
            />
          ))}
        </SnapProList>
      </InstrumentPageContent>
      <InstrumentPageRightPanel>
        <InstrumentPageRightPanelButtonContainer>
          <CancelProcessButton
            buttonType="secondary"
            instrumentStatus={selectedSnapStatus}
            data-testid={TestId.CancelProcessButton}
          />
          <Button
            data-testid={TestId.RemoveInstrumentButton}
            buttonType="secondary"
            disabled={buttonDisabled(
              sortedStatuses?.find((it) => it.instrument.id === selectedId),
              statusesFetching
            )}
            onClick={handleRemoveInstrument}
          >
            {t("instrumentScreens.general.buttons.removeInstrument")}
          </Button>
        </InstrumentPageRightPanelButtonContainer>
      </InstrumentPageRightPanel>
    </InstrumentPageRoot>
  );
}

//exported for test only
export { TestId };

export { SnapProInstrumentScreen };
