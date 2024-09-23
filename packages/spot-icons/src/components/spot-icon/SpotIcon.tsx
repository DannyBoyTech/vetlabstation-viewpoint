import React, { CSSProperties, useMemo } from "react";
// @ts-ignore
import Icons from "@idexx/spot/dist/icons/spot_icons.svg";

export type SpotIconName =
  | "add"
  | "add-a-user"
  | "add-clinic"
  | "ai"
  | "ai-star"
  | "ai-wand"
  | "alert-notification"
  | "analyzer"
  | "animal-canine"
  | "animal-equine"
  | "animal-feline"
  | "animal-other"
  | "app-menu"
  | "archive"
  | "back"
  | "backward"
  | "barcode"
  | "beginning"
  | "bell"
  | "blocked"
  | "book"
  | "bookmark"
  | "brightness"
  | "building"
  | "calculator"
  | "calendar"
  | "camera"
  | "cancel"
  | "caret-down"
  | "caret-up"
  | "cart"
  | "chat"
  | "chat-2"
  | "checkbox-indeterminate"
  | "checkmark"
  | "clipboard"
  | "clipboard-medical-notes"
  | "clipboard-patient"
  | "close"
  | "cloud"
  | "cloud-connected"
  | "cloud-offline"
  | "collapse"
  | "communicate"
  | "contrast"
  | "contribute"
  | "controls"
  | "copy"
  | "crop"
  | "cry"
  | "cut"
  | "dashboard"
  | "delete"
  | "diamond"
  | "disgusted"
  | "doctor"
  | "document"
  | "double-left"
  | "double-right"
  | "download"
  | "drag"
  | "drag-2"
  | "drawer-close"
  | "drawer-open"
  | "ecg"
  | "edit"
  | "email"
  | "end"
  | "euro"
  | "expand"
  | "export"
  | "favorite-featured"
  | "feedback"
  | "file-excel"
  | "file-image"
  | "file-pdf"
  | "file-txt"
  | "file-word"
  | "file-zip"
  | "filter"
  | "fit-window"
  | "flag"
  | "folder-history"
  | "forward"
  | "forward-2"
  | "fullscreen"
  | "globe"
  | "heart"
  | "help"
  | "help-2"
  | "hide"
  | "historical"
  | "home"
  | "image"
  | "imaging"
  | "import"
  | "in-progress"
  | "inbox"
  | "info"
  | "info-2"
  | "inverse"
  | "laugh"
  | "library"
  | "link"
  | "list"
  | "lock-private"
  | "measure"
  | "medicine"
  | "menu"
  | "microchip"
  | "microphone"
  | "minus"
  | "mobile"
  | "money"
  | "moon"
  | "more"
  | "more-2"
  | "next"
  | "open-new-window"
  | "owner"
  | "panel-left-close"
  | "panel-left-open"
  | "panel-right-close"
  | "panel-right-open"
  | "paperclip"
  | "patient"
  | "patient-history"
  | "patient-list"
  | "pause"
  | "phone-contact"
  | "pill"
  | "pin"
  | "pin-2"
  | "play"
  | "plus"
  | "power"
  | "previous"
  | "price"
  | "print"
  | "reassign"
  | "recently-searched"
  | "redo"
  | "refresh-redo"
  | "reply"
  | "reply-all"
  | "reports"
  | "request"
  | "rotate"
  | "rotate-image-left"
  | "rotate-image-right"
  | "sad"
  | "sample"
  | "save"
  | "search"
  | "send"
  | "settings"
  | "share"
  | "show"
  | "sign-in"
  | "sign-out"
  | "sleepy"
  | "smile"
  | "speechless"
  | "spinner"
  | "spot_icons"
  | "stop"
  | "sun"
  | "support"
  | "test-lab"
  | "thumbs-down"
  | "thumbs-up"
  | "time-clock"
  | "tools"
  | "unarchive"
  | "undo"
  | "unlock"
  | "upload"
  | "upset"
  | "user-info"
  | "users"
  | "video"
  | "wink"
  | "workstation"
  | "zoom-in"
  | "zoom-out";

export interface SpotIconProps {
  name: SpotIconName;
  color?: string;
  size?: string | number;
  style?: CSSProperties;
  className?: string;
  ["data-testid"]?: string;
  onClick?: () => void;
}

export const SpotIcon = (props: SpotIconProps) => {
  /*
   * SVG 'presentation attributes' have a lower precendence than CSS,
   * so we apply size and color using CSS to make its behavior
   * consistent with what developers would expect from other elements.
   *
   * The following was added after the API exposed color/size, and
   * was done to prevent a large refactor.
   *
   * We should consider simplifying this component API at some point.
   */
  const style = useMemo(() => {
    const styles = { ...props.style };

    if (props.size != null) {
      styles.height = props.size;
      styles.width = props.size;
    }

    if (props.color != null) {
      styles.fill = props.color;
    }

    return styles;
  }, [props.size, props.style, props.color]);

  return (
    <svg
      style={style}
      className={`spot-icon icon icon-${props.name} ${props.className}`}
      data-testid={props["data-testid"]}
      onClick={props.onClick}
    >
      <use xlinkHref={`${Icons}#${props.name}`} />
    </svg>
  );
};

export default SpotIcon;
