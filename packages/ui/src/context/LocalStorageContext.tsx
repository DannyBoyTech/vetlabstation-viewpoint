import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useState,
} from "react";

export const LocalStorageKey = {
  SSConnectNotificationPending:
    "idexx.viewpoint.smartservice.showConnectionNotification",
  WelcomeScreenShown: "idexx.viewpoint.welcomeScreenShown",
} as const;

export type LocalStorageKey =
  (typeof LocalStorageKey)[keyof typeof LocalStorageKey];

export interface LocalStorageData {
  [LocalStorageKey.SSConnectNotificationPending]?: boolean;
  [LocalStorageKey.WelcomeScreenShown]?: boolean;
}

type UpdateLocalStorageDataFn = <K extends LocalStorageKey>(
  key: K,
  value: LocalStorageData[K]
) => void;

export interface LocalStorageContext {
  localStorageData: LocalStorageData;
  updateLocalStorageData: UpdateLocalStorageDataFn;
}

export const LocalStorageContext = createContext<LocalStorageContext>(
  undefined as unknown as LocalStorageContext
);

const LocalStorageProvider = (props: PropsWithChildren) => {
  const [localStorageData, setLocalStorageData] = useState<LocalStorageData>(
    getLocalStorageData()
  );

  const updateLocalStorageData = useCallback<UpdateLocalStorageDataFn>(
    (key, value) => {
      setLocalStorageData((prev) => ({
        ...prev,
        [key]: value,
      }));
      localStorage.setItem(key, JSON.stringify(value));
    },
    []
  );

  return (
    <LocalStorageContext.Provider
      value={{
        localStorageData,
        updateLocalStorageData,
      }}
    >
      {props.children}
    </LocalStorageContext.Provider>
  );
};

function getLocalStorageData(): LocalStorageData {
  return Object.values(LocalStorageKey).reduce(
    (acc, key) => ({
      ...acc,
      [key]: getFromLocalStorage(key),
    }),
    {} as LocalStorageData
  );
}

const getFromLocalStorage = (key: string) => {
  const val = localStorage.getItem(key);
  return val == null ? undefined : JSON.parse(val);
};

export function useLocalStorageData<
  T extends LocalStorageKey,
  V extends LocalStorageData[T]
>(key: T) {
  const { localStorageData, updateLocalStorageData } =
    useContext(LocalStorageContext);

  const update = useCallback(
    (updatedData: V) => {
      updateLocalStorageData(key, updatedData);
    },
    [key, updateLocalStorageData]
  );

  return { data: localStorageData[key], update };
}

export default LocalStorageProvider;
