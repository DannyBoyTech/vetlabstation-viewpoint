import { useInstrumentStatusForId } from "../../utils/hooks/hooks";
import { useCallback, useMemo } from "react";
import { InstrumentAlertDto } from "@viewpoint/api";
import { useGetLaserCyteStatusesQuery } from "../../api/InstrumentApi";
import { useGetAllInstrumentAlertsQuery } from "../../api/InstrumentAlertApi";

/**
 * Utility hook for getting valid and sorted instrument alerts. Filters out
 * LaserCyte alerts, and sorts the alerts based on the instrument's display order.
 *
 * Would have been ideal to filter out the LC alerts in the adapter, but
 * the response only includes the instrument ID which would require making
 * an additional call to the server to get the instrument type based on the ID.
 * Statuses are already cached client-side to be mapped to by ID, so there should
 * not be any additional performance impact by doing the filtering in the client.
 */
export function useFilteredInstrumentAlerts() {
  const getStatusForId = useInstrumentStatusForId();

  const sortAlerts = useCallback(
    (alertOne: InstrumentAlertDto, alertTwo: InstrumentAlertDto) =>
      (getStatusForId(alertOne.instrumentId)?.instrument.displayOrder ?? 0) -
      (getStatusForId(alertTwo.instrumentId)?.instrument.displayOrder ?? 0),
    [getStatusForId]
  );

  const {
    data: unfilteredAlerts,
    currentData: unfilteredCurrentAlerts,
    ...instrumentStatuses
  } = useGetAllInstrumentAlertsQuery(undefined, {
    selectFromResult: (res) => ({
      ...res,
      data: (res.data == null ? [] : [...res.data]).sort(sortAlerts),
      currentData: (res.currentData == null ? [] : [...res.currentData]).sort(
        sortAlerts
      ),
    }),
  });

  const { laserCyteInstrumentIds, ...lcStatuses } =
    useGetLaserCyteStatusesQuery(undefined, {
      selectFromResult: (res) => ({
        ...res,
        laserCyteInstrumentIds: res.data?.map((is) => is.instrument.id) ?? [],
      }),
    });

  const filteredAlerts = useMemo(
    () =>
      unfilteredAlerts.filter(
        (alert) => !laserCyteInstrumentIds.includes(alert.instrumentId)
      ),
    [laserCyteInstrumentIds, unfilteredAlerts]
  );

  const filteredCurrentAlerts = useMemo(
    () =>
      unfilteredCurrentAlerts.filter(
        (alert) => !laserCyteInstrumentIds.includes(alert.instrumentId)
      ),
    [laserCyteInstrumentIds, unfilteredCurrentAlerts]
  );

  return {
    ...instrumentStatuses,
    data: filteredAlerts,
    currentData: filteredCurrentAlerts,
    isLoading: lcStatuses.isLoading || instrumentStatuses.isLoading,
    isUninitialized:
      lcStatuses.isUninitialized || instrumentStatuses.isUninitialized,
    isFetching: lcStatuses.isFetching || instrumentStatuses.isFetching,
  };
}
