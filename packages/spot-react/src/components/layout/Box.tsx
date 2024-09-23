import styled from "styled-components";
import * as SS from "styled-system";

export interface BoxProps
  extends SS.SpaceProps,
    SS.BorderProps,
    SS.LayoutProps {}

export const Box = styled.div.attrs<BoxProps>(() => ({
  "data-vcp-layout-box": "",
}))<BoxProps>`
  box-sizing: border-box;
  ${SS.space};
  ${SS.border};
  ${SS.layout};
`;
