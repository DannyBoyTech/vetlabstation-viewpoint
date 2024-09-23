import { SpotIcon } from "@viewpoint/spot-icons";
import { NavItem } from "@viewpoint/spot-react";
import { useGetMessageCountsQuery } from "../../api/MessageApi";
import { useNavigate } from "react-router-dom";
import { Badge } from "@viewpoint/spot-react/src";

interface MessagesIndicatorProps {
  className?: string;
  "data-testid"?: string;

  count?: number;
}

const TestId = {
  icon: "messages-icon",
} as const;

function MessagesIndicator(props: MessagesIndicatorProps) {
  const count = props?.count ?? 0;

  return (
    <Badge
      data-testid={props["data-testid"]}
      className={props.className}
      badgeContent={count}
      size="small"
      color="negative"
      hidden={count === 0}
    >
      <SpotIcon name="email" size="20" />
    </Badge>
  );
}

function MessagesNavItem() {
  const nav = useNavigate();
  const { currentData: counts } = useGetMessageCountsQuery();
  const unreadCount = counts?.unreadCount;

  return unreadCount != null && unreadCount > 0 ? (
    <NavItem data-testid={TestId.icon} onClick={() => nav("/messages")}>
      <MessagesIndicator count={unreadCount} />
    </NavItem>
  ) : null;
}

export { MessagesIndicator, MessagesNavItem };
