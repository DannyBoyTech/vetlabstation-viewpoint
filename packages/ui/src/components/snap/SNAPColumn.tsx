import { ReactNode } from "react";
import styled from "styled-components";
import { Theme } from "../../utils/StyleConstants";
import classnames from "classnames";

const Root = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  
  width: 160px;
  height: 288px;

  outline: ${(p: { theme: Theme }) => p.theme.borders?.lightSecondary};
  border-radius: 3px;
  padding: 12px 12px 16px 12px;
  overflow: hidden;

  &.selected {
    outline: ${(p: { theme: Theme }) =>
      `3px solid ${p.theme.colors?.interactive?.primary}`};
    background: #53a9b812;
    font-weight: bold !important;
  }

  &.selected.abnormal {
    outline: ${(p: { theme: Theme }) =>
      `3px solid ${p.theme.colors?.feedback?.error}`};
    background: #ff979612;
    color: ${(p: { theme: Theme }) => p.theme.colors?.feedback?.error};
`;

const LabelContainer = styled.div`
  flex: 0 0 20%;
  overflow: hidden;
  text-align: center;
`;

const ImageContainer = styled.div`
  flex: 0 0 75%;
  overflow: hidden;
`;

interface SNAPColumnProps {
  className?: string;
  "data-testid"?: string;

  label: ReactNode;
  image: ReactNode;
  selected?: boolean;
  abnormal?: boolean;

  onClick?: () => void;
}

export function SNAPColumn(props: SNAPColumnProps) {
  const classes = classnames("snap-column", props.className, {
    selected: props.selected,
    abnormal: props.abnormal,
  });
  return (
    <Root
      className={classes}
      data-testid={props["data-testid"]}
      onClick={props.onClick}
    >
      <LabelContainer className="snap-column__label">
        {props.label}
      </LabelContainer>
      <ImageContainer className="snap-column__image">
        {props.image}
      </ImageContainer>
    </Root>
  );
}
