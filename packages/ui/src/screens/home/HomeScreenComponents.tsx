import styled from "styled-components";
import { Button } from "@viewpoint/spot-react";
import { Theme } from "../../utils/StyleConstants";

export const HomeScreenColumn = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow: hidden;
`;
export const HomeScreenScrollContent = styled.div<{ empty?: boolean }>`
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  height: 100%;
  border-radius: 5px;

  ${(p: { theme: Theme; empty?: boolean }) =>
    p.empty ? `background-color: ${p.theme.colors?.background?.disabled}` : ""}
`;

export const HomeScreenLabelContainer = styled.div`
  display: flex;
  align-items: center;
  min-height: 45px;
  margin: 3px;
`;
export const HomeScreenButtonContainer = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  min-height: 50px;
  padding: 0 3px;
`;
export const HomeScreenButton = styled(Button)`
  flex: 1;
  justify-content: center;
`;

export const HomeScreenCard = styled.div`
  display: grid;
  row-gap: 5px;
  background-color: ${(p: { theme: Theme }) =>
    p.theme.colors?.background?.primary};
  padding: 15px;
  margin: 2px;
  outline: ${(p: { theme: Theme }) => p.theme.borders?.lightSecondary};
  border-radius: 5px;

  &:hover {
    cursor: default;
  }

  /*vv adjust patient name font size*/

  .spot-patient-display__pet-name {
    font-size: 15px;
  }

  .spot-patient-display__account {
    font-size: 12px;
  }

  /*^^ adjust patient name font size*/

  /*vv adjust sizing of patient avatar */

  .pending-list-item {
    line-height: normal;
  }

  .spot-patient-display--xs .spot-patient-display__pet-name {
    letter-spacing: normal;
  }

  .spot-patient-display--xs .spot-patient-display__account {
    letter-spacing: normal;
  }

  .spot-patient-display--xs .spot-patient-display__icon {
    height: 35px;
    width: 35px;
    margin-right: 8px;
  }

  .spot-patient-display--xs
    .spot-patient-display__icon
    .spot-patient-display__avatar {
    height: 35px;
    width: 35px;
  }

  .spot-patient-display--xs
    .spot-patient-display__icon
    .spot-patient-display__svg {
    height: 20px;
    width: 20px;
  }
`;
