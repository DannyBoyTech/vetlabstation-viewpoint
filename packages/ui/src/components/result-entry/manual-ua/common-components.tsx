import styled from "styled-components";
import { Theme } from "../../../utils/StyleConstants";

export const TestId = {
  PhysicalPage: "mua-results-entry-page-physical",
  ChemistriesPage: "mua-results-entry-page-chemistries",
  SummaryPage: "mua-results-entry-page-summary",
  NextButton: "mua-results-next",
  BackButton: "mua-results-back",
  PageMarkerContainer: "mua-page-marker-container",
  PageMarker: "mua-page-marker",
};

const BoxSize = "2.15em";

interface BoxProps {
  backgroundColor?: string;
  backgroundImageUrl?: string;
  boxSize?: string;
}
export const Box = styled.div<BoxProps>`
  width: ${(p) => p.boxSize ?? BoxSize};
  height: ${(p) => p.boxSize ?? BoxSize};
  margin: 8px;
  ${(p) => (p.backgroundColor ? `background-color: ${p.backgroundColor};` : "")}
  ${(p) =>
    p.backgroundImageUrl
      ? `background-image: url("${p.backgroundImageUrl}");`
      : ""}
  background-size: contain;
  outline: ${(p: { theme: Theme }) => p.theme.borders?.heavyPrimary};
`;

interface SelectableBoxProps extends BoxProps {
  selected: boolean;
}
export const SelectableBox = styled(Box)<SelectableBoxProps>`
  ${(p: { theme: Theme; selected?: boolean }) =>
    p.selected
      ? `outline: ${p.theme.borders?.controlFocus}; outline-width: 3px;`
      : ""}
  display: flex;
  margin: 0px;
  align-items: center;
  justify-content: center;
`;

export enum ManualUAPages {
  Physical = "Physical",
  Chemistries = "Chemistries",
  Summary = "Summary",
}
