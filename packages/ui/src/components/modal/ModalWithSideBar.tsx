import styled from "styled-components";
import { ResponsiveModalWrapper } from "./ResponsiveModalWrapper";
import { DarkTheme, SpotTokens, Theme } from "../../utils/StyleConstants";

/**
 * Common components for a modal with a sidebar on the left. Currently used in both
 * the alerts modal, and the Help page for individual instrument help modals.
 */

export const SideBarModalRoot = styled.div`
  background-color: ${(p: { theme: Theme }) =>
    p.theme.getOppositeTheme().colors?.background?.primary};
  border-radius: ${SpotTokens.border.radius.container};
  overflow: hidden;
  display: flex;

  > .spot-modal {
    width: 100%;
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }
`;

export const SideBarModalSideBarRoot = styled.div.attrs({
  className: DarkTheme.primaryContainerClass,
})`
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow-y: auto;
  padding: 20px 5px 20px 10px;
  width: 110px;
`;
