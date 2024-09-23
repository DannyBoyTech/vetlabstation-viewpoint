import styled from "styled-components";
import LoadingLogo from "../../assets/IDEXX_logo_black.png";
import React from "react";
import { DarkTheme } from "../../utils/StyleConstants";

export const BootRoot = styled.div`
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${DarkTheme.colors?.background
    ?.primary}; // TODO - confirm color choice
`;
export const LoadingImage = styled.img`
  width: 50%;
  max-width: 800px;
`;

export function BootScreen() {
  return (
    <BootRoot>
      <LoadingImage src={LoadingLogo} />
    </BootRoot>
  );
}
