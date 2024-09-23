import styled from "styled-components";
import { Box, BoxProps } from "./Box";

export interface StackProps extends BoxProps {
  gutter?: string;
  children?: React.ReactNode;
}

export const Stack = styled(Box).attrs<StackProps>((props) => {
  return {
    "data-vcp-layout-box": undefined,
    "data-vcp-layout-stack": "",
  };
})<StackProps>`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;

  > * {
    margin-top: 0;
    margin-bottom: 0;
  }

  > * + * {
    margin-top: ${(props) => props.gutter ?? "12px"};
  }
`;
