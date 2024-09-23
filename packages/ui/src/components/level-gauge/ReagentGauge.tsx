import styled from "styled-components";
import { LevelGauge, LevelGaugeProps } from "./LevelGauge";
import ReagentGaugeBackground from "../../assets/gauges/reagent-background.png";

const ReagentGauge = styled(LevelGauge)`
  width: 60px;
  height: 130px;

  background-image: url("${ReagentGaugeBackground}");
  background-position: center;
  background-repeat: no-repeat;
  background-size: contain;
  background-color: unset;

  .level-gauge__border {
    inset: 5px 17px;
  }
`;
ReagentGauge.displayName = "ReagentGauge";

export type { LevelGaugeProps as ReagentGaugeProps };
export { ReagentGauge };
