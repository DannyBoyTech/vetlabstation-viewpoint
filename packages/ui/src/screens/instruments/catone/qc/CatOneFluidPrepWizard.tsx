import {
  TestId as WizardTestId,
  WizardFooter,
  WizardHeader,
  WizardModalWrapper,
  WizardStepDetails,
} from "../../../../components/wizard/wizard-components";
import { BasicModal } from "../../../../components/basic-modal/BasicModal";
import { ReactNode, useCallback, useMemo, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import styled from "styled-components";
import { SpotText } from "@viewpoint/spot-react/src";
import { CommonTransComponents } from "../../../../utils/i18n-utils";
import CatOneInstrumentImage from "../../../../assets/instruments/display/300x300/CatOne.png";
import {
  CatOneQcFluid,
  getDrawerImageForQcType,
  getLoadInstructionKeyForQcType,
  getWizardHeaderForQcType,
} from "./utils";
import { useCancelRunMutation } from "../../../../api/LabRequestsApi";
import {
  EventIds,
  ExecuteQualityControlRunResponseDto,
  InstrumentRunProgressDto,
  InstrumentStatus,
  InstrumentStatusDto,
  InstrumentType,
  QualityControlDto,
} from "@viewpoint/api";
import { useRunQcMutation } from "../../../../api/QualityControlApi";
import { useEventListener } from "../../../../context/EventSourceContext";
import { CatOneCleaningButton } from "../cleaning/CatOneCleaningButton";
import { VetTrolInstructionsButton } from "./vettrol/VetTrolInstructionsButton";

const CatOneFluidPrepStep = {
  Prep: "Prep",
  Load: "Load",
} as const;

const StepOrder = Object.values(CatOneFluidPrepStep);

export interface CatOneFluidPrepWizardProps {
  onCancel: () => void;
  onDone: () => void;
  qcFluidType: string;
  qualityControl: QualityControlDto;
  instrumentStatusDto: InstrumentStatusDto;
}

export function CatOneFluidPrepWizard({
  onCancel,
  onDone,
  qcFluidType,
  qualityControl,
  instrumentStatusDto,
}: CatOneFluidPrepWizardProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeQcRunId, setActiveQcRunId] = useState<number>();
  const [runQc, runQcStatus] = useRunQcMutation();
  const [cancelRun, cancelRunStatus] = useCancelRunMutation();

  // Once the instrument reports run progress, auto-close the wizard
  useEventListener(EventIds.InstrumentRunProgress, (msg) => {
    const progress: InstrumentRunProgressDto = JSON.parse(msg.data);
    if (progress.instrumentRunId === activeQcRunId) {
      onDone();
    }
  });

  const currentStep = StepOrder[currentIndex];

  const onNext = useCallback(() => {
    if (currentIndex + 1 >= StepOrder.length) {
      onDone();
    }
    setCurrentIndex((ci) => ci + 1);
  }, [currentIndex, setCurrentIndex, onDone]);

  const onBack = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((ci) => ci - 1);
    } else {
      onCancel();
    }
  }, [currentIndex, setCurrentIndex, onCancel]);

  const cancelQcRun = useCallback(() => {
    if (activeQcRunId !== undefined) {
      cancelRun(activeQcRunId);
      setActiveQcRunId(undefined);
    }
  }, [activeQcRunId, cancelRun]);

  const handleCancel = useCallback(() => {
    setOpen(false);
    cancelQcRun();
    onCancel();
  }, [cancelQcRun, onCancel]);

  const handlePrepMaterialsNext = useCallback(async () => {
    const instrumentId = instrumentStatusDto.instrument.id;

    const runQcDto: ExecuteQualityControlRunResponseDto = await runQc({
      instrumentId,
      qualityControl,
    }).unwrap();
    if (runQcDto.runId != null) {
      setActiveQcRunId(runQcDto.runId);
    }

    onNext();
  }, [runQc, instrumentStatusDto, qualityControl, onNext]);

  const handleLoadMaterialsBack = useCallback(() => {
    cancelQcRun();
    onBack();
  }, [cancelQcRun, onBack]);

  const getPrepStepContentForQcType = useCallback(
    (qcType?: string) => {
      switch (qcType) {
        case CatOneQcFluid.VetTrol:
          return (
            <>
              <SpotText level="paragraph">
                <Trans
                  i18nKey={
                    "instrumentScreens.catOne.fluidPrepWizard.vetTrol.prep1"
                  }
                  components={CommonTransComponents}
                />
              </SpotText>
              <div>
                <VetTrolInstructionsButton
                  secondaryHeaderContent={t(
                    "instrumentScreens.catOne.fluidPrepWizard.vetTrol.header"
                  )}
                  buttonType="secondary"
                  buttonSize="large"
                >
                  {t(
                    "instrumentScreens.catOne.fluidPrepWizard.instructionButton.vetTrol"
                  )}
                </VetTrolInstructionsButton>
              </div>
              <SpotText level="paragraph">
                <Trans
                  i18nKey={
                    "instrumentScreens.catOne.fluidPrepWizard.vetTrol.prep2"
                  }
                  components={CommonTransComponents}
                />
              </SpotText>
              <div>
                <CatOneCleaningButton
                  instrumentStatus={instrumentStatusDto}
                  buttonType="secondary"
                  buttonSize="large"
                >
                  {t(
                    "instrumentScreens.catOne.fluidPrepWizard.instructionButton.clean"
                  )}
                </CatOneCleaningButton>
              </div>
            </>
          );
        case CatOneQcFluid.Phbr:
          return (
            <>
              <SpotText level="paragraph">
                <Trans
                  i18nKey={"instrumentScreens.catOne.fluidPrepWizard.phbr.prep"}
                  components={CommonTransComponents}
                />
              </SpotText>
              <div>
                <CatOneCleaningButton
                  instrumentStatus={instrumentStatusDto}
                  buttonType="secondary"
                  buttonSize="large"
                >
                  {t(
                    "instrumentScreens.catOne.fluidPrepWizard.instructionButton.clean"
                  )}
                </CatOneCleaningButton>
              </div>
            </>
          );
        case CatOneQcFluid.Upro:
          return (
            <>
              <SpotText level="paragraph">
                <Trans
                  i18nKey={"instrumentScreens.catOne.fluidPrepWizard.upro.prep"}
                  components={CommonTransComponents}
                />
              </SpotText>
              <div>
                <CatOneCleaningButton
                  instrumentStatus={instrumentStatusDto}
                  buttonType="secondary"
                  buttonSize="large"
                >
                  {t(
                    "instrumentScreens.catOne.fluidPrepWizard.instructionButton.clean"
                  )}
                </CatOneCleaningButton>
              </div>
            </>
          );
        case CatOneQcFluid.Advanced:
          return (
            <>
              <SpotText level="paragraph">
                <Trans
                  i18nKey={
                    "instrumentScreens.catOne.fluidPrepWizard.advanced.prep"
                  }
                  components={CommonTransComponents}
                />
              </SpotText>
              <div>
                <CatOneCleaningButton
                  instrumentStatus={instrumentStatusDto}
                  buttonType="secondary"
                  buttonSize="large"
                >
                  {t(
                    "instrumentScreens.catOne.fluidPrepWizard.instructionButton.clean"
                  )}
                </CatOneCleaningButton>
              </div>
            </>
          );
        default:
          throw new Error(`No drawer image for CatOne QC type: ${qcType}`);
      }
    },
    [t, instrumentStatusDto]
  );

  const { bodyContent, footerProps }: WizardStepDetails = useMemo(() => {
    switch (currentStep) {
      case CatOneFluidPrepStep.Prep:
        return {
          bodyContent: (
            <FluidPrepStep
              imgSrc={CatOneInstrumentImage}
              stepContent={getPrepStepContentForQcType(qcFluidType)}
            />
          ),
          footerProps: {
            backButtonContent: t("general.buttons.cancel"),
            backButtonProps: {
              buttonType: "link",
            },
            nextButtonProps: {
              onClick: handlePrepMaterialsNext,
              disabled:
                instrumentStatusDto?.instrumentStatus !==
                  InstrumentStatus.Ready ||
                cancelRunStatus.isLoading ||
                runQcStatus.isLoading,
            },
          },
        };
      case CatOneFluidPrepStep.Load:
        return {
          bodyContent: (
            <FluidPrepStep
              imgSrc={getDrawerImageForQcType(qcFluidType)}
              stepContent={
                <SpotText level="paragraph">
                  <Trans
                    i18nKey={getLoadInstructionKeyForQcType(qcFluidType)}
                    components={CommonTransComponents}
                  />
                </SpotText>
              }
            />
          ),
          footerProps: {
            nextButtonContent: t("general.buttons.ok"),
            backButtonProps: {
              onClick: handleLoadMaterialsBack,
              disabled: runQcStatus.isLoading,
            },
          },
        };
    }
  }, [
    currentStep,
    t,
    instrumentStatusDto,
    qcFluidType,
    handleLoadMaterialsBack,
    handlePrepMaterialsNext,
    cancelRunStatus,
    runQcStatus,
    getPrepStepContentForQcType,
  ]);

  return (
    <WizardModalWrapper>
      <BasicModal
        data-testid={WizardTestId.Modal}
        open={open}
        dismissable={true} // allow exit via 'X'
        ignoreBackdropDismissal={true} // disallow exit via 'tap outside' interaction
        onClose={handleCancel}
        headerContent={
          <WizardHeader
            title={t(getWizardHeaderForQcType(qcFluidType))}
            subTitle={t(
              `instrumentScreens.catOne.fluidPrepWizard.stepHeader.${currentStep}`
            )}
          />
        }
        bodyContent={bodyContent}
        footerContent={
          <WizardFooter
            totalSteps={StepOrder.length}
            currentStepIndex={currentIndex}
            onNext={onNext}
            onBack={onBack}
            {...footerProps}
          />
        }
      />
    </WizardModalWrapper>
  );
}

const ContentRoot = styled.div`
  display: flex;
`;

const Column = styled.div`
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;

  > img {
    max-width: 100%;
    object-fit: contain;
  }

  > .spot-typography__text--body > ol {
    list-style-position: inside;
    padding-left: 0px;
    > li:not(:last-child) {
      margin-bottom: 10px;
    }
  }
`;

interface FluidPrepStepProps {
  imgSrc: string;
  stepContent: ReactNode;
}

function FluidPrepStep(props: FluidPrepStepProps) {
  return (
    <ContentRoot>
      <Column>
        <img alt={InstrumentType.CatalystOne} src={props.imgSrc} />
      </Column>
      <Column>{props.stepContent}</Column>
    </ContentRoot>
  );
}
