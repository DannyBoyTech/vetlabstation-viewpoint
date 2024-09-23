import { Route } from "react-router-dom";
import { SettingsScreen } from "../screens/settings/SettingsScreen";
import { ReportHeaderSettingsScreen } from "../screens/settings/ReportHeaderSettingsScreen";
import { VetConnectPlusActivationScreen } from "../screens/settings/vcp/VetConnectPlusActivationScreen";
import { EditAccountNumberScreen } from "../screens/settings/PracticeInfo/EditAccountNumberScreen";
import { AddDoctorScreen } from "../screens/settings/PracticeInfo/AddDoctorScreen";
import { EditDoctorScreen } from "../screens/settings/PracticeInfo/EditDoctorScreen";
import { ConfigurePracticeManagement } from "../screens/settings/practiceManagement/ConfigurePracticeManagement";
import { SettingsCategory } from "../screens/settings/common-settings-components";

const settingRoutes = Object.values(SettingsCategory).map((section) => (
  <Route
    path={`${section.toLowerCase()}`}
    element={<SettingsScreen settingsSection={section} />}
    key={section}
  />
));

export const SettingsScreenRoutes = (
  <Route path="/settings">
    <Route
      index
      element={
        <SettingsScreen settingsSection={SettingsCategory.SMART_SERVICE} />
      }
    />
    {settingRoutes}
    <Route path="reports/header" element={<ReportHeaderSettingsScreen />} />
    <Route
      path="vet_connect_plus/activate"
      element={<VetConnectPlusActivationScreen />}
    />
    <Route
      path="practice_info/account_number/edit"
      element={<EditAccountNumberScreen />}
    />
    <Route path="practice_info/add" element={<AddDoctorScreen />} />
    <Route path="practice_info/:doctorId/edit" element={<EditDoctorScreen />} />
    <Route
      path="practice_management/configure"
      element={<ConfigurePracticeManagement />}
    />
  </Route>
);
