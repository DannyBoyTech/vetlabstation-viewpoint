import styled from "styled-components";
import { Spinner } from "@viewpoint/spot-react";
import { PropsWithSpotTheme } from "../../utils/StyleConstants";
import { HTMLAttributes } from "react";

const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${(props: PropsWithSpotTheme) =>
    props.theme?.colors?.background?.primary};
  opacity: 0.5;
  z-index: 50;
`;

const FixedOverlay = styled(Overlay)`
  position: fixed;
`;

const SpinnerOverlay = (props: HTMLAttributes<HTMLDivElement>) => (
  <Overlay {...props}>
    <Spinner size="large" />
  </Overlay>
);

export const FixedSpinnerOverlay = (props: HTMLAttributes<HTMLDivElement>) => (
  <FixedOverlay {...props}>
    <Spinner size="large" />
  </FixedOverlay>
);

export default SpinnerOverlay;
