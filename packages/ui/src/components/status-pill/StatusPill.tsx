import { Pill } from "@viewpoint/spot-react";
import { PillProps } from "@viewpoint/spot-react/src/components/pill/Pill";
import { useTranslation } from "react-i18next";
import { getInstrumentStatusDisplayName } from "../../utils/instrument-utils";
import { InstrumentStatus } from "@viewpoint/api";

export interface StatusPillProps extends PillProps {
  status: InstrumentStatus;
}

type PillLevel = NonNullable<PillProps["level"]>;

const pillLevelByStatus: Record<InstrumentStatus, PillLevel> = {
  [InstrumentStatus.Ready]: "positive",
  [InstrumentStatus.Busy]: "warning",
  [InstrumentStatus.Standby]: "warning",
  [InstrumentStatus.Sleep]: "warning",
  [InstrumentStatus.Offline]: "secondary",
  [InstrumentStatus.Alert]: "negative",
  [InstrumentStatus.Not_Ready]: "warning",
  [InstrumentStatus.Unknown]: "negative",
};

function pillLevelForStatus(status: InstrumentStatus): PillLevel {
  return pillLevelByStatus[status] ?? "primary";
}

export const StatusPill = ({ status, ...props }: StatusPillProps) => {
  const { t } = useTranslation();

  return (
    <Pill outline={true} level={pillLevelForStatus(status)} {...props}>
      {getInstrumentStatusDisplayName(t, status)}
    </Pill>
  );
};
