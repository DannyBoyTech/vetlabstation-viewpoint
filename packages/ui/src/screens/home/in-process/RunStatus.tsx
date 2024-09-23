import { useTranslation } from "react-i18next";
import { useFormatDurationMinsSecs } from "../../../utils/hooks/datetime";
import { StatusPill } from "./StatusPill";
import styled from "styled-components";
import { InstrumentRunStatus } from "@viewpoint/api";
import { ProgressBar, SpotText } from "@viewpoint/spot-react";
import { SpotIcon } from "@viewpoint/spot-icons";
import { useContext } from "react";
import { ViewpointThemeContext } from "../../../context/ThemeContext";
import { useFormatPercent } from "../../../utils/hooks/number-format";

const ProgressContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const StatusLabel = styled.div`
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 85px;
  overflow: hidden;
`;

interface RunStatusProps {
  status?: InstrumentRunStatus;
  progress?: number;
  timeRemainingMillis?: number;
}

const StatusPillStatuses: InstrumentRunStatus[] = [
  InstrumentRunStatus.Requires_User_Input,
  InstrumentRunStatus.Awaiting_Manual_Entry,
  InstrumentRunStatus.Complete_On_Instrument,
  InstrumentRunStatus.At_Instrument,
];
const SpinnerStatusPillStatuses: InstrumentRunStatus[] = [
  InstrumentRunStatus.Complete_On_Instrument,
];

export const RunStatus = ({
  status,
  progress,
  timeRemainingMillis,
}: RunStatusProps) => {
  const { t } = useTranslation();
  const { theme } = useContext(ViewpointThemeContext);
  const formatDurationMinsSecs = useFormatDurationMinsSecs();
  const formatPercent = useFormatPercent();

  if (status != null) {
    if (progress != null || timeRemainingMillis != null) {
      if (timeRemainingMillis != null && timeRemainingMillis >= 0) {
        return (
          <StatusPill status={status}>
            <StatusLabel>
              {formatDurationMinsSecs(timeRemainingMillis)}{" "}
              {t("inProcess.patientCard.min")}
            </StatusLabel>
          </StatusPill>
        );
      } else if (progress != null && progress >= 0 && progress <= 1) {
        return (
          <ProgressContainer>
            <SpotText level="tertiary">
              {formatPercent((progress * 100).toFixed(0))}
            </SpotText>
            <ProgressBar size="small" progress={progress} />
          </ProgressContainer>
        );
      }
    } else if (StatusPillStatuses.includes(status)) {
      return (
        <StatusPill
          status={status}
          includeSpinner={SpinnerStatusPillStatuses.includes(status)}
        />
      );
    }
  }

  return (
    <SpotIcon
      name="next"
      size={20}
      color={theme.getOppositeTheme().colors?.text?.secondary} // TODO - confirm color choice
    />
  );
};
