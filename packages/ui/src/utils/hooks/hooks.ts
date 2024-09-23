import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../redux/store";
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  PartialHeaderTitleProps,
  ViewpointHeaderContext,
} from "../../context/HeaderContext";
import { useTranslation } from "react-i18next";
import { instrumentApi, useGetInstrumentQuery } from "../../api/InstrumentApi";
import { numberedInstrumentName } from "../instrument-utils";
import { InstrumentStatusDto, InstrumentType } from "@viewpoint/api";
import omitBy from "lodash/omitBy";
import { useNavigate, useParams } from "react-router-dom";
import { skipToken } from "@reduxjs/toolkit/query";

// Use throughout the app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();

export const useHeaderTitle = (props: PartialHeaderTitleProps) => {
  const { setTitleProps } = useContext(ViewpointHeaderContext);

  useEffect(() => {
    setTitleProps(
      omitBy(
        {
          useProductName: props.useProductName,
          iconName: props.iconName,
          label: props.label,
          to: props.to,
        },
        (v) => v == null
      ) as PartialHeaderTitleProps
    );
    return () => {
      setTitleProps(undefined);
    };
  }, [
    setTitleProps,
    props.useProductName,
    props.iconName,
    props.label,
    props.to,
  ]);
};

export const useHideHeaderSearchIcon = (hide: boolean) => {
  const { setSearchIconHidden } = useContext(ViewpointHeaderContext);

  useEffect(() => {
    setSearchIconHidden(hide);

    return () => {
      setSearchIconHidden(false);
    };
  }, [hide, setSearchIconHidden]);
};

/**
 * Provides a way to get an internationalized, numbered instrument name for a
 * given instrument.
 *
 * @returns current instrument name for the given instrument id
 */
export const useInstrumentNameForId = () => {
  const { t } = useTranslation();
  const { data: statuses } = instrumentApi.useGetInstrumentStatusesQuery();

  return useMemo(() => {
    const nameById =
      statuses?.reduce((map, { instrument: it }) => {
        map.set(
          it.id,
          it.instrumentType === InstrumentType.InterlinkPims
            ? it.instrumentSerialNumber
            : numberedInstrumentName(t, it.instrumentType, it.displayNumber)
        );
        return map;
      }, new Map<number, string>()) ?? new Map();

    return (instrumentId: number) => nameById.get(instrumentId);
  }, [t, statuses]);
};

/**
 * Provides a way to get the type of instrument for a given ID
 *
 * @returns current instrument name for the given instrument id
 */
export const useInstrumentStatusForId = () => {
  const { data: statuses } = instrumentApi.useGetInstrumentStatusesQuery();
  return useCallback(
    (id: number) => statuses?.find((is) => is.instrument.id === id),
    [statuses]
  );
};

export const usePimsInstrumentStatus = () => {
  const { data: pimsInstrumentStatus } =
    instrumentApi.useGetInstrumentStatusesQuery(undefined, {
      selectFromResult: (res) => ({
        ...res,
        data: res.data?.find((is) =>
          [InstrumentType.InterlinkPims, InstrumentType.SerialPims].includes(
            is.instrument.instrumentType
          )
        ),
      }),
    });
  return pimsInstrumentStatus;
};

export function useDebounce<T>(value: T, delay?: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay || 500);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function useInstrumentForPathParamId(
  paramName: string = "instrumentId"
) {
  const { [paramName]: instrumentIdParam } = useParams();

  const instrumentId = Number(instrumentIdParam);

  if (isNaN(instrumentId)) {
    throw new Error(
      `Invalid instrument id for param ${paramName}: ${instrumentIdParam}`
    );
  }

  return useGetInstrumentQuery(
    instrumentIdParam == null ? skipToken : parseInt(instrumentIdParam)
  );
}

/**
 * Tracks and returns values from previous renders.
 *
 * @param value
 * @returns
 */
export function usePrevious<T>(value: T) {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

// Update the URL's search params as the provided query params object changes.
// If the user navigates back to this page, the search string in the location will
// allow it to remember what was entered in the search boxes
export const useUrlSync = (queryParams?: unknown) => {
  const nav = useNavigate();

  useEffect(() => {
    nav(
      {
        search: new URLSearchParams(
          Object.entries(queryParams ?? {}).filter(
            ([_, value]) => value != null
          )
        ).toString(),
      },
      { replace: true }
    );
  }, [nav, queryParams]);
};

/**
 * Sorting function for instruments based on the displayed instrument name.
 * This is a hook because it relies on the useInstrumentNameForId hook.
 */
export function useInstrumentSortingFn() {
  const getInstrumentName = useInstrumentNameForId();

  return useCallback(
    (a: InstrumentStatusDto, b: InstrumentStatusDto) =>
      getInstrumentName(a.instrument.id).localeCompare(
        getInstrumentName(b.instrument.id)
      ),
    [getInstrumentName]
  );
}
