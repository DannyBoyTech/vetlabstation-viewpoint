import { Spinner } from "@viewpoint/spot-react";
import styled from "styled-components";
import { HTMLAttributes } from "react";

const SpinnerWrapper = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const FullSizeSpinner = (props: HTMLAttributes<HTMLDivElement>) => (
  <SpinnerWrapper {...props}>
    <Spinner size="large"></Spinner>
  </SpinnerWrapper>
);
