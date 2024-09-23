import styled from "styled-components";
import { PimsRequestTypeEnum, SettingTypeEnum } from "@viewpoint/api";
import {
  useHeaderTitle,
  useHideHeaderSearchIcon,
} from "../../utils/hooks/hooks";
import { useGetSettingsQuery } from "../../api/SettingsApi";
import SpinnerOverlay from "../../components/overlay/SpinnerOverlay";
import { PendingList } from "./pending-list/PendingList";
import { InstrumentBar } from "../../components/analyzer-status/InstrumentBar";
import { InProcessList } from "./in-process/InProcessList";
import { RecentResultList } from "./recent-results/RecentResultList";
import { useNavigate } from "react-router-dom";
import { WelcomeModal } from "./welcome/WelcomeModal";
import { useGetBootItemsQuery } from "../../api/BootItemsApi";
import { useContext, useEffect } from "react";
import { ViewpointThemeContext } from "../../context/ThemeContext";
import { DefaultHeaderTitle } from "../../components/header/Header";
import {
  LocalStorageKey,
  useLocalStorageData,
} from "../../context/LocalStorageContext";

const TestId = {
  HomeScreen: "vp-home-screen-root",
};

const Root = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow-y: hidden;
  height: 100%;
`;

const Columns = styled.div<{ sidePadding: number }>`
  display: flex;
  flex: 1;
  gap: 20px;
  background-color: ${(p) => p.theme.colors?.background?.secondary};
  padding: 5px ${(p) => p.sidePadding}px;
  overflow: hidden;
  height: 100%;
`;

function useWelcomeScreenShownStatus() {
  const { data, update } = useLocalStorageData(
    LocalStorageKey.WelcomeScreenShown
  );

  return { welcomeScreenShown: data, setWelcomeScreenShown: update };
}

export function HomeScreen() {
  useHeaderTitle({
    ...DefaultHeaderTitle,
    iconName: "None",
  });
  useHideHeaderSearchIcon(true);
  const { welcomeScreenShown, setWelcomeScreenShown } =
    useWelcomeScreenShownStatus();
  const { data: bootItems } = useGetBootItemsQuery();
  const nav = useNavigate();

  useEffect(() => {
    if (bootItems?.restoreDto?.restorePerformed && !welcomeScreenShown) {
      // If user has restored a database, don't ever show the welcome screen
      setWelcomeScreenShown(true);
    }
  }, [
    welcomeScreenShown,
    bootItems?.restoreDto?.restorePerformed,
    setWelcomeScreenShown,
  ]);

  const shouldShowWelcomeScreen =
    !welcomeScreenShown &&
    bootItems != null &&
    !bootItems.restoreDto.restorePerformed;

  const {
    data: settings,
    enabledListItems,
    isLoading,
  } = useGetSettingsQuery(
    [
      SettingTypeEnum.DISPLAY_PENDING_REQUESTS,
      SettingTypeEnum.DISPLAY_CENSUS_LIST,
    ],
    {
      selectFromResult: (res) => ({
        ...res,
        enabledListItems:
          res.data == null
            ? []
            : ([
                ...(res.data.DISPLAY_PENDING_REQUESTS === "true"
                  ? [PimsRequestTypeEnum.PENDING]
                  : []),
                ...(res.data.DISPLAY_CENSUSLIST === "true"
                  ? [PimsRequestTypeEnum.CENSUS]
                  : []),
              ] as PimsRequestTypeEnum[]),
      }),
    }
  );

  const { theme } = useContext(ViewpointThemeContext);

  if (isLoading || settings == null) {
    return <SpinnerOverlay />;
  }

  const showPimsRequestColumn = enabledListItems.length > 0;

  return (
    <Root data-testid={TestId.HomeScreen}>
      <InstrumentBar />

      <Columns
        sidePadding={showPimsRequestColumn ? 20 : 75}
        className={theme.secondaryContainerClass}
      >
        {showPimsRequestColumn && (
          <PendingList enabledListItems={enabledListItems} />
        )}

        <InProcessList includeAnalyzeSample={!showPimsRequestColumn} />

        <RecentResultList />
      </Columns>

      {shouldShowWelcomeScreen &&
        bootItems != null &&
        !bootItems.restoreDto.restorePerformed && (
          <WelcomeModal
            dismissable={false}
            open={shouldShowWelcomeScreen}
            onClose={() => {
              setWelcomeScreenShown(true);
            }}
          />
        )}
    </Root>
  );
}
