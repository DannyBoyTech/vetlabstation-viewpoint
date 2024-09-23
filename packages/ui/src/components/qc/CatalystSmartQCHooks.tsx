import { useTranslation } from "react-i18next";
import { useInfoModal } from "../global-modals/components/GlobalInfoModal";
import {
  useInstrumentNameForId,
  useInstrumentSortingFn,
} from "../../utils/hooks/hooks";
import { useEventListener } from "../../context/EventSourceContext";
import {
  CatalystSmartQcReminderDto,
  EventIds,
  InstrumentStatus,
  InstrumentType,
  SmartQCResult,
  SmartQCResultDto,
} from "@viewpoint/api";
import { Button, SpotText, useToast } from "@viewpoint/spot-react";
import {
  DefaultSuccessToastOptions,
  ToastContentRoot,
  ToastText,
  ToastTextContentRoot,
} from "../../utils/toast/toast-defaults";
import { useCallback } from "react";
import styled from "styled-components";
import { getInstrumentDisplayImage } from "../../utils/instrument-utils";
import { useConfirmModal } from "../global-modals/components/GlobalConfirmModal";
import { useDeferCatOneSmartQcReminderMutation } from "../../api/CatOneApi";
import { useGetInstrumentStatusesQuery } from "../../api/InstrumentApi";
import { useNavigate } from "react-router-dom";
import { useDeferCatDxSmartQcReminderMutation } from "../../api/CatalystDxApi";

const useCatalystSmartQCResultActions = () => {
  const { t } = useTranslation();
  const { addToast } = useToast();
  const { addInfoModal } = useInfoModal();
  const instrumentNameForId = useInstrumentNameForId();

  useEventListener(EventIds.CatalystSmartQCResult, (msg) => {
    const dto: SmartQCResultDto = JSON.parse(msg.data) as SmartQCResultDto;
    const instrumentName = instrumentNameForId(dto.instrumentId);
    const { result, notify } = dto;

    if (notify) {
      if (result === SmartQCResult.PASS) {
        addToast({
          ...DefaultSuccessToastOptions,
          content: (
            <ToastContentRoot>
              <ToastTextContentRoot>
                <ToastText level="paragraph" bold $maxLines={1}>
                  {instrumentName}
                </ToastText>
                <ToastText level="paragraph" $maxLines={2}>
                  {t("qc.smartQCResult.passContent")}
                </ToastText>
              </ToastTextContentRoot>
            </ToastContentRoot>
          ),
        });
      } else if (result === SmartQCResult.OUT_OF_RANGE) {
        addInfoModal({
          secondaryHeader: instrumentName,
          header: t("qc.smartQCResult.catalyst.outOfRange.title"),
          content: t("qc.smartQCResult.catalyst.outOfRange.content"),
        });
      }
    }
  });
};

const ReminderContent = styled.div`
  display: flex;
  gap: 36px;
`;

const InstrumentImage = styled.img`
  width: 100%;
  object-fit: contain;
`;

const RightAlignedButton = styled(Button)`
  margin-left: auto;
`;

const useCatalystSmartQcReminder = () => {
  const { t } = useTranslation();
  const { addConfirmModal, removeConfirmModal } = useConfirmModal();

  const [deferCatOneReminder, deferCatOneReminderStatus] =
    useDeferCatOneSmartQcReminderMutation();

  const [deferCatDxReminder, deferCatDxReminderStatus] =
    useDeferCatDxSmartQcReminderMutation();

  const handleRemindMeLater = useCallback(
    (modalId: string, instrumentType: InstrumentType) => {
      try {
        if (instrumentType === InstrumentType.CatalystOne) {
          deferCatOneReminder();
        } else if (instrumentType === InstrumentType.CatalystDx) {
          deferCatDxReminder();
        }
        removeConfirmModal(modalId);
      } catch (err) {
        console.error(err);
      }
    },
    [deferCatDxReminder, deferCatOneReminder, removeConfirmModal]
  );

  const eventCallback = useCallback(
    (msg: MessageEvent<any>) => {
      const reminderDto = JSON.parse(msg.data) as CatalystSmartQcReminderDto;
      const modalId = `${reminderDto.instrumentType}-smartqc-reminder`;

      addConfirmModal({
        id: modalId,
        dismissable: false,
        headerContent: t("instrumentScreens.smartQc.chemistry.reminder.title"),
        secondaryHeaderContent: t(
          `instruments.names.${reminderDto.instrumentType}`
        ),
        bodyContent: (
          <CatalystSmartQcReminderContent
            instrumentType={reminderDto.instrumentType}
          />
        ),
        confirmButtonContent: (
          <>
            <RightAlignedButton
              buttonType="secondary"
              onClick={() =>
                handleRemindMeLater(modalId, reminderDto.instrumentType)
              }
            >
              {t("general.buttons.remindMeLater")}
            </RightAlignedButton>
            <CatalystSmartQcStartNowButton
              reminderDto={reminderDto}
              onComplete={() => removeConfirmModal(modalId)}
            />
          </>
        ),
        onClose: () => removeConfirmModal(modalId),
        onConfirm: () => {},
      });
    },
    [addConfirmModal, handleRemindMeLater, removeConfirmModal, t]
  );

  useEventListener(EventIds.CatalystSmartQcReminder, eventCallback);
};

function CatalystSmartQcReminderContent(props: {
  instrumentType: InstrumentType;
}) {
  const { t } = useTranslation();
  return (
    <ReminderContent>
      <div style={{ flex: 1 }}>
        <InstrumentImage
          src={getInstrumentDisplayImage(props.instrumentType)}
          alt={props.instrumentType}
        />
      </div>
      <div style={{ flex: 2 }}>
        <SpotText level="paragraph">
          {t("instrumentScreens.smartQc.chemistry.reminder.body", {
            analyzerName: t(`instruments.names.${props.instrumentType}`),
          })}
        </SpotText>
      </div>
    </ReminderContent>
  );
}

interface CatalystSmartQcStartNowButtonProps {
  onComplete: () => void;
  reminderDto: CatalystSmartQcReminderDto;
}

// Dedicated component for the "Start Now" button since it needs to be reactive
// to changing instrument statuses
function CatalystSmartQcStartNowButton({
  reminderDto,
  onComplete,
}: CatalystSmartQcStartNowButtonProps) {
  const nav = useNavigate();
  const sortInstruments = useInstrumentSortingFn();
  const { t } = useTranslation();

  const { catalystInstruments } = useGetInstrumentStatusesQuery(undefined, {
    selectFromResult: (res) => ({
      ...res,
      catalystInstruments: {
        [InstrumentType.CatalystOne]: [...(res.data ?? [])]
          ?.sort(sortInstruments)
          ?.filter(
            (is) => is.instrument.instrumentType === InstrumentType.CatalystOne
          ),
        [InstrumentType.CatalystDx]: [...(res.data ?? [])]
          ?.sort(sortInstruments)
          ?.filter(
            (is) => is.instrument.instrumentType === InstrumentType.CatalystDx
          ),
      },
    }),
  });

  const handleStartNow = useCallback(() => {
    const targetInstruments = catalystInstruments[reminderDto.instrumentType];
    if (targetInstruments == null) {
      console.error(
        `No instruments found for ${reminderDto.instrumentType} SmartQC cleaning reminder`
      );
      return;
    }
    // If there is only one target instrument, launch the SmartQC workflow,
    // otherwise navigate to the instrument screen of the first matching device
    if (
      targetInstruments.length === 1 &&
      targetInstruments[0].instrumentStatus === InstrumentStatus.Ready
    ) {
      nav(
        `/instruments/${targetInstruments[0].instrument.id}/smartQc?startSmartQC=true`
      );
    } else {
      nav(`/instruments/${targetInstruments[0].instrument.id}`);
    }
    onComplete();
  }, [catalystInstruments, nav, onComplete, reminderDto.instrumentType]);

  return (
    <Button buttonType="primary" onClick={handleStartNow}>
      {t("general.buttons.startNow")}
    </Button>
  );
}

export { useCatalystSmartQCResultActions, useCatalystSmartQcReminder };
