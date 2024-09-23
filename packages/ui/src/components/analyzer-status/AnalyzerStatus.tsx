import { InstrumentStatus, InstrumentType } from "@viewpoint/api";
import { SpotTokens, Theme } from "../../utils/StyleConstants";
import styled from "styled-components";
import { Pill, ProgressBar, SpotText } from "@viewpoint/spot-react";
import { getInstrumentDisplayImage } from "../../utils/instrument-utils";
import { useTranslation } from "react-i18next";
import { useFormatDurationMinsSecs } from "../../utils/hooks/datetime";
import { forwardRef } from "react";
import classnames from "classnames";
import { useFormatPercent } from "../../utils/hooks/number-format";
import { VerticalProgressBar } from "../progress/VerticalProgressBar";

type InstrumentStatusWithManual = InstrumentStatus | "MANUAL";

const StatusColors: Record<
  InstrumentStatusWithManual,
  (theme: Theme) => string
> = {
  [InstrumentStatus.Alert]: (t) =>
    t.colors?.feedback?.error ?? SpotTokens.color.red["800"],
  [InstrumentStatus.Busy]: () => SpotTokens.color.yellow["400"],
  [InstrumentStatus.Not_Ready]: () => SpotTokens.color.yellow["400"],
  [InstrumentStatus.Offline]: () => SpotTokens.color.neutral["500"],
  [InstrumentStatus.Sleep]: () => SpotTokens.color.yellow["400"],
  [InstrumentStatus.Standby]: () => SpotTokens.color.yellow["400"],
  [InstrumentStatus.Unknown]: () => SpotTokens.color.neutral["500"],
  [InstrumentStatus.Ready]: () => SpotTokens.color.green["300"],
  MANUAL: () => SpotTokens.color.green["300"],
};

const StatusTextColorMappings: {
  [key in InstrumentStatusWithManual]?: string;
} = {
  [InstrumentStatus.Alert]: "white",
};

const Root = styled.div<{ status: InstrumentStatusWithManual }>`
  position: relative;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
  align-items: center;
  gap: 4px;

  border-radius: ${SpotTokens.border.radius.pill};
  background-color: ${(p: {
    theme: Theme;
    status: InstrumentStatusWithManual;
  }) => StatusColors[p.status]?.(p.theme)};

  line-height: 1;
  padding: 4px;
  min-width: 80px;
  height: 100%;
`;

const TextContainer = styled.div<{
  status: InstrumentStatusWithManual;
  $hidden?: boolean;
}>`
  ${(p) => (p.$hidden ? "visibility: hidden;" : "")}
  text-align: center;

  .spot-typography__text--tertiary.spot-typography__text--tertiary {
    font-size: 11px;
  }

  .spot-typography__text--tertiary.spot-typography__text--tertiary,
  .spot-typography__text--secondary.spot-typography__text--secondary,
  .spot-typography__text--body.spot-typography__text--body {
    color: ${(p) => StatusTextColorMappings[p.status] ?? "black"};
    white-space: nowrap;
  }
`;

const Body = styled.div`
  display: flex;
  flex-direction: row;
  gap: 6px;
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;

  > .analyzer-img {
    height: 44px;
  }

  > .analyzer-status {
    padding: 1px 0 0 0;
  }
`;

const StyledVerticalProgressBar = styled(VerticalProgressBar)`
  && {
    width: 10px;
  }
`;

export interface AnalyzerStatusProps {
  className?: string;
  instrumentName?: string;
  instrumentType: InstrumentType;
  status: InstrumentStatusWithManual;
  onClick?: () => void;
  progress?: number;
  timeRemaining?: number;
}

export function AnalyzerStatus(props: AnalyzerStatusProps) {
  const classes = classnames("analyzer-status", props.className);

  return (
    <Root status={props.status} onClick={props.onClick} className={classes}>
      <TextContainer status={props.status} className="analyzer-name">
        <SpotText level="tertiary">{props.instrumentName}</SpotText>
      </TextContainer>
      <Body>
        <MainContent>
          <img
            className="analyzer-img"
            alt={props.instrumentName}
            src={getInstrumentDisplayImage(props.instrumentType)}
          />
          <StatusFooter
            progress={props.progress}
            timeRemaining={props.timeRemaining}
            status={props.status}
          />
        </MainContent>
        {props.progress != null && (
          <StyledVerticalProgressBar progress={props.progress} />
        )}
      </Body>
    </Root>
  );
}

const StatusPill = styled(Pill)`
  box-sizing: border-box;
  white-space: nowrap;
  padding: 1px 5px;
  height: 13.5px;
`;

interface ProgressPillProps {
  className?: string;
  progress: number;
}

function ProgressPill(props: ProgressPillProps) {
  const formatPercent = useFormatPercent();
  const classes = classnames("progress-pill", props.className);
  const formattedProgress = formatPercent((props.progress * 100).toFixed(0));

  return (
    <StatusPill className={classes} level="primary" small>
      {formattedProgress}
    </StatusPill>
  );
}

interface TimeRemainingPillProps {
  className?: string;
  timeRemaining: number;
}

function TimeRemainingPill(props: TimeRemainingPillProps) {
  const formatDurationMinsSecs = useFormatDurationMinsSecs();
  const classes = classnames("time-remaining-pill", props.className);
  const formattedTimeRemaining = formatDurationMinsSecs(props.timeRemaining);

  return (
    <StatusPill className={classes} level="primary" small>
      {formattedTimeRemaining}
    </StatusPill>
  );
}

const StatusFooterRoot = styled.div`
  max-height: 13.5px;
  overflow: hidden;
`;

interface StatusFooterProps {
  className?: string;

  progress?: number;
  timeRemaining?: number;
  status: InstrumentStatusWithManual;
}

function StatusFooter(props: StatusFooterProps) {
  const { t } = useTranslation();

  const classes = classnames("status-footer", props.className);

  return (
    <StatusFooterRoot className={classes}>
      {props.timeRemaining != null ? (
        <TimeRemainingPill timeRemaining={props.timeRemaining} />
      ) : props.progress != null ? (
        <ProgressPill progress={props.progress} />
      ) : (
        <TextContainer status={props.status} className="analyzer-status">
          <SpotText bold level="secondary">
            {t(`instruments.status.${props.status}`)}
          </SpotText>
        </TextContainer>
      )}
    </StatusFooterRoot>
  );
}

const AnalyzerIconRoot = styled.div<{ status: InstrumentStatus }>`
  width: 35px;
  height: 35px;
  border-radius: ${SpotTokens.border.radius.pill};
  background-color: ${(p: { theme: Theme; status: InstrumentStatus }) =>
    StatusColors[p.status](p.theme)};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const AnalyzerIconImg = styled.img`
  object-fit: contain;
  height: 25px;
  width: 25px;
`;

export interface AnalyzerIconProps {
  instrumentType: InstrumentType;
  instrumentStatus: InstrumentStatus;
}

export const AnalyzerIcon = forwardRef<HTMLDivElement, AnalyzerIconProps>(
  (props: AnalyzerIconProps, ref) => {
    return (
      <AnalyzerIconRoot status={props.instrumentStatus} ref={ref}>
        <AnalyzerIconImg
          src={getInstrumentDisplayImage(props.instrumentType)}
        />
      </AnalyzerIconRoot>
    );
  }
);
