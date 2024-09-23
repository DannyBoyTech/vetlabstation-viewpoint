import { render, RenderOptions } from "@testing-library/react";
import {
  createMemoryRouter,
  RouteObject,
  RouterProvider,
} from "react-router-dom";
import { ReactElement, ReactNode } from "react";
import { Provider as ReduxProvider } from "react-redux";
import { LightTheme } from "../src/utils/StyleConstants";
import ViewpointThemeProvider, {
  ViewpointThemeContext,
} from "../src/context/ThemeContext";
import ViewpointHeaderProvider from "../src/context/HeaderContext";
import { AppStore, RootState, setupStore } from "../src/redux/store";
import ViewpointInputProvider from "../src/context/InputContext";
import { ThemeProvider } from "styled-components";
import { ToastProvider } from "@viewpoint/spot-react";
import ViewPointAppStateProvider from "../src/context/AppStateContext";
import LocalStorageProvider from "../src/context/LocalStorageContext";

interface MemoryRouterProviderProps {
  initialEntries?: (string | Partial<Location>)[] | undefined;
  children?: ReactNode;
  routes?: RouteObject[];
}

/**
 * An adapter that allows usage of react-router-dom v6 data-apis, while
 * allowing usage of the v5 `Routes` route definitions.
 *
 * @see main.tsx
 */
function MemoryRouterProvider(props: MemoryRouterProviderProps) {
  const router = createMemoryRouter(
    [{ path: "*", element: props.children }, ...(props.routes ?? [])],
    {
      initialEntries: props.initialEntries,
    }
  );
  return <RouterProvider router={router} />;
}

export interface CustomRenderOptions extends RenderOptions {
  preloadedState?: RootState;
  store?: AppStore;
  initialRouteEntries?: string[];
}

const customRender = (
  ui: ReactElement,
  {
    preloadedState = {} as any,
    store = setupStore(preloadedState),
    initialRouteEntries,
    ...options
  }: CustomRenderOptions = {}
) => {
  const Wrapper = ({ children }: { children: ReactNode }): ReactElement => (
    <ReduxProvider store={store}>
      <MemoryRouterProvider initialEntries={initialRouteEntries}>
        <ViewpointThemeProvider defaultTheme={LightTheme}>
          <ViewpointThemeContext.Consumer>
            {(ctx) => (
              // styled-components context provider
              <ThemeProvider theme={ctx.theme}>
                <ViewpointHeaderProvider>
                  <ViewpointInputProvider>
                    <ViewPointAppStateProvider>
                      <LocalStorageProvider>
                        <ToastProvider>{children}</ToastProvider>
                      </LocalStorageProvider>
                    </ViewPointAppStateProvider>
                  </ViewpointInputProvider>
                </ViewpointHeaderProvider>
              </ThemeProvider>
            )}
          </ViewpointThemeContext.Consumer>
        </ViewpointThemeProvider>
      </MemoryRouterProvider>
    </ReduxProvider>
  );

  return {
    store,
    ...render(ui, { wrapper: Wrapper, ...options }),
  };
};

export { customRender as render };
