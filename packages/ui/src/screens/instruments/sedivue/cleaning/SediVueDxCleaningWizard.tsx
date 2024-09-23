import { MaintenanceProcedure, MaintenanceProcedureCode } from "@viewpoint/api";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@viewpoint/spot-react";
import { BasicModal } from "../../../../components/basic-modal/BasicModal";
import { useTranslation } from "react-i18next";
import {
  WizardFooter,
  WizardHeader,
  WizardModalWrapper,
  WizardStepDetails,
} from "../../../../components/wizard/wizard-components";
import { PowerDownContent } from "./content/PowerDown";
import { PipettingWindow } from "./content/PipettingWindow";
import { CartridgeTrack } from "./content/CartridgeTrack";
import { CartridgeHolder } from "./content/CartridgeHolder";
import { OpticalWindow } from "./content/OpticalWindow";
import { ShieldAndWasteBin } from "./content/ShieldAndWasteBin";
import { CentrifugeArm } from "./content/CentrifugeArm";
import { MoveArm } from "./content/MoveArm";
import { ReplaceComponents } from "./content/ReplaceComponents";
import { FanFilter } from "./content/FanFilter";
import {
  useCancelProcedureMutation,
  useGetInstrumentQuery,
  useStartupInstrumentMutation,
} from "../../../../api/InstrumentApi";
import { PusherArm } from "./content/PusherArm";
import { LandingPage } from "./content/LandingPage";
import { useRequestSediVueProcedureMutation } from "../../../../api/SediVueApi";
import { SvdxCleaningStep } from "./utils";

const HalfDoorStepOrder = Object.values(SvdxCleaningStep).filter(
  (step) => step !== SvdxCleaningStep.PusherArm
);
const FullDoorStepOrder = Object.values(SvdxCleaningStep).filter(
  (step) =>
    !(
      [
        SvdxCleaningStep.CentrifugeArm,
        SvdxCleaningStep.CartridgeTrack,
      ] as SvdxCleaningStep[]
    ).includes(step)
);

export interface SediVueDxCleaningWizardProps {
  instrumentId: number;
  onCancel?: () => void;
  onDone?: () => void;
}

export function SediVueDxCleaningWizard({
  onCancel,
  onDone,
  instrumentId,
}: SediVueDxCleaningWizardProps) {
  const [open, setOpen] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  const { data: instrumentStatus } = useGetInstrumentQuery(instrumentId);

  const { t } = useTranslation();

  const [requestProcedure] = useRequestSediVueProcedureMutation();
  const [cancelProcedure] = useCancelProcedureMutation();
  const [startupInstrument] = useStartupInstrumentMutation();

  const halfDoor =
    !!instrumentStatus?.instrument.instrumentBooleanProperties?.[
      "svdx.hardware.new"
    ];
  const steps = halfDoor ? HalfDoorStepOrder : FullDoorStepOrder;
  const currentStep = steps[currentIndex];

  useEffect(() => {
    requestProcedure({
      procedure: MaintenanceProcedure.GENERAL_CLEAN,
      instrumentId: instrumentId,
    });
  }, [instrumentId, requestProcedure]);

  const onNext = () => {
    if (currentIndex + 1 >= steps.length) {
      handleDone();
    }
    setCurrentIndex((ci) => ci + 1);
  };

  const handleDone = useCallback(() => {
    startupInstrument(instrumentId);
    onDone?.();
  }, [instrumentId, onDone, startupInstrument]);

  const handleCancel = useCallback(() => {
    cancelProcedure({
      procedure: MaintenanceProcedureCode.GENERAL_CLEAN,
      instrumentId: instrumentId,
    });
    setOpen(false);
    onCancel?.();
  }, [cancelProcedure, onCancel, instrumentId]);

  const onBack = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((ci) => ci - 1);
    } else {
      handleCancel();
    }
  }, [currentIndex, handleCancel]);

  const { bodyContent, footerProps }: WizardStepDetails = useMemo(() => {
    switch (currentStep) {
      case SvdxCleaningStep.Landing:
        return {
          bodyContent: <LandingPage halfDoor={halfDoor} />,
          footerProps: {
            backButton: (
              <Button buttonType="link" onClick={onBack}>
                {t("general.buttons.cancel")}
              </Button>
            ),
          },
        };
      case SvdxCleaningStep.PowerDown:
        return {
          bodyContent: (
            <PowerDownContent
              halfDoor={halfDoor}
              instrumentId={instrumentId}
              isConnected={!!instrumentStatus?.connected}
            />
          ),
          footerProps: {
            nextButtonProps: {
              disabled: !!instrumentStatus?.connected,
            },
          },
        };
      case SvdxCleaningStep.PipettingWindow:
        return {
          bodyContent: <PipettingWindow halfDoor={halfDoor} />,
        };
      case SvdxCleaningStep.CartridgeHolder:
        return {
          bodyContent: <CartridgeHolder halfDoor={halfDoor} />,
        };
      case SvdxCleaningStep.CartridgeTrack:
        return {
          bodyContent: <CartridgeTrack halfDoor={halfDoor} />,
        };
      case SvdxCleaningStep.PusherArm:
        return {
          bodyContent: <PusherArm halfDoor={halfDoor} />,
        };
      case SvdxCleaningStep.OpticalWindow:
        return {
          bodyContent: <OpticalWindow halfDoor={halfDoor} />,
        };
      case SvdxCleaningStep.ShieldAndWasteBin:
        return {
          bodyContent: <ShieldAndWasteBin halfDoor={halfDoor} />,
        };
      case SvdxCleaningStep.CentrifugeArm:
        return {
          bodyContent: <CentrifugeArm halfDoor={halfDoor} />,
        };
      case SvdxCleaningStep.MoveArm:
        return {
          bodyContent: <MoveArm halfDoor={halfDoor} />,
        };
      case SvdxCleaningStep.ReplaceComponents:
        return {
          bodyContent: <ReplaceComponents halfDoor={halfDoor} />,
        };
      case SvdxCleaningStep.FanFilter:
        return {
          bodyContent: <FanFilter />,
          footerProps: {
            nextButtonContent: t("general.buttons.done"),
            nextButtonProps: {
              rightIcon: undefined,
            },
          },
        };
      default:
        return {
          bodyContent: <div />,
        };
    }
  }, [
    currentStep,
    halfDoor,
    onBack,
    t,
    instrumentId,
    instrumentStatus?.connected,
  ]);

  return (
    <WizardModalWrapper>
      <BasicModal
        dismissable
        ignoreBackdropDismissal
        open={open}
        onClose={handleCancel}
        footerContent={
          <WizardFooter
            totalSteps={steps.length}
            currentStepIndex={currentIndex}
            onNext={onNext}
            onBack={onBack}
            {...footerProps}
          />
        }
        bodyContent={bodyContent}
        headerContent={
          <WizardHeader
            title={t(
              "instrumentScreens.sediVueDx.cleaningWizard.headers.primary"
            )}
            subTitle={t(
              `instrumentScreens.sediVueDx.cleaningWizard.headers.${currentStep}`
            )}
          />
        }
      />
    </WizardModalWrapper>
  );
}
