import { useEventListener } from "../../../context/EventSourceContext";
import { EventIds, ResultStatusNotification } from "@viewpoint/api";
import { useConfirmModal } from "../../../components/global-modals/components/GlobalConfirmModal";
import { useTranslation } from "react-i18next";
import { useInstrumentNameForId } from "../hooks";
import { ResultStatusNotificationContent } from "../../../components/reminders/ResultStatusNotificationContent";
import { Trans } from "react-i18next";
import { CommonTransComponents } from "../../../utils/i18n-utils";

export function useResultStatusNotificationPopup() {
  const { addConfirmModal } = useConfirmModal();
  const getInstrumentName = useInstrumentNameForId();
  const { t } = useTranslation();

  useEventListener(EventIds.ResultStatusNotification, (msg) => {
    const message: ResultStatusNotification = JSON.parse(msg.data);
    addConfirmModal({
      dismissable: false,
      bodyContent: (
        <ResultStatusNotificationContent patient={message.patientDto}>
          <Trans
            i18nKey={
              message.status === "DELAYED"
                ? "reminders.resultDelayedNotification.body"
                : "reminders.resultFailedNotification.body"
            }
            components={CommonTransComponents}
          />
        </ResultStatusNotificationContent>
      ),
      headerContent: t(
        message.status === "DELAYED"
          ? "reminders.resultDelayedNotification.title"
          : "reminders.resultFailedNotification.title"
      ),
      secondaryHeaderContent: getInstrumentName(message.instrumentId),
      confirmButtonContent: t("general.buttons.ok"),
      onConfirm: () => {},
      onClose: () => {},
    });
  });
}
