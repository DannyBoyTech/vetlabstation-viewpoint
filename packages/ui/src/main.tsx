import React, { Suspense, useContext } from "react";
import ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import { ThemeProvider } from "styled-components";
import { Provider as ReduxProvider } from "react-redux";
import ViewpointThemeProvider, {
  ViewpointThemeContext,
} from "./context/ThemeContext";
import App from "./App";
import { LightTheme } from "./utils/StyleConstants";
import ReduxConnectorProvider from "./context/ReduxConnectorContext";
import ViewpointInputProvider from "./context/InputContext";
import "./index.css";
import "./i18n/config";
import ViewpointHeaderProvider from "./context/HeaderContext";
import { setupStore } from "./redux/store";
import {
  EventSourceProvider,
  useWasSystemReady,
} from "./context/EventSourceContext";
import { ToastProvider } from "@viewpoint/spot-react";
import { InstrumentScreenRoutes } from "./routes/InstrumentScreenRoutes";
import { LabRequestRoutes } from "./routes/LabRequestRoutes";
import { AnalyzeSample } from "./screens/AnalyzeSample";
import { PatientSearchScreen } from "./screens/PatientSearchScreen";
import { AddPatientScreen } from "./screens/add-patient/AddPatient";
import { EditPatientScreen } from "./screens/EditPatient";
import { GlobalModalProvider } from "./components/global-modals/GlobalModals";
import { SystemScreenRoutes } from "./routes/SystemScreenRoutes";
import { HomeScreen } from "./screens/home/HomeScreen";
import ViewPointAppStateProvider from "./context/AppStateContext";
import { SettingsScreenRoutes } from "./routes/SettingsScreenRoutes";
import { BootScreen } from "./screens/boot/BootWorkflow";
import { MessagesScreen } from "./screens/messages/MessagesScreen";
import { HelpScreen } from "./screens/help/HelpScreen";
import SpinnerOverlay from "./components/overlay/SpinnerOverlay";
import LocalStorageProvider from "./context/LocalStorageContext";

import { patchGlobals } from "./utils/patches";

patchGlobals();

const appStore = setupStore();

function CheckReadyContexts() {
  const { theme } = useContext(ViewpointThemeContext);
  const systemWasReady = useWasSystemReady();
  if (!systemWasReady) {
    return <BootScreen />;
  }
  return (
    // styled-components context provider
    <ThemeProvider theme={theme}>
      {/*Context provider for the redux Viewpoint redux connector (connects STOMP client to redux store)*/}
      <ReduxConnectorProvider>
        {/*Context provider for virtual keyboard*/}
        <ViewpointInputProvider>
          {/*Context provider for manipulating the header within a child component*/}
          <ViewpointHeaderProvider>
            {/* toast system message provider */}
            <ToastProvider>
              {/* context provider for global modals */}
              <GlobalModalProvider interModalDelayMillis={250}>
                {/* context provider for general app state/utilities that do not fit within RTK query */}
                <ViewPointAppStateProvider>
                  {/*The actual Viewpoint app*/}
                  <App />
                </ViewPointAppStateProvider>
              </GlobalModalProvider>
            </ToastProvider>
          </ViewpointHeaderProvider>
        </ViewpointInputProvider>
      </ReduxConnectorProvider>
    </ThemeProvider>
  );
}

const AllContexts = () => (
  // Provider for Redux toolkit store
  <ReduxProvider store={appStore}>
    {/* Allows eventSource to be accessed throughout app using `useEventSource` */}
    <EventSourceProvider>
      {/*Context provider for the Viewpoint ThemeContext*/}
      <ViewpointThemeProvider defaultTheme={LightTheme}>
        {/*Context for managing local storage data*/}
        <LocalStorageProvider>
          {/* Additional contexts and the actual app that should not load until the backend is ready */}
          <CheckReadyContexts />
        </LocalStorageProvider>
      </ViewpointThemeProvider>
    </EventSourceProvider>
  </ReduxProvider>
);

const VPRoutes = (
  <Route
    path="/"
    element={
      <Suspense fallback={<SpinnerOverlay />}>
        <AllContexts />
      </Suspense>
    }
  >
    {/*Default route -- just an empty screen rendered within the outlet to match the previous react-router setup*/}
    <Route path="*" element={<div />} />
    <Route index element={<HomeScreen />} />

    {InstrumentScreenRoutes}
    {LabRequestRoutes}
    {SystemScreenRoutes}
    {SettingsScreenRoutes}

    <Route path="/addPatient" element={<AddPatientScreen />} />
    <Route path="/analyzeSample" element={<AnalyzeSample />} />
    <Route path="/help" element={<HelpScreen />} />
    <Route path="/messages" element={<MessagesScreen />} />
    <Route path="/patientSearch" element={<PatientSearchScreen />} />
    <Route path="/patients/:patientId" element={<EditPatientScreen />} />
  </Route>
);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider
      router={createBrowserRouter(createRoutesFromElements(VPRoutes))}
    />
  </React.StrictMode>
);
