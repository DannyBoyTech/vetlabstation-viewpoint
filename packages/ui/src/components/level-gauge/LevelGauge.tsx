import styled from "styled-components";
import { FullSizeSpinner } from "../spinner/FullSizeSpinner";
import classNames from "classnames";
import { Theme } from "../../utils/StyleConstants";

const LevelGaugeRoot = styled.div<{
  percentFull?: number;
}>`
  display: inline-block;
  position: relative;
  width: 52px;
  height: 196px;
  background-color: #d9d9d9;
  border-radius: 9px;

  .level-gauge__border {
    position: absolute;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;

    background-color: ${(p: { theme: Theme }) =>
      p.theme.colors?.background?.primary}; // TODO - confirm color choice
    border-radius: 6px;
    inset: 6px 6px;
  }

  .level-gauge__level {
    background-color: ${(p: { theme: Theme }) =>
      p.theme.colors?.text?.secondary}; // TODO - confirm color choice
    border-radius: 3px;
    margin: 3px;
    height: ${(p) => p.percentFull}%;
  }
`;
LevelGaugeRoot.displayName = "LevelGaugeRoot";

export interface LevelGaugeProps {
  className?: string;
  "data-testid"?: string;

  percentFull?: number;
}

export function LevelGauge(props: LevelGaugeProps) {
  const classes = classNames(props.className, "level-gauge");

  const clampedPercentFull = Math.min(Math.max(props.percentFull ?? 0, 0), 100);

  return (
    <LevelGaugeRoot
      data-testid={props["data-testid"]}
      className={classes}
      percentFull={clampedPercentFull}
    >
      <div className="level-gauge__border">
        <div
          className="level-gauge__level"
          role="meter"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={clampedPercentFull}
        />
        {props.percentFull == null && <FullSizeSpinner />}
      </div>
    </LevelGaugeRoot>
  );
}
