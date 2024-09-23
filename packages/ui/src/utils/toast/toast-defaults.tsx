import { AddToastProps, SpotText } from "@viewpoint/spot-react";
import styled from "styled-components";

export const DefaultToastOptions: Omit<
  AddToastProps,
  "content" | "alertLevel" | "icon"
> = Object.freeze({
  timer: 6_000,
  location: "bottomLeft",
  animationIn: "slideInLeft",
  animationOut: "fadeOutLeft",
  size: "large",
});
export const DefaultSuccessToastOptions: Omit<AddToastProps, "content"> =
  Object.freeze({
    ...DefaultToastOptions,
    alertLevel: "default",
    icon: "checkmark",
  });

export const ToastContentRoot = styled.div`
  display: flex;
  overflow: hidden;
  gap: 16px;
`;
export const ToastTextContentRoot = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;
export const ToastButtonContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const ToastText = styled(SpotText)<{ $maxLines?: number }>`
  overflow: hidden;
  text-overflow: ellipsis;
  ${({ $maxLines }) =>
    $maxLines != null
      ? `
      display: -webkit-box;
      -webkit-line-clamp: ${$maxLines};
      -webkit-box-orient: vertical;
    `
      : ""}
`;
