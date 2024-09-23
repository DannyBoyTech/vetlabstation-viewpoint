import { Route } from "react-router-dom";
import { InstrumentsScreen } from "../screens/instruments/InstrumentsScreen";
import { SystemSettingsScreen } from "../screens/instruments/system/SystemSettingsScreen";
import { RouterSettingsScreen } from "../screens/instruments/system/advanced/RouterSettingsScreen";
import { WirelessSettingsScreen } from "../screens/instruments/system/advanced/WirelessSettingsScreen";

export const SystemScreenRoutes = (
  <Route path="/system">
    <Route index element={<InstrumentsScreen />} />
    <Route path="advanced">
      <Route index element={<RouterSettingsScreen />} />
      <Route path="wireless" element={<WirelessSettingsScreen />} />
    </Route>
    <Route path="settings" element={<SystemSettingsScreen />} />
  </Route>
);
