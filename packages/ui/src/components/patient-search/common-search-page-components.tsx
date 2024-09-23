import { Button } from "@viewpoint/spot-react";
import styled from "styled-components";

export const ButtonsColumn = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  margin-top: 32px;
  gap: 12px;
`;
export const StyledButton = styled(Button)`
  justify-content: center;
  line-height: 1;
  margin: 0 20px;
`;

export const Divider = styled.div`
  border: ${(p) => p.theme.borders?.lightPrimary};
  margin: 8px 24px;
`;
