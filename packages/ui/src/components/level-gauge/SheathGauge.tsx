import styled from "styled-components";
import { LevelGauge, LevelGaugeProps } from "./LevelGauge";
import SheathGaugeBackground from "../../assets/gauges/sheath-background.png";

const SheathGauge = styled(LevelGauge)`
  width: 60px;
  height: 130px;

  background-image: url("${SheathGaugeBackground}");
  background-position: center;
  background-repeat: no-repeat;
  background-size: contain;
  background-color: unset;

  .level-gauge__border {
    inset: 5px 10px;
  }
`;
SheathGauge.displayName = "SheathGauge";

export type { LevelGaugeProps as SheathGaugeProps };
export { SheathGauge };
