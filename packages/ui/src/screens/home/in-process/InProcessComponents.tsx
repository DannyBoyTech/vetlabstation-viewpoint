import { useTranslation } from "react-i18next";
import { ConfirmModal } from "../../../components/confirm-modal/ConfirmModal";
import styled from "styled-components";
import { Theme } from "../../../utils/StyleConstants";
import {
  InstrumentRunStatus,
  InstrumentStatus,
  InstrumentType,
  RunningInstrumentRunDto,
  RunningLabRequestDto,
  SampleTypeEnum,
  SampleTypesMapping,
  TestProtocolEnum,
  WorkRequestStatus,
} from "@viewpoint/api";
import { AnalyzerIcon } from "../../../components/analyzer-status/AnalyzerStatus";
import { RunStatus } from "./RunStatus";
import { SpotText } from "@viewpoint/spot-react";
import { MutableRefObject, ReactNode } from "react";

export const TestId = {
  InProcessRun: "in-process-run",
};

const InProcessRunRoot = styled.div<{ selected?: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  border-radius: 10px;

  ${(p: { theme: Theme; selected?: boolean }) =>
    p.selected &&
    `
    background-color: ${p.theme.colors?.background?.secondary};
  `}
  > &.blinking {
    animation: blink-in-process 600ms infinite;

    @keyframes blink-in-process {
      50% {
        background-color: ${(p: { theme: Theme }) =>
          p.theme.colors?.interactive?.hoverPrimary};
      }
    }
  }
`;
const StatusContainer = styled.div`
  display: flex;
  margin-left: auto;
  min-width: 75px;
  justify-content: flex-end;
`;

export interface InProcessRunDisplayProps {
  onClicked: () => void;
  active: boolean;
  blinking?: boolean;

  instrumentType: InstrumentType;
  instrumentStatus: InstrumentStatus;
  instrumentName: string;

  timeRemaining?: number;
  progress?: number;
  instrumentRunStatus?: InstrumentRunStatus;
  additionalRunInfo?: ReactNode;
}

export function InProcessRunDisplay(props: InProcessRunDisplayProps) {
  return (
    <InProcessRunRoot
      data-testid={TestId.InProcessRun}
      selected={props.active}
      onClick={props.onClicked}
      className={props.blinking ? "blinking" : undefined}
    >
      <AnalyzerIcon
        instrumentType={props.instrumentType}
        instrumentStatus={props.instrumentStatus}
      />
      <div>
        <SpotText level="paragraph">{props.instrumentName}</SpotText>
        {props.additionalRunInfo}
      </div>

      <StatusContainer>
        <RunStatus
          timeRemainingMillis={props.timeRemaining}
          progress={props.progress}
          status={props.instrumentRunStatus}
        />
      </StatusContainer>
    </InProcessRunRoot>
  );
}

export interface CancelRunModalProps {
  onClose: () => void;
  onConfirm: () => void;
  instrumentName: string;

  "data-testid"?: string;
}

export function CancelRunModal(props: CancelRunModalProps) {
  const { t } = useTranslation();
  return (
    <ConfirmModal
      data-testid={props["data-testid"]}
      open={true}
      onClose={props.onClose}
      onConfirm={props.onConfirm}
      headerContent={t("inProcess.cancelRunConfirm.header", {
        analyzerName: props.instrumentName,
      })}
      bodyContent={t("inProcess.cancelRunConfirm.body")}
      cancelButtonContent={t("general.buttons.no")}
      confirmButtonContent={t("general.buttons.yes")}
    />
  );
}

export interface InProcessRunProps {
  active?: boolean;
  run: RunningInstrumentRunDto;
  labRequest: RunningLabRequestDto;
  workRequestStatus?: WorkRequestStatus;
  instrumentStatus?: InstrumentStatus;
  instrumentName: string;
  intersectionRootRef?: MutableRefObject<HTMLDivElement | null>;
}

export interface AdditionalRunInfoProps {
  run: RunningInstrumentRunDto;
  labRequest: RunningLabRequestDto;
}

export function AdditionalRunInfo(props: AdditionalRunInfoProps) {
  const { t } = useTranslation();
  const shouldShowLabel =
    props.run.runQueueId != null &&
    (props.labRequest.instrumentRunDtos?.filter(
      (ir) => ir.instrumentId === props.run.instrumentId
    )?.length ?? 0) > 1;

  return shouldShowLabel ? (
    <SpotText level="secondary">
      {t("inProcess.analyzerRun.runLabel", {
        runQueueId: props.run.runQueueId,
      })}
    </SpotText>
  ) : (
    <></>
  );
}

const RunConfigPopoverInfoRoot = styled.div`
  margin-bottom: 8px;
`;

export interface RunConfigPopoverRunDetailsProps {
  run: RunningInstrumentRunDto;
}

export function RunConfigPopoverRunDetails(
  props: RunConfigPopoverRunDetailsProps
) {
  const { t } = useTranslation();
  const runConfig = props.run.instrumentRunConfigurations?.[0] ?? {
    sampleTypeId:
      props.run.sampleType == null
        ? undefined
        : SampleTypesMapping[props.run.sampleType],
    dilution: props.run.dilution,
  };

  const sampleType: SampleTypeEnum | undefined = Object.keys(
    SampleTypesMapping
  ).find(
    (key) =>
      SampleTypesMapping[key as SampleTypeEnum] === runConfig.sampleTypeId
  ) as SampleTypeEnum | undefined;

  return (
    <RunConfigPopoverInfoRoot>
      {sampleType != null && (
        <SpotText level="secondary" bold>
          {t(`sampleType.${sampleType}` as any)}
        </SpotText>
      )}
      {runConfig.dilution != null && runConfig.dilution > 1 && (
        <SpotText level="secondary" bold>
          {t("inProcess.analyzerRun.runInfo.dilution", {
            totalParts: props.run.dilution,
            context: runConfig.dilutionType,
          })}
        </SpotText>
      )}
      {runConfig.testProtocol != null &&
        runConfig.testProtocol !== TestProtocolEnum.FULLANALYSIS && (
          <SpotText level="secondary" bold>
            {t("orderFulfillment.runConfig.labels.BACTERIA_REFLEX")}
          </SpotText>
        )}
    </RunConfigPopoverInfoRoot>
  );
}

export function hasRunConfigPopoverInfo(run: RunningInstrumentRunDto): boolean {
  return (run.dilution != null && run.dilution > 1) || run.sampleType != null;
}
