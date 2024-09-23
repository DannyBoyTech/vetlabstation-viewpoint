import * as React from "react";
import { Suspense } from "react";
import styled, { ThemeProvider } from "styled-components";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";
import { Preview, StoryFn, StoryContext } from "@storybook/react";
import { Provider as ReduxProvider } from "react-redux";
import "@idexx/spot/dist/spot_library.min.css";
import "../packages/ui/src/index.css";
import { MemoryRouter } from "react-router-dom";
import { DarkTheme, LightTheme } from "@viewpoint/ui/src/utils/StyleConstants";
import ViewpointThemeProvider from "@viewpoint/ui/src/context/ThemeContext";
import ViewpointInputProvider from "@viewpoint/ui/src/context/InputContext";
import ViewpointHeaderProvider from "@viewpoint/ui/src/context/HeaderContext";
import { setupStore } from "@viewpoint/ui/src/redux/store";
import ViewPointAppStateProvider from "@viewpoint/ui/src/context/AppStateContext";
import { GlobalModalProvider } from "@viewpoint/ui/src/components/global-modals/GlobalModals";
import "react-simple-keyboard/build/css/index.css";
import { ToastProvider } from "@viewpoint/spot-react";
import { randomLabRequest } from "@viewpoint/test-utils";
import {
  DEFAULT_RESULT_COLORS,
  ViewpointResultsPageContext,
} from "@viewpoint/ui/src/context/ResultsPageContext";
import { LightModeResultColors } from "@viewpoint/ui/src/components/results/result-utils";

const themes = [LightTheme, DarkTheme];
const themeNames = themes.map((theme) => theme.name);
const Container = styled.div`
  padding: 10px;
`;

const appStore = setupStore();

export const contexts = (AStory: StoryFn, context: StoryContext) => {
  const theme =
    themes.find((t) => t.name === context.globals.theme) ?? LightTheme;

  return (
    <I18nextProvider i18n={i18n}>
      <ReduxProvider store={appStore}>
        <ViewpointThemeProvider defaultTheme={theme}>
          <ThemeProvider theme={theme}>
            <ViewpointInputProvider>
              <ViewpointHeaderProvider>
                <ToastProvider>
                  <GlobalModalProvider>
                    <ViewPointAppStateProvider>
                      <Suspense fallback="loading...">
                        <MemoryRouter>
                          <Container className={theme.primaryContainerClass}>
                            <ViewpointResultsPageContext.Provider
                              value={{
                                labRequest: randomLabRequest(),
                                resultsBeingGraphed: [],
                                currentGraphingParams: [],
                                toggleGraphingForResult: () => {},
                                clearGraphs: () => {},
                                resultColorSettings: {
                                  ...DEFAULT_RESULT_COLORS,
                                  low: LightModeResultColors.Blue,
                                  high: LightModeResultColors.Red,
                                },
                              }}
                            >
                              <AStory />
                            </ViewpointResultsPageContext.Provider>
                          </Container>
                        </MemoryRouter>
                      </Suspense>
                    </ViewPointAppStateProvider>
                  </GlobalModalProvider>
                </ToastProvider>
              </ViewpointHeaderProvider>
            </ViewpointInputProvider>
          </ThemeProvider>
        </ViewpointThemeProvider>
      </ReduxProvider>
    </I18nextProvider>
  );
};

export const globalTypes = {
  theme: {
    name: "theme",
    description: "application theme",
    defaultValue: themeNames[0],
    toolbar: {
      icon: "eye",
      items: themeNames,
      showName: true,
    },
  },
};
const preview: Preview = {
  decorators: [contexts],
  tags: ["autodocs"],
};

export default preview;
