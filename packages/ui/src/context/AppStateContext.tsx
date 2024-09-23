import React, {
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { PimsRequestTypeEnum } from "@viewpoint/api";
import { useTranslation } from "react-i18next";
import { getDecimalSeparator } from "../utils/i18n-utils";

// General global state of the app. As a general rule, this should contain
// global UI configuration state that does not change often.
export interface AppStateDataContext {
  selectedPimsRequestType: PimsRequestTypeEnum;
  alertsModalVisible: boolean;
  alertsModalInstrumentId?: number;
  localeData: {
    decimalSeparator: string;
  };
}

// API/utilities for manipulating general global state of the app. Separated from the
// data context in order to allow mutations without requiring use of
// the data context that may trigger unnecessary re-renders
export interface AppStateApiContext {
  setSelectedPimsRequestType: (type: PimsRequestTypeEnum) => void;
  startBeeping: (durationMs?: number, intervalMs?: number) => void;
  stopBeeping: () => void;
  showAlertsModal: (forInstrumentId?: number) => void;
  closeAlertsModal: () => void;
}

export const ViewPointAppStateDataContext =
  React.createContext<AppStateDataContext>(
    undefined as unknown as AppStateDataContext
  );

export const ViewPointAppStateApiContext =
  React.createContext<AppStateApiContext>(
    undefined as unknown as AppStateApiContext
  );

const ViewPointAppStateProvider = (props: PropsWithChildren) => {
  const [selectedPimsRequestType, setSelectedPimsRequestType] = useState(
    PimsRequestTypeEnum.PENDING
  );
  const [alertsModalVisible, setAlertsModalVisible] = useState(false);
  const [alertsModalInstrumentId, setAlertsModalInstrumentId] =
    useState<number>();
  const beepInterval = useRef<number>();

  const { i18n } = useTranslation();

  const localeData = useMemo(
    () => ({
      decimalSeparator: getDecimalSeparator(i18n.language),
    }),
    [i18n.language]
  );

  const dataValue = useMemo(
    () => ({
      selectedPimsRequestType,
      alertsModalVisible,
      alertsModalInstrumentId,
      localeData,
    }),
    [
      alertsModalInstrumentId,
      alertsModalVisible,
      localeData,
      selectedPimsRequestType,
    ]
  );

  const stopBeeping = useCallback(() => {
    clearInterval(beepInterval.current);
    beepInterval.current = undefined;
  }, []);

  const startBeeping = useCallback(
    (durationMs?: number, intervalMs?: number) => {
      if (beepInterval.current == null) {
        window.main?.send("beep");
        const interval = setInterval(() => {
          window.main?.send("beep");
        }, intervalMs ?? 3000);
        beepInterval.current = interval as unknown as number;
        if (durationMs != null) {
          setTimeout(stopBeeping, durationMs);
        }
      }
    },
    [stopBeeping]
  );

  const showAlertsModal = useCallback((forInstrumentId?: number) => {
    setAlertsModalVisible(true);
    setAlertsModalInstrumentId(forInstrumentId);
  }, []);

  const closeAlertsModal = useCallback(() => {
    setAlertsModalVisible(false);
    setAlertsModalInstrumentId(undefined);
  }, []);

  const apiValue = useMemo(
    () => ({
      setSelectedPimsRequestType,
      startBeeping,
      stopBeeping,
      showAlertsModal,
      closeAlertsModal,
    }),
    [startBeeping, stopBeeping, showAlertsModal, closeAlertsModal]
  );

  return (
    <ViewPointAppStateDataContext.Provider value={dataValue}>
      <ViewPointAppStateApiContext.Provider value={apiValue}>
        {props.children}
      </ViewPointAppStateApiContext.Provider>
    </ViewPointAppStateDataContext.Provider>
  );
};

export function useSelectedPimsRequestType() {
  const { selectedPimsRequestType } = useContext(ViewPointAppStateDataContext);

  return selectedPimsRequestType;
}

export function useUpdateSelectedPimsRequestType() {
  const { setSelectedPimsRequestType } = useContext(
    ViewPointAppStateApiContext
  );

  return setSelectedPimsRequestType;
}

export function useSystemBeep() {
  const { startBeeping, stopBeeping } = useContext(ViewPointAppStateApiContext);

  return { startBeeping, stopBeeping };
}

export function useLocaleData() {
  const { localeData } = useContext(ViewPointAppStateDataContext);

  return localeData;
}

export default ViewPointAppStateProvider;
