import { useEventListener } from "../../../context/EventSourceContext";
import { EventIds, RestartNotification } from "@viewpoint/api";
import { useConfirmModal } from "../../../components/global-modals/components/GlobalConfirmModal";
import { SpotText } from "@viewpoint/spot-react/src";
import { TFuncKey, Trans, useTranslation } from "react-i18next";
import {
  useRequestSystemRestartMutation,
  useRescheduleWeeklyRebootReminderMutation,
} from "../../../api/SystemInfoApi";
import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { CommonTransComponents } from "../../i18n-utils";
import { InlineText } from "../../../components/typography/InlineText";
import { useFormatDurationMinsSecs } from "../datetime";

const WEEKLY_REMINDER_MODAL_ID = "WEEKLY_REMINDER_MODAL_ID_9iBZUUk5RA"; //random suffix to prevent collision

export function useRestartNotificationPopup() {
  const [countdownModalShown, setCountdownModalShown] = useState(false);
  const { addConfirmModal, removeConfirmModal } = useConfirmModal();
  const { t } = useTranslation();
  const [restart] = useRequestSystemRestartMutation();
  const [reschedule] = useRescheduleWeeklyRebootReminderMutation();

  useEventListener(EventIds.RestartNotification, (msg) => {
    const notification: RestartNotification = JSON.parse(msg.data);
    switch (notification.restartReason) {
      case "WEEKLY_REMINDER":
        addConfirmModal({
          id: WEEKLY_REMINDER_MODAL_ID, //use static id to prevent multiple queued reminders
          dismissable: false,
          bodyContent: (
            <SpotText level={"paragraph"}>
              {t("rebootNotification.weeklyReminder.body")}
            </SpotText>
          ),
          headerContent: t("rebootNotification.weeklyReminder.title"),
          cancelButtonContent: t("general.buttons.cancel"),
          confirmButtonContent: t("general.buttons.restart"),
          onConfirm: () => restart(),
          onClose: () => reschedule(),
        });
        break;
      case "DST_TRANSITION":
      case "EXCESSIVE_UPTIME":
        // User could technically receive both of these at the same time.
        // We should not show both
        if (!countdownModalShown) {
          const id = addConfirmModal({
            dismissable: false,
            bodyContent: (
              <RestartCountdownModalBody
                onTimerComplete={() => {
                  restart();
                  removeConfirmModal(id);
                }}
                restartReason={notification.restartReason}
              />
            ),
            headerContent: t("rebootNotification.weeklyReminder.title"),
            confirmButtonContent: t("general.buttons.restart"),
            onConfirm: () => restart(),
            onClose: () => {
              setCountdownModalShown(false);
            },
          });
          setCountdownModalShown(true);
        }
        break;
    }
  });
}

const Body = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;

  text-align: center;
`;

interface RestartCountdownModalBodyProps {
  onTimerComplete: () => void;
  restartReason: RestartNotification["restartReason"];
}

function RestartCountdownModalBody({
  onTimerComplete,
  restartReason,
}: RestartCountdownModalBodyProps) {
  const [timeRemaining, setTimeRemaining] = useState(30000);
  const { t } = useTranslation();
  const formatDuration = useFormatDurationMinsSecs();

  const timerStarted = useRef(false);

  useEffect(() => {
    if (!timerStarted.current) {
      const interval = setInterval(() => {
        setTimeRemaining((oldTimeRemaining) =>
          oldTimeRemaining - 500 >= 0 ? oldTimeRemaining - 500 : 0
        );
      }, 500);
      timerStarted.current = true;
      return () => {
        clearInterval(interval);
        timerStarted.current = false;
      };
    }
  }, [onTimerComplete]);

  useEffect(() => {
    if (timeRemaining <= 0) {
      onTimerComplete();
    }
  }, [onTimerComplete, timeRemaining]);

  const infoKey: TFuncKey =
    restartReason === "EXCESSIVE_UPTIME"
      ? "rebootNotification.excessiveUptime.body"
      : "rebootNotification.dstTransition.body";

  return (
    <Body>
      <SpotText level="paragraph">{t(infoKey)}</SpotText>
      <SpotText level="h3">
        <Trans
          i18nKey={"rebootNotification.timeRemaining"}
          values={{
            timeRemaining: formatDuration(
              Math.max(Math.round(timeRemaining), 0)
            ),
          }}
          components={{
            strong: <InlineText level="h3" bold />,
          }}
        />
      </SpotText>
      <SpotText level="paragraph">
        <Trans
          i18nKey={"rebootNotification.pressRestart"}
          components={CommonTransComponents}
        />
      </SpotText>
    </Body>
  );
}
