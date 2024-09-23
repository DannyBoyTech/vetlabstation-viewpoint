import {
  AlertAction,
  AlertDto,
  CatalystDxAlerts,
  InstrumentStatusDto,
} from "@viewpoint/api";
import { AlertActionButton, AlertContent } from "./AlertComponents";
import { Trans } from "react-i18next";

export function getCatDxAlertContent(
  instrumentStatus: InstrumentStatusDto,
  alert: AlertDto,
  onClose: () => void
) {
  switch (alert.name) {
    case CatalystDxAlerts.CONNECTION_TIMEOUT:
      return (
        <AlertContent
          instrumentType={instrumentStatus.instrument.instrumentType}
          instrumentId={instrumentStatus.instrument.id}
          alertDto={alert}
          actions={[
            <AlertActionButton
              key={alert.uniqueId}
              instrumentId={instrumentStatus.instrument.id}
              alertAction={AlertAction.CLOSE}
              alert={alert}
              onClick={() => onClose()}
            >
              <Trans i18nKey={"general.buttons.close"} />
            </AlertActionButton>,
          ]}
        />
      );
  }
}
