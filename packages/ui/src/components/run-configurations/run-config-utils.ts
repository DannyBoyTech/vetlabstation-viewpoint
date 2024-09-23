import {
  DilutionTypeEnum,
  InstrumentRunConfigurationDto,
  RunConfiguration,
  TestProtocolEnum,
} from "@viewpoint/api";

import { ExclusiveRunConfigTypes } from "./RunConfigHeaderLabel";

export function getRunConfigType(
  config: InstrumentRunConfigurationDto
): ExclusiveRunConfigTypes | undefined {
  if (
    config.dilutionType != null &&
    config.dilutionType !== DilutionTypeEnum.NOTDEFINED
  ) {
    return config.dilutionType === DilutionTypeEnum.UPCAUTOMATIC
      ? RunConfiguration.UPC
      : RunConfiguration.DILUTION;
  } else if (config.testProtocol === TestProtocolEnum.BACTERIALREFLEX) {
    return RunConfiguration.BACTERIA_REFLEX;
  }
}
