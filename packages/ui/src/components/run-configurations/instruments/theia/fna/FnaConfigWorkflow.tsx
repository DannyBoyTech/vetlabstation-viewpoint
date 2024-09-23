import { FnaRunConfigurationDto, SampleSource } from "@viewpoint/api";
import { ResponsiveModalWrapper } from "../../../../modal/ResponsiveModalWrapper";
import { BasicModal } from "../../../../basic-modal/BasicModal";
import { useCallback, useMemo, useState } from "react";
import { Button, Modal, SpotText } from "@viewpoint/spot-react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { hasValidLesionAppearance, hasValidSampleLocation } from "./fna-utils";
import { SampleLocation } from "./SampleLocation";
import { LesionAppearance } from "./LesionAppearance";
import { WizardFooter } from "../../../../wizard/wizard-components";
import {
  ClinicalHistory1,
  ClinicalHistory2,
  ClinicalHistory3,
  ClinicalHistory4,
} from "./ClinicalHistory";

export const TestId = {
  NextButton: "fna-workflow-next-button",
  SaveEarlyButton: "fna-workflow-save-early-button",
};

const ScrollableModalWrapper = styled(ResponsiveModalWrapper)`
  .spot-modal {
    max-height: unset;
  }

  .spot-modal__content-wrapper {
    overflow: hidden;
  }

  .spot-modal__copy {
    overflow: hidden;
  }
`;

const Root = styled.div`
  width: 700px;
  overflow-y: auto;
  height: 500px;
`;

export interface FnaConfigWorkflowProps {
  open: boolean;
  onClose: () => void;
  onSave: (config: FnaRunConfigurationDto) => void;
  initialConfig?: FnaRunConfigurationDto;
}

const Steps = [
  "SAMPLE_LOCATION",
  "LESION_APPEARANCE",
  "CLINICAL_HISTORY_1",
  "CLINICAL_HISTORY_2",
  "CLINICAL_HISTORY_3",
  "CLINICAL_HISTORY_4",
] as const;
type Step = (typeof Steps)[number];

export function FnaConfigWorkflow({
  onClose,
  open,
  onSave,
  initialConfig,
}: FnaConfigWorkflowProps) {
  const [currentConfig, setCurrentConfig] = useState<
    Partial<FnaRunConfigurationDto>
  >(initialConfig ?? { sampleSource: SampleSource.EXT_SKIN_SUBCUT });
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const currentStep: Step = Steps[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex >= Steps.length - 1;

  const handleNext = useCallback(() => {
    if (isLastStep) {
      onSave(currentConfig as FnaRunConfigurationDto);
    } else {
      setCurrentStepIndex((i) => i + 1);
    }
  }, [currentConfig, isLastStep, onSave]);
  const handleBack = useCallback(() => {
    if (!isFirstStep) {
      setCurrentStepIndex((i) => i - 1);
    }
  }, [isFirstStep]);
  const handleUpdateConfig = useCallback(
    (cfg: Partial<FnaRunConfigurationDto>) => setCurrentConfig(cfg),
    []
  );

  const { t } = useTranslation();

  const bodyContent = useMemo(() => {
    switch (currentStep) {
      case "SAMPLE_LOCATION":
        return (
          <SampleLocation
            onChange={handleUpdateConfig}
            currentConfig={currentConfig}
          />
        );
      case "LESION_APPEARANCE":
        return (
          <LesionAppearance
            onChange={handleUpdateConfig}
            currentConfig={currentConfig}
          />
        );
      case "CLINICAL_HISTORY_1":
        return (
          <ClinicalHistory1
            onChange={handleUpdateConfig}
            currentConfig={currentConfig}
          />
        );
      case "CLINICAL_HISTORY_2":
        return (
          <ClinicalHistory2
            onChange={handleUpdateConfig}
            currentConfig={currentConfig}
          />
        );
      case "CLINICAL_HISTORY_3":
        return (
          <ClinicalHistory3
            onChange={handleUpdateConfig}
            currentConfig={currentConfig}
          />
        );
      case "CLINICAL_HISTORY_4":
        return (
          <ClinicalHistory4
            onChange={handleUpdateConfig}
            currentConfig={currentConfig}
          />
        );
      default:
        return <></>;
    }
  }, [currentConfig, currentStep, handleUpdateConfig]);

  const footerContent = useMemo(() => {
    switch (currentStep) {
      case "SAMPLE_LOCATION":
        return (
          <SampleLocationFooter
            onCancel={onClose}
            onNext={handleNext}
            canContinue={hasValidSampleLocation(currentConfig)}
          />
        );
      case "LESION_APPEARANCE":
        return (
          <LesionAppearanceFooter
            onBack={handleBack}
            onSave={() => onSave(currentConfig as FnaRunConfigurationDto)}
            canContinue={hasValidLesionAppearance(currentConfig)}
            onOptional={handleNext}
          />
        );
      case "CLINICAL_HISTORY_1":
      case "CLINICAL_HISTORY_2":
      case "CLINICAL_HISTORY_3":
      case "CLINICAL_HISTORY_4":
        return (
          <WizardFooter
            totalSteps={4}
            currentStepIndex={currentStepIndex - 2}
            onNext={handleNext}
            onBack={handleBack}
            nextButtonProps={isLastStep ? { rightIcon: undefined } : undefined}
            nextButtonContent={
              isLastStep ? t("general.buttons.save") : undefined
            }
          />
        );
      default:
        return <></>;
    }
  }, [
    currentConfig,
    currentStep,
    currentStepIndex,
    handleBack,
    handleNext,
    isLastStep,
    onClose,
    onSave,
    t,
  ]);

  const headerText = useMemo(() => {
    switch (currentStep) {
      case "SAMPLE_LOCATION":
        return t(
          "orderFulfillment.runConfig.inVueDx.fna.titles.sampleLocation"
        );
      case "LESION_APPEARANCE":
        return t(
          "orderFulfillment.runConfig.inVueDx.fna.titles.lesionAppearance"
        );
      default:
        return t(
          "orderFulfillment.runConfig.inVueDx.fna.titles.clinicalHistory"
        );
    }
  }, [currentStep, t]);

  const subHeaderText = useMemo(() => {
    switch (currentStep) {
      case "SAMPLE_LOCATION":
      case "LESION_APPEARANCE":
        return t("orderFulfillment.runConfig.inVueDx.fna.titles.required");
      default:
        return t("orderFulfillment.runConfig.inVueDx.fna.titles.optional");
    }
  }, [currentStep, t]);

  return (
    <ScrollableModalWrapper>
      <BasicModal
        open={open}
        dismissable
        ignoreBackdropDismissal
        headerContent={
          <>
            <SpotText level="h4" className="spot-modal__secondary-title">
              {subHeaderText}
            </SpotText>
            <SpotText level="h3" className="spot-modal__title">
              {headerText}
            </SpotText>
          </>
        }
        onClose={onClose}
        bodyContent={<Root>{bodyContent}</Root>}
        footerContent={footerContent}
      />
    </ScrollableModalWrapper>
  );
}

interface SampleLocationFooterProps {
  onCancel: () => void;
  onNext: () => void;
  canContinue: boolean;
}

function SampleLocationFooter(props: SampleLocationFooterProps) {
  const { t } = useTranslation();
  return (
    <>
      <Modal.FooterCancelButton onClick={props.onCancel}>
        {t("general.buttons.cancel")}
      </Modal.FooterCancelButton>

      <Button
        onClick={props.onNext}
        disabled={!props.canContinue}
        data-testid={TestId.NextButton}
      >
        {t("general.buttons.next")}
      </Button>
    </>
  );
}

interface LesionAppearanceFooterProps {
  onBack: () => void;
  onSave: () => void;
  onOptional: () => void;
  canContinue: boolean;
}

function LesionAppearanceFooter(props: LesionAppearanceFooterProps) {
  const { t } = useTranslation();
  return (
    <>
      <Modal.FooterCancelButton onClick={props.onBack}>
        {t("general.buttons.back")}
      </Modal.FooterCancelButton>
      <Button
        data-testid={TestId.SaveEarlyButton}
        onClick={props.onSave}
        buttonType="secondary"
        disabled={!props.canContinue}
      >
        {t("orderFulfillment.runConfig.inVueDx.fna.buttons.finish")}
      </Button>
      <Button onClick={props.onOptional} disabled={!props.canContinue}>
        {t("orderFulfillment.runConfig.inVueDx.fna.buttons.optional")}
      </Button>
    </>
  );
}
