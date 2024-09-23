import styled from "styled-components";
import { Theme } from "../../../utils/StyleConstants";
import { BookIcon, BookIconProps } from "./BookIcon";
import { Collapse } from "../../collapse/Collapse";

const DifferentialIconRoot = styled.div<{ $hidden?: boolean }>`
  display: flex;
  margin-right: 4px;
  ${(props) => (props.$hidden ? "visibility: hidden" : "")};

  width: 16px;
  flex-shrink: 0;
  > svg {
    fill: ${(p: { theme: Theme }) => p.theme.colors?.text?.link};
  }
`;

interface DifferentialProps extends Omit<BookIconProps, "name"> {
  hidden?: boolean;

  onClick?: () => void;
}

export function DifferentialIcon(props: DifferentialProps) {
  return (
    <DifferentialIconRoot $hidden={props.hidden} onClick={props.onClick}>
      <BookIcon filled={props.filled} />
    </DifferentialIconRoot>
  );
}

const StyledCollapse = styled(Collapse)`
  grid-column: 1 / span 4; /* align to current result in ResultTableRowRoot, which uses grid cols 1-4 */
`;

const StyledIframe = styled.iframe`
  width: 100%;
  height: 300px;
  border-radius: 10px;
  border: ${(p: { theme: Theme }) => p.theme.borders?.lightPrimary};
  margin-top: 4px;
`;

interface DifferentialContentProps {
  open?: boolean;
  content: string;
}

export function DifferentialContent(props: DifferentialContentProps) {
  return (
    <StyledCollapse
      expanded={props.open}
      onExpanded={(ref) => {
        ref?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }}
    >
      <StyledIframe srcDoc={props.content} />
    </StyledCollapse>
  );
}
