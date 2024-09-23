import styled from "styled-components";
import { ResponsiveModalWrapper } from "../modal/ResponsiveModalWrapper";

export const ImageModalWrapper = styled(ResponsiveModalWrapper)<{
  visible: boolean;
}>`
  display: ${(p) => (p.visible ? "flex" : "none")};
`;
