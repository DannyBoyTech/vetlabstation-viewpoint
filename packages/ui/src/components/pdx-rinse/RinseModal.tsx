import { ConfirmModal } from "../confirm-modal/ConfirmModal";
import {
  useCancelProcedureMutation,
  useGetDetailedInstrumentStatusQuery,
} from "../../api/InstrumentApi";
import {
  useCancelMonthlyRinseMutation,
  useCancelFlowCellRinseMutation,
  useCancelWasteChamberRinseMutation,
} from "../../api/TenseiApi";
import { InstrumentType } from "@viewpoint/api";
import { HealthCode, InstrumentWaitingReason } from "@viewpoint/api";
import { Trans, useTranslation } from "react-i18next";
import { SpotText } from "@viewpoint/spot-react";
import { useCallback } from "react";
import { InlineText } from "../typography/InlineText";
import styled from "styled-components";
import StartButtonImg from "../../assets/instruments/maintenance/proCyteDx/start_button.png";

type RinseType = `${InstrumentWaitingReason}`;

interface RinseModalProps {
  instrumentId: number;
  instrumentType: InstrumentType;
  rinseType: RinseType;

  onCancelRinse?: () => void;
}

const keyDiff = {
  MonthlyRinse: "monthlyRinse",
  FlowcellRinse: "flowCellRinse",
  WasteChamberRinse: "wasteChamberRinse",
} as const;

function Header(props: {
  rinseType: RinseType;
  instrumentType: InstrumentType;
}) {
  const { t } = useTranslation();

  const headerKey = `${
    props.instrumentType === InstrumentType.Tensei
      ? "instrumentScreens.tensei.maintenance"
      : "instrumentScreens.proCyteDx.maintenance"
  }.${keyDiff[props.rinseType]}`;

  return t(headerKey as any);
}

const durationMins = {
  MonthlyRinse: 25,
  FlowcellRinse: 6,
  WasteChamberRinse: 10,
} as const;

const components = {
  strong: <InlineText level="paragraph" bold />,
} as const;

const Root = styled.div`
  display: flex;
  flex-direction: row;
  gap: 10px;
`;

const Text = styled.div`
  display: flex;
  flex-direction: column;
  gap: 30px;
`;

const Image = styled.img`
  object-fit: contain;
  align-self: flex-end;
  margin-bottom: 20px;:
`;

function Body(props: { rinseType: RinseType; instrumentType: InstrumentType }) {
  const { t } = useTranslation();

  return (
    <Root>
      <Text>
        <SpotText level="paragraph" bold>
          {t("general.messages.actionWillTakeApproximatelyDuration", {
            action: t("general.ThisProcedure"),
            duration: t("general.duration.minute", {
              count: durationMins[props.rinseType],
            }),
          })}
        </SpotText>
        <SpotText level="paragraph">
          {t(
            props.instrumentType === InstrumentType.Tensei
              ? "instrumentScreens.tensei.rinseModal.insertBleach"
              : "instrumentScreens.proCyteDx.rinseModal.insertBleach"
          )}
        </SpotText>
        <SpotText level="paragraph">
          <Trans
            i18nKey={
              props.instrumentType === InstrumentType.Tensei
                ? "instrumentScreens.tensei.rinseModal.pressStart"
                : "instrumentScreens.proCyteDx.rinseModal.pressStart"
            }
            components={components}
          />
        </SpotText>
      </Text>
      <Image width="120" height="120" src={StartButtonImg} />
    </Root>
  );
}

const RinseModal = (props: RinseModalProps) => {
  const { t } = useTranslation();

  const { data: instrumentStatus, isLoading } =
    useGetDetailedInstrumentStatusQuery(props.instrumentId);

  const [cancelProcedure] = useCancelProcedureMutation();
  const [cancelTenseiMonthlyRinse] = useCancelMonthlyRinseMutation();
  const [cancelTenseiFlowCellRinse] = useCancelFlowCellRinseMutation();
  const [cancelTenseiWasteChamberRinse] = useCancelWasteChamberRinseMutation();

  const handleCancelRinse = () => {
    if (props.instrumentType === InstrumentType.Tensei) {
      if (keyDiff[props.rinseType] === "monthlyRinse") {
        cancelTenseiMonthlyRinse(props.instrumentId);
      } else if (keyDiff[props.rinseType] === "flowCellRinse") {
        cancelTenseiFlowCellRinse(props.instrumentId);
      } else {
        cancelTenseiWasteChamberRinse(props.instrumentId);
      }
    } else {
      cancelProcedure({
        instrumentId: props.instrumentId,
        procedure: props.rinseType,
      });
    }

    props.onCancelRinse?.();
  };

  const noAction = useCallback(() => {}, []);

  return (
    <ConfirmModal
      dismissable={false}
      onClose={noAction}
      open={true}
      headerContent={
        <Header
          rinseType={props.rinseType}
          instrumentType={props.instrumentType}
        />
      }
      bodyContent={
        <Body
          rinseType={props.rinseType}
          instrumentType={props.instrumentType}
        />
      }
      cancelButtonContent={undefined}
      confirmButtonContent={t(
        props.instrumentType === InstrumentType.Tensei
          ? "instrumentScreens.tensei.rinseModal.cancelRinse"
          : "instrumentScreens.proCyteDx.rinseModal.cancelRinse"
      )}
      confirmable={
        !isLoading && instrumentStatus?.status !== HealthCode.RUNNING
      }
      onConfirm={handleCancelRinse}
    />
  );
};

export type { RinseModalProps };
export { RinseModal };
