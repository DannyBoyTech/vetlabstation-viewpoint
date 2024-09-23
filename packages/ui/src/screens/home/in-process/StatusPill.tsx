import { Pill } from "@viewpoint/spot-react";
import React, { ReactNode } from "react";
import { TFunction, useTranslation } from "react-i18next";
import styled from "styled-components";
import { InstrumentRunStatus } from "@viewpoint/api";
import { SpotIconName } from "@viewpoint/spot-icons";
import { Spinner } from "@viewpoint/spot-react/src";

export interface StatusPillProps {
  status?: InstrumentRunStatus;
  children?: ReactNode;
  leftIcon?: SpotIconName;
  includeSpinner?: boolean;
}

type PillLevel = "primary" | "secondary" | "positive" | "negative" | "warning";

const pillLevelByStatus: Record<string, PillLevel> = {
  [InstrumentRunStatus.Alert]: "negative",
  [InstrumentRunStatus.Complete]: "secondary",
};

function pillLevelForStatus(status?: InstrumentRunStatus): PillLevel {
  return (status && pillLevelByStatus[status]) ?? "primary";
}

function instrumentRunStatusDisplay(
  t: TFunction,
  status?: InstrumentRunStatus
) {
  return status && t(`inProcess.analyzerRun.status.${status}`);
}

const StatusLabel = styled.div`
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 85px;
  overflow: hidden;
`;

const StatusSpinner = styled(Spinner)`
  margin-right: 5px;
`;

export const TestId = {
  StatusPill: "status-pill",
};

export const StatusPill = (props: StatusPillProps) => {
  const { t } = useTranslation();

  return (
    <Pill
      outline={true}
      level={pillLevelForStatus(props.status)}
      data-testid={TestId.StatusPill}
    >
      {props.includeSpinner && <StatusSpinner size="small" />}
      {props.children || (
        <StatusLabel>{instrumentRunStatusDisplay(t, props.status)}</StatusLabel>
      )}
    </Pill>
  );
};
