import styled from "styled-components";
import { Theme } from "../../../utils/StyleConstants";

export const Root = styled.div`
  display: flex;
  flex: 1;
`;

export const LeftSection = styled.div`
  display: flex;
  flex-direction: column;
  flex: 4;
  background-color: ${(p: { theme: Theme }) =>
    p.theme.colors?.background?.primary};
  padding: 48px;
`;

export const RightSection = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  margin: 36px;
  gap: 16px;
  button {
    justify-content: center;
  }
`;

export const InputWrapper = styled.div`
  width: 400px;
  margin-top: 16px;
`;
