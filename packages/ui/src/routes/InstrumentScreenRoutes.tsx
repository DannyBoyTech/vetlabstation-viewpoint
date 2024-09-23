import { Route, redirect } from "react-router-dom";
import { InstrumentsScreen } from "../screens/instruments/InstrumentsScreen";
import { SettingsScreenRouter } from "../screens/instruments/InstrumentsSettingsScreen";
import { CatalystAdvancedSettings } from "../screens/instruments/common/catalyst-advanced-settings/CatalystAdvancedSettings";
import { UpdateAdvancedSettings } from "../screens/instruments/common/catalyst-advanced-settings/UpdateAdvancedSettings";
import { InstrumentsQcScreen } from "../screens/instruments/InstrumentsQcScreen";
import { InstrumentsQcResultsScreen } from "../screens/instruments/InstrumentsQcResultsScreen";
import { InstrumentMaintenanceScreen } from "../screens/instruments/InstrumentsMaintenanceScreen";
import { EventLogScreen } from "../screens/instruments/common/EventLogScreen";
import { LotEntryScreens } from "../screens/instruments/LotEntryScreens";
import { SediVueDxReplaceCartridgeScreen } from "../screens/instruments/sedivue/SediVueDxReplaceCartridgeScreen";
import { ReportsScreens } from "../screens/instruments/ReportsScreens";
import { PdxNewHardwareConfigurationScreen } from "../screens/instruments/procytedx/new-hardware/PdxNewHardwareConfigurationScreen";
import { InstrumentsSmartQcScreen } from "../screens/instruments/InstrumentsSmartQcScreen";
import { InstrumentDiagnosticsScreens } from "../screens/instruments/InstrumentDiagnosticsScreens";

export const InstrumentScreenRoutes = (
  <Route path="/instruments">
    <Route index loader={() => redirect("/system")} />
    <Route path=":instrumentId">
      <Route index path="eventlog" element={<EventLogScreen />} />
      <Route index element={<InstrumentsScreen />} />

      <Route path="qc">
        <Route
          path=":qualityControlId/results"
          element={<InstrumentsQcResultsScreen />}
        />
        <Route index element={<InstrumentsQcScreen />} />
      </Route>
      <Route path="smartQc">
        <Route index element={<InstrumentsSmartQcScreen />} />
      </Route>

      <Route path="maintenance" element={<InstrumentMaintenanceScreen />} />
      <Route path="diagnostics" element={<InstrumentDiagnosticsScreens />} />
      <Route
        path="maintenance/replace/cartridge"
        element={<SediVueDxReplaceCartridgeScreen />}
      />

      <Route path="settings" element={<SettingsScreenRouter />} />

      <Route path="settings/advanced" element={<CatalystAdvancedSettings />} />

      <Route
        path="settings/advanced/update"
        element={<UpdateAdvancedSettings />}
      />

      <Route path={"lotEntry/:barcodeType"} element={<LotEntryScreens />} />
      <Route path={"lotEntry"} element={<LotEntryScreens />} />
      <Route path={"reports"} element={<ReportsScreens />} />
      <Route
        path={"newHardware"}
        element={<PdxNewHardwareConfigurationScreen />}
      />
    </Route>
  </Route>
);
