import { Route } from "react-router-dom";
import { ResultsPage } from "../screens/results/ResultsPage";
import { TransferResultsPage } from "../screens/results/transfer/TransferResultsPage";
import { BuildLabRequestScreenRouter } from "../screens/order-fulfillment/BuildLabRequestScreenRouter";
import { AddPatientForTransferResults } from "../screens/results/transfer/AddPatientForTransferResults";

export const LabRequestRoutes = (
  <Route path="/labRequest">
    <Route path="build" element={<BuildLabRequestScreenRouter />} />
    <Route path=":labRequestId" element={<ResultsPage />} />
    <Route path=":labRequestId/transfer" element={<TransferResultsPage />} />
    <Route
      path=":labRequestId/transfer/addPatient"
      element={<AddPatientForTransferResults />}
    />
  </Route>
);
