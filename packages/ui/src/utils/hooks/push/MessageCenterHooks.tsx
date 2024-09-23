import { EventIds, Message, MessageStatus } from "@viewpoint/api";
import { useEventListener } from "../../../context/EventSourceContext";
import { Button, useToast } from "@viewpoint/spot-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  DefaultToastOptions,
  ToastContentRoot,
  ToastText,
  ToastTextContentRoot,
} from "../../toast/toast-defaults";
import { useCallback, useEffect, useRef } from "react";
import {
  getProactiveNotificationContent,
  useLazyGetMessagesQuery,
} from "../../../api/MessageApi";
import { useConfirmModal } from "../../../components/global-modals/components/GlobalConfirmModal";
import styled from "styled-components";
import { injectCssLink } from "../../html-utils";

import cssLink from "../../../index.css?url";

type MessageLike = Pick<
  Message,
  | "guid"
  | "status"
  | "unread"
  | "notificationId"
  | "subject"
  | "proactiveNotificationPending"
>;

const seenMessages = new Set<MessageLike["guid"]>();

function isMessageLike(it: unknown): it is MessageLike {
  if (it == null || typeof it !== "object") return false;

  const maybe = it as Record<string, unknown>;

  return (
    maybe.guid != null &&
    typeof maybe.guid === "string" &&
    maybe.status != null &&
    Object.values(MessageStatus).includes(maybe.status as MessageStatus) &&
    maybe.unread != null &&
    typeof maybe.unread === "boolean"
  );
}

function newMessage(message: MessageLike) {
  return (
    message.status === MessageStatus.ADDED &&
    message.unread &&
    message.guid != null &&
    !seenMessages.has(message.guid)
  );
}

function remember(message: MessageLike) {
  if (message.guid == null) {
    console.debug(`cannot remember message without a valid guid`);
    return;
  }

  seenMessages.add(message.guid);
}

function messageDeletion(message: MessageLike) {
  return message.status === MessageStatus.DELETED;
}

function forget(message: MessageLike) {
  if (message.guid == null) {
    console.debug(`cannot forget message without a valid guid`);
    return;
  }

  seenMessages.delete(message.guid);
}

interface NewMessageToastProps {
  notificationId: number;
}

function NewMessageToast({ notificationId }: NewMessageToastProps) {
  const nav = useNavigate();
  const { t } = useTranslation();

  const handleClick = () => {
    nav("/messages", { state: { view: notificationId } });
  };

  return (
    <ToastContentRoot>
      <ToastTextContentRoot>
        <ToastText level="paragraph" onClick={handleClick}>
          {t("general.messages.newMessage")}
        </ToastText>
      </ToastTextContentRoot>
    </ToastContentRoot>
  );
}

const StyledIFrame = styled.iframe`
  border: none;
`;

interface MessageCenterNotificationModalContentProps {
  messageContent: string;
}

function MessageCenterNotificationModalContent(
  props: MessageCenterNotificationModalContentProps
) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  return (
    <StyledIFrame
      ref={iframeRef}
      onLoad={(ev) => {
        ev.currentTarget.height = `${ev.currentTarget.contentWindow?.document.body.scrollHeight}px`;
        ev.currentTarget.width = `${ev.currentTarget.contentWindow?.document.body.scrollWidth}px`;
      }}
      srcDoc={injectCssLink(props.messageContent, cssLink)}
    />
  );
}

export { useMessageCenterNotifications };

function useMessageCenterNotifications() {
  const { addToast } = useToast();
  const { addConfirmModal, removeConfirmModal } = useConfirmModal();
  const { t } = useTranslation();
  const nav = useNavigate();

  const [getMessages] = useLazyGetMessagesQuery();
  const notificationsChecked = useRef(false);

  const showMessageModal = useCallback(
    async (message: MessageLike) => {
      try {
        const messageContentResponse = await getProactiveNotificationContent(
          message.notificationId
        );
        const contentType = messageContentResponse.headers
          .get("content-type")
          ?.toLowerCase();
        if (contentType === "text/html") {
          const messageContent = await messageContentResponse.text();
          const modalId = `message-center-notification-modal-${message.notificationId}`;

          addConfirmModal({
            id: modalId,
            responsive: true,
            headerContent: message.subject ?? "",
            dismissable: false,
            confirmButtonContent: (
              <>
                <Button
                  buttonType="secondary"
                  onClick={() => {
                    nav(`/messages`, {
                      state: { view: message.notificationId },
                    });
                    removeConfirmModal(modalId);
                  }}
                >
                  {t("general.buttons.learnMore")}
                </Button>
                <Button
                  buttonType="primary"
                  onClick={() => removeConfirmModal(modalId)}
                >
                  {t("general.buttons.ok")}
                </Button>
              </>
            ),
            bodyContent: (
              <MessageCenterNotificationModalContent
                messageContent={messageContent}
              />
            ),
            onConfirm: () => {},
            onClose: () => {},
          });
        } else {
          console.warn(
            `Received proactive notification content for message ${message.notificationId} with unexpected content type "${contentType}"`
          );
        }
      } catch (err) {
        console.error(
          `Error handling proactive notification for message ${message.notificationId}`,
          err
        );
      }
    },
    [addConfirmModal, nav, removeConfirmModal, t]
  );

  useEventListener(EventIds.MessageUpdated, async (evt: MessageEvent) => {
    const jsonData = JSON.parse(evt.data);

    if (isMessageLike(jsonData)) {
      const message: MessageLike = jsonData;

      if (newMessage(message)) {
        if (message.proactiveNotificationPending) {
          await showMessageModal(message);
        } else {
          addToast({
            ...DefaultToastOptions,
            content: (
              <NewMessageToast notificationId={message.notificationId} />
            ),
          });
        }

        remember(message);
      }

      if (messageDeletion(message)) {
        forget(message);
      }
    }
  });

  useEffect(() => {
    if (!notificationsChecked.current) {
      (async function () {
        notificationsChecked.current = true;
        const messages = await getMessages().unwrap();
        messages?.forEach((msg) => {
          if (msg.proactiveNotificationPending && !seenMessages.has(msg.guid)) {
            showMessageModal(msg);
            remember(msg);
          }
        });
      })();
    }
  }, [getMessages, showMessageModal]);
}
