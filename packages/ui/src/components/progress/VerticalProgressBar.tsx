import styled from "styled-components";
import { SpotTokens } from "../../utils/StyleConstants";
import classnames from "classnames";

const Root = styled.div`
  position: relative;
  box-sizing: border-box;
  background-color: ${SpotTokens.color.theme.primary[200]};

  width: 20px;
`;

const ProgressMarker = styled.div<{ $progress?: number }>`
  position: absolute;
  bottom: 0;
  width: 100%;
  background-color: ${SpotTokens.color.theme.primary[500]};
  height: ${(p) => Math.min((p.$progress ?? 0) * 100, 100)}%;
  transition: height 0.4s linear;
`;

interface VerticalProgressBarProps {
  className?: string;
  "data-testid"?: string;

  progress?: number;
}

export function VerticalProgressBar(props: VerticalProgressBarProps) {
  const classes = classnames("vertical-progress-bar", props.className);
  return (
    <Root className={classes} data-testid="vertical-progress-bar">
      <ProgressMarker className="progress-marker" $progress={props.progress} />
    </Root>
  );
}
