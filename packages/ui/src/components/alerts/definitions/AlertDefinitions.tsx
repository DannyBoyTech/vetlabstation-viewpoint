import {
  AlertAction,
  AlertDto,
  InstrumentStatusDto,
  InstrumentType,
} from "@viewpoint/api";
import { GenericActionAlertContent } from "./AlertComponents";
import { getCatDxAlertContent } from "./CatalystDxAlertDefinitions";
import { getCatOneAlertContent } from "./CatOneAlertDefinitions";
import { getCoagDxAlertContent } from "./CoagDxAlertDefinitions";
import { getProCyteDxAlertContent } from "./ProCyteDxAlertDefinitions";
import { getSediVueDxAlertContent } from "./SediVueDxAlertDefinitions";
import { getProCyteOneAlertContent } from "./ProCyteOneAlertDefinitions";
import { getUriSysDxAlertContent } from "./UriSysDxAlertDefinitions";
import {
  canDismissUnmappedAcknowledgeAlert,
  isAcknowledgeAlert,
} from "./alert-component-utils";
import { getInVueDxAlertContent } from "./InVueDxAlertDefinitions";

export function getAlertContent(
  instrumentStatus: InstrumentStatusDto,
  alertDto: AlertDto,
  onClose: () => void
) {
  const instrumentContent = getAlertContentForInstrument(
    instrumentStatus,
    alertDto,
    onClose
  );

  return (
    instrumentContent ?? (
      <GenericActionAlertContent
        instrumentStatus={instrumentStatus}
        alert={alertDto}
        actions={
          isAcknowledgeAlert(alertDto) &&
          canDismissUnmappedAcknowledgeAlert(instrumentStatus)
            ? [AlertAction.OK_REMOVE]
            : []
        }
      />
    )
  );
}

/**
 * Function that is used to locate content for an alert for a given instrument.
 *
 * Note that not all alerts have to be defined here. If the alert is simple
 * enough and requires no actions, the text content for the alert will be
 * pulled from the Alerts translation file based on the alert name.
 *
 * The following default behavior will be followed when no explicit definition is given for a fault
 * - Alert body text will be looked up matching the key format: <instrument-type>.<fault-name>.body
 * - If there is no matching key, the default text (sent by the instrument) will be used.
 * - If the fault is of type acknowledge, it will be given a single "OK" button that will send the "OK_REMOVE" action.
 * - If the fault is of any other type (system or reminder), no buttons will be added.
 * - Alerts with arguments will replace alert text content by looking for the pattern "{{<index>}}" where 'index' is an
 *   integer starting a 0. When multiple arguments are present, they will be inserted in order looking for placeholders
 *   matching an ascending index. e.g. "There are {{0}} days in week and {{1}} weeks in a year" where the alert arguments
 *   would be 7 and 52. Please note that alert arguments use a numbered index by default by may be given explicit names
 *   by the IVLS server in some cases. See examples in existing instrument specific alert definition files
 *   (e.g. SediVueDxAlertDefinitions.tsx).
 *   In the IVLS server, see implementations of com.idexx.labstation.dal.entity.ConnectedDevice#addAlertArguments
 *
 * Generally speaking, a definition is not needed when a fault is of type acknowledge and needs only an "OK" button
 * OR a fault is of type system and needs no buttons driving an IVLS initiated workflow (i.e. the fault is not actionable
 * via IVLS software and must be addressed at the physical instrument reporting the fault.)
 */
function getAlertContentForInstrument(
  instrumentStatus: InstrumentStatusDto,
  alertDto: AlertDto,
  onClose: () => void
) {
  switch (instrumentStatus.instrument.instrumentType) {
    case InstrumentType.CatalystDx:
      return getCatDxAlertContent(instrumentStatus, alertDto, onClose);
    case InstrumentType.CatalystOne:
      return getCatOneAlertContent(instrumentStatus, alertDto, onClose);
    case InstrumentType.CoagDx:
      return getCoagDxAlertContent(instrumentStatus, alertDto, onClose);
    case InstrumentType.ProCyteDx:
      return getProCyteDxAlertContent(instrumentStatus, alertDto, onClose);
    case InstrumentType.ProCyteOne:
      return getProCyteOneAlertContent(instrumentStatus, alertDto, onClose);
    case InstrumentType.SediVueDx:
      return getSediVueDxAlertContent(instrumentStatus, alertDto, onClose);
    case InstrumentType.UriSysDx:
      return getUriSysDxAlertContent(instrumentStatus, alertDto, onClose);
    case InstrumentType.Theia:
      return getInVueDxAlertContent(instrumentStatus, alertDto, onClose);
  }
}
