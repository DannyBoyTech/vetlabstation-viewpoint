import styled from "styled-components";
import { Theme } from "../../utils/StyleConstants";

export const EulaContentRoot = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
  width: 80vw;
  height: 60vh;
  gap: 20px;
`;

export const EulaContentTitle = styled.div``;

export const EulaContentBody = styled.div`
  flex: 1;
  overflow-y: auto;
  background-color: ${(p: { theme: Theme }) =>
    p.theme.colors?.background?.secondary};
`;
