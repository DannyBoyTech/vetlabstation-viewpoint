import styled from "styled-components";
import { Theme } from "../../utils/StyleConstants";

export const InstrumentPageRoot = styled.div`
  flex: 1;
  display: flex;
`;

export const InstrumentPageContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 30px;
  background-color: ${(p: { theme: Theme }) =>
    p.theme.colors?.background?.primary};
`;

export const InstrumentPageRightPanel = styled.div`
  flex: 0 0 225px;
  background-color: ${(p: { theme: Theme }) =>
    p.theme.colors?.background?.secondary};
  display: flex;
  flex-direction: column;
  padding-top: 20px;
`;

export const InstrumentPageRightPanelButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin: 5px 30px;
  gap: 10px;

  > .spot-button {
    justify-content: center;
    padding: 20px 0px;
  }
`;

export const InstrumentPageRightPanelDivider = styled.div`
  border: ${(p: { theme: Theme }) => p.theme.borders?.lightPrimary};
  margin: 6px 30px;
`;
