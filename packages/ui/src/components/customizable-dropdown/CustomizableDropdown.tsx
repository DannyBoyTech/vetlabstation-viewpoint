import styled from "styled-components";
import { Theme } from "../../utils/StyleConstants";
import { PropsWithChildren, ReactNode } from "react";
import { SpotText } from "@viewpoint/spot-react";
import { Expander } from "../collapse/Expander";
import { Collapse } from "../collapse/Collapse";

const Header = styled.div`
  display: flex;
  align-items: center;
  border: ${(t: { theme: Theme }) => t.theme.borders?.control};

  .expander {
    margin-left: auto;
  }

  &.expanded {
    border: ${(t: { theme: Theme }) => t.theme.borders?.controlFocus};
  }
`;

const ContentWrapper = styled.div`
  background-color: ${(p: { theme: Theme }) =>
    p.theme.colors?.background?.primary};
  border: ${(p: { theme: Theme }) => p.theme.borders?.controlFocus};
  padding: 10px;
`;

const ExpanderWrapper = styled.div`
  margin-right: 10px;
  margin-left: auto;
`;

const DefaultHeader = styled.div`
  padding: 10px;
  display: flex;
  align-items: center;
`;

export interface CustomizableDropdownProps extends PropsWithChildren {
  headerContent: string | ReactNode;
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
}

export function CustomizableDropdown(props: CustomizableDropdownProps) {
  return (
    <div>
      <Header onClick={() => props.onExpandedChange?.(!props.expanded)}>
        {typeof props.headerContent === "string" ? (
          <DefaultHeader>
            <SpotText level="secondary">{props.headerContent}</SpotText>
          </DefaultHeader>
        ) : (
          props.headerContent
        )}
        <ExpanderWrapper>
          <Expander expanded={props.expanded} />
        </ExpanderWrapper>
      </Header>
      <Collapse expanded={props.expanded}>
        <ContentWrapper>{props.children}</ContentWrapper>
      </Collapse>
    </div>
  );
}
