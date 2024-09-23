import styled from "styled-components";

import { Box, BoxProps } from "./Box";
import { getSizeSafe } from "./sizing-constants";

export interface BlackBoxProps extends BoxProps {
  /**
   * Minimum width of blackbox.
   *
   * @default 100px
   */
  minWidth?: string | number;

  /**
   * Minimum height of blackbox
   *
   * @default 100px
   */
  minHeight?: string | number;
}

export const BlackBox = styled(Box)<BlackBoxProps>`
  background: black;
  min-width: ${(props) => getSizeSafe(props.minWidth, "100px")};
  min-height: ${(props) => getSizeSafe(props.minHeight, "100px")};
`;
