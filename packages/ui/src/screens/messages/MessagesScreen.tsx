import { Button, SpotText } from "@viewpoint/spot-react";
import { useTranslation } from "react-i18next";
import { SidebarPageLayout } from "../SidebarPageLayout";
import { useCallback, useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { Message } from "@viewpoint/api";
import {
  getMessageContent,
  useDeleteMessageMutation,
  useGetMessagesQuery,
  useUnreadMessageMutation,
} from "../../api/MessageApi";
import classNames from "classnames";
import SpinnerOverlay from "../../components/overlay/SpinnerOverlay";
import {
  isFormattable,
  useFormatDateTime12h,
} from "../../utils/hooks/datetime";
import { useLocation, useNavigate } from "react-router-dom";
import { useConfirmModal } from "../../components/global-modals/components/GlobalConfirmModal";
import { PrintPreview } from "../../components/print-preview/PrintPreview";
import dayjs from "dayjs";
import {
  StickyHeaderDataTable,
  StickyHeaderTableWrapper,
} from "../../components/table/StickyHeaderTable";
import { useHeaderTitle } from "../../utils/hooks/hooks";
import { Views, pdfViewerOpts } from "../../utils/url-utils";
import { injectCssLink } from "../../utils/html-utils";

import cssLink from "../../index.css?url";
import { MessagePreviewModal } from "./MessagePreviewModal";
import { StatelessDataTable } from "@viewpoint/spot-react/src";

const PageLayout = styled(SidebarPageLayout)`
  .main-content {
    display: flex;
    flex-direction: column;
    gap: 20px;
    overflow: hidden;
  }
`;

const ContentContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;
`;

function Heading() {
  const { t } = useTranslation();
  return <SpotText level="h3">{t("messagesScreen.title")}</SpotText>;
}

function unreadRow(row: { original?: { unread?: unknown } }) {
  return typeof row.original?.["unread"] == "boolean"
    ? row.original?.["unread"]
    : false;
}

interface MaybeBoldTextProps {
  className?: string;

  value?: string;
  bold?: boolean;
}

function MaybeBoldText(props: MaybeBoldTextProps) {
  const { t } = useTranslation();

  return (
    <SpotText
      className={props.className}
      level="paragraph"
      bold={props.bold ?? false}
    >
      {props.value != null ? props.value : t("general.placeholder.noValue")}
    </SpotText>
  );
}

const NoWrapMaybeBoldText = styled(MaybeBoldText)`
  white-space: nowrap;
`;

function TextCell({ value, row }: { value: unknown; row: any }) {
  const text = value != null ? String(value) : undefined;

  return <MaybeBoldText value={text} bold={unreadRow(row)} />;
}

function DateReceivedCell({ value, row }: { value: unknown; row: any }) {
  const formatDateTime12h = useFormatDateTime12h();

  const text =
    value != null && isFormattable(value)
      ? formatDateTime12h(value)
      : undefined;

  return <NoWrapMaybeBoldText value={text} bold={unreadRow(row)} />;
}

export const calculateRowProps = (
  props: Record<string, unknown>,
  meta: any
) => {
  const existingClass =
    typeof props.className === "string" ? props.className : undefined;

  const disabledClass =
    meta?.row?.original?.unread !== true ? "unread" : undefined;

  const rowClasses = classNames(existingClass, disabledClass);

  const rowProps = { ...props };

  if (rowClasses) {
    rowProps.className = rowClasses;
  }

  return rowProps;
};

function sortByDateReceivedDesc(messages?: Message[]): Message[] | undefined {
  return messages
    ?.map((message) => ({
      message,
      received: dayjs(message.dateReceived).valueOf(),
    }))
    .sort((a, b) => b.received - a.received)
    .map(({ message }) => message);
}

interface MessagesTableProps {
  className?: string;
  "data-testid"?: string;

  messages?: Message[];
  onMessageSelected?: (msg?: Message) => void;
  selectedMessageId?: number;
}

function MessagesTable(props: MessagesTableProps) {
  const { t } = useTranslation();

  const rowData = useMemo<Message[]>(
    () => sortByDateReceivedDesc(props.messages) ?? [],
    [props.messages]
  );

  const columns = useMemo(
    () => [
      {
        Header: t("messagesScreen.category"),
        accessor: "category",
        Cell: TextCell,
      },
      {
        Header: t("messagesScreen.subject"),
        accessor: "subject",
        Cell: TextCell,
      },
      {
        Header: t("messagesScreen.received"),
        accessor: "dateReceived",
        Cell: DateReceivedCell,
      },
    ],
    [t]
  );

  const handleRowsSelected = (rowIndices?: number[]) => {
    const selectedMessage =
      rowIndices == null || rowIndices.length == 0
        ? undefined
        : rowData?.[rowIndices?.[0]];
    props.onMessageSelected?.(selectedMessage);
  };

  return (
    <StickyHeaderTableWrapper>
      <StatelessDataTable
        clickable={true}
        sortable={true}
        columns={columns}
        getRowProps={calculateRowProps}
        data={rowData}
        onRowsSelected={handleRowsSelected}
        selectedRowIndexes={[
          rowData.findIndex(
            (msg) => msg.notificationId === props.selectedMessageId
          ),
        ]}
      />
    </StickyHeaderTableWrapper>
  );
}

interface LocationState {
  view?: number;
}

function hasValidView(it: LocationState): boolean {
  return it.view === undefined || typeof it.view === "number";
}

function isLocationState(it: unknown): it is LocationState {
  return it != null && typeof it === "object" && hasValidView(it);
}

function MessagesScreen() {
  const { t } = useTranslation();
  useHeaderTitle({
    label: t("messagesScreen.header"),
  });

  const location = useLocation();
  const nav = useNavigate();
  const { addConfirmModal } = useConfirmModal();

  const [selectedMessageId, setSelectedMessageId] = useState<number>();
  const [showMessage, setShowMessage] = useState<boolean>(false);
  const [messageURL, setMessageURL] = useState<string>();
  const [messageDocContent, setMessageDocContent] = useState<string>();
  const [viewError, setViewError] = useState<boolean>(false);

  const { data: messages, isLoading: messagesLoading } = useGetMessagesQuery();

  const selectedMessage = useMemo(
    () =>
      selectedMessageId != null && messages != null
        ? messages?.find((it) => it.notificationId === selectedMessageId)
        : undefined,
    [messages, selectedMessageId]
  );

  const [markUnread, { isLoading: markUnreadInProgress }] =
    useUnreadMessageMutation();

  const [deleteMessage, { isLoading: deleteInProgress }] =
    useDeleteMessageMutation();

  const handleView = useCallback(async (messageId: number) => {
    if (messageId) {
      setShowMessage(true);

      try {
        const res = await getMessageContent(messageId);

        const contentType = res.headers.get("Content-Type");

        if (contentType?.toLowerCase() === "application/pdf") {
          const objectUrl = URL.createObjectURL(await res.blob());
          setMessageDocContent(undefined);
          setMessageURL(
            `${objectUrl}#${pdfViewerOpts({
              toolbar: false,
              view: Views.FIT_HORIZONTAL,
            })}`
          );
        } else {
          setMessageURL(undefined);
          setMessageDocContent(await res.text());
        }
      } catch (e) {
        console.error(`unable to view messageId ${messageId}`);
        setViewError(true);
        setMessageURL(undefined);
        setMessageDocContent(undefined);
      }
    }
  }, []);

  const handleMessageSelection = (message?: Message) => {
    setSelectedMessageId(message?.notificationId);
  };

  const handleMarkUnread = () => {
    if (selectedMessageId) {
      markUnread({ messageId: selectedMessageId });
    }
  };

  const handleDelete = () => {
    if (selectedMessageId) {
      addConfirmModal({
        headerContent: t("messagesScreen.confirmDeleteMessage.title"),
        bodyContent: t("messagesScreen.confirmDeleteMessage.areYouSure"),
        "data-testid": TestId.confirmMessageDelete,
        onConfirm: () => {
          deleteMessage({ messageId: selectedMessageId });
        },
        onClose: () => {},
        confirmButtonContent: t("general.buttons.delete"),
        cancelButtonContent: t("general.buttons.cancel"),
      });
    }
  };

  const resetViewModal = useCallback(() => {
    setShowMessage(false);
    setViewError(false);
  }, []);

  const handleBack = () => nav(-1);

  const handleCloseMessage = () => {
    setShowMessage(false);
    setViewError(false);
    setMessageURL(undefined);
    setMessageDocContent(undefined);
  };

  const handlePrintMessage = () => {
    setShowMessage(false);
  };

  // handle direct navigation from toast message click
  useEffect(() => {
    (async function () {
      if (isLocationState(location.state)) {
        const { view } = location.state;
        if (view != null && !messagesLoading && messages != null) {
          if (messages.some((it) => it.notificationId === view)) {
            setSelectedMessageId(view);
            await handleView(view);

            //rewrite history after first use so that back/forward doesn't
            //cause this logic to fire again
            nav("", {
              replace: true,
              state: { ...location.state, view: undefined },
            });
          }
        }
      }
    })();
  }, [
    location.state,
    messagesLoading,
    messages,
    handleView,
    nav,
    resetViewModal,
    selectedMessageId,
  ]);

  const messageButtonsDisabled =
    messagesLoading ||
    deleteInProgress ||
    markUnreadInProgress ||
    selectedMessageId == null;

  const TestId = {
    messageCenter: "message-center",
    viewButton: "view-button",
    deleteButton: "delete-button",
    markUnreadButton: "mark-unread-button",
    backButton: "back-button",
    confirmMessageDelete: "confirm-message-delete",
  } as const;

  return (
    <PageLayout
      data-testid={TestId.messageCenter}
      mainContent={
        <>
          <Heading />
          <ContentContainer>
            {messagesLoading && <SpinnerOverlay />}
            <MessagesTable
              messages={messages}
              selectedMessageId={selectedMessageId}
              onMessageSelected={handleMessageSelection}
            />
          </ContentContainer>
          {showMessage && selectedMessageId != null ? (
            <MessagePreviewModal
              messageId={selectedMessageId}
              onClose={handleCloseMessage}
              onConfirm={handlePrintMessage}
              error={viewError}
              url={messageURL}
              srcDoc={
                messageDocContent == null
                  ? undefined
                  : injectCssLink(messageDocContent, cssLink)
              }
            />
          ) : null}
        </>
      }
      sidebarButtons={
        <>
          <Button
            data-testid={TestId.viewButton}
            onClick={() =>
              selectedMessageId == null ? null : handleView(selectedMessageId)
            }
            disabled={messageButtonsDisabled}
          >
            {t("general.buttons.view")}
          </Button>
          <Button
            data-testid={TestId.markUnreadButton}
            onClick={handleMarkUnread}
            disabled={messageButtonsDisabled || selectedMessage?.unread}
          >
            {t("messagesScreen.markAsUnread")}
          </Button>
          <Button
            data-testid={TestId.deleteButton}
            onClick={handleDelete}
            disabled={messageButtonsDisabled}
          >
            {t("general.buttons.delete")}
          </Button>
          <Button
            data-testid={TestId.backButton}
            buttonType="secondary"
            onClick={handleBack}
          >
            {t("general.buttons.back")}
          </Button>
        </>
      }
    />
  );
}

export { MessagesScreen };
