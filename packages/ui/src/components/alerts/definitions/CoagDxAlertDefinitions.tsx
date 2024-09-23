import {
  AlertAction,
  AlertDto,
  CoagDxAlerts,
  InstrumentStatusDto,
} from "@viewpoint/api";
import { AlertActionButton, AlertContent } from "./AlertComponents";
import { Trans } from "react-i18next";

export function getCoagDxAlertContent(
  instrumentStatus: InstrumentStatusDto,
  alert: AlertDto,
  onClose: () => void
) {
  switch (alert.name) {
    case CoagDxAlerts.GENERAL_ALERT:
      return (
        <AlertContent
          instrumentType={instrumentStatus.instrument.instrumentType}
          instrumentId={instrumentStatus.instrument.id}
          alertDto={alert}
          actions={[
            <AlertActionButton
              key={alert.uniqueId}
              instrumentId={instrumentStatus.instrument.id}
              alertAction={AlertAction.OK}
              alert={alert}
              onClick={() => onClose()}
            >
              <Trans i18nKey={"general.buttons.ok"} />
            </AlertActionButton>,
          ]}
        />
      );
  }
}
