import styled from "styled-components";
import { Card } from "@viewpoint/spot-react";

export const StyledCard = styled(Card)<{ disabled: boolean }>`
  position: relative;
  width: 200px;
  height: 275px;

  ${(p) => (p.disabled ? "pointer-events: none;" : "")}

  .spot-icon {
    width: 35px;
    height: 35px;
    fill: ${(p) =>
      p.disabled
        ? p.theme.colors?.text?.disabled
        : p.theme.colors?.interactive?.primary};
  }

  .spot-card--body {
    flex-direction: column;
    gap: 24px;
    height: 100%;
  }

  .spot-typography__text--body {
    ${(p) => (p.disabled ? `color: ${p.theme.colors?.text?.disabled};` : "")}
  }
`;
export const CardContent = styled.div`
  flex: 1;
`;
