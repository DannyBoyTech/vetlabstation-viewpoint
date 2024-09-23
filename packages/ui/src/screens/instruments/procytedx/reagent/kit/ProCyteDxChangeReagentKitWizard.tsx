import { BasicModal } from "../../../../../components/basic-modal/BasicModal";
import React, { useMemo, useState } from "react";
import {
  TestId as WizardTestId,
  WizardFooter,
  WizardHeader,
  WizardModalWrapper,
  WizardStepDetails,
} from "../../../../../components/wizard/wizard-components";
import { useTranslation } from "react-i18next";
import { OpenKit } from "./content/OpenKit";
import { PrepKit } from "./content/PrepKit";
import { InstallKit } from "./content/InstallKit";
import { DisposeKit } from "./content/DisposeKit";

export const PdxChangeReagentKitStep = {
  Open: "Open",
  Prep: "Prep",
  Install: "Install",
  Dispose: "Dispose",
} as const; // declare as read-only array with fixed size

const StepOrder = Object.values(PdxChangeReagentKitStep);

// properties (props) of this component
export interface ProCyteDxChangeReagentKitWizardProps {
  onCancel: () => void;
  onDone: () => void;
}

export function ProCyteDxChangeReagentKitWizard(
  props: ProCyteDxChangeReagentKitWizardProps
) {
  // react hook for translation lookup
  const { t } = useTranslation();
  // react hooks to track opened state of the wizard and the current step index
  const [open, setOpen] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0); // start at first step

  const currentStep = StepOrder[currentIndex];

  const onNext = () => {
    if (currentIndex + 1 >= StepOrder.length) {
      onDone();
    }
    setCurrentIndex((ci) => ci + 1);
  };

  const onBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex((ci) => ci - 1);
    } else {
      props.onCancel();
    }
  };

  const onDone = () => {
    props.onDone();
  };

  const { bodyContent, footerProps }: WizardStepDetails = useMemo(() => {
    switch (currentStep) {
      case PdxChangeReagentKitStep.Open:
        return {
          bodyContent: <OpenKit />,
          footerProps: {
            backButtonContent: t("general.buttons.cancel"),
            backButtonProps: {
              buttonType: "link",
              leftIcon: undefined,
            },
          },
        };
      case PdxChangeReagentKitStep.Prep:
        return {
          bodyContent: <PrepKit />,
        };
      case PdxChangeReagentKitStep.Install:
        return {
          bodyContent: <InstallKit />,
        };
      case PdxChangeReagentKitStep.Dispose:
        return {
          bodyContent: <DisposeKit />,
          footerProps: {
            nextButtonContent: t("general.buttons.done"),
            nextButtonProps: { rightIcon: undefined },
          },
        };
    }
  }, [currentStep, t]);

  // return the JSX content of this component
  return (
    <WizardModalWrapper>
      <BasicModal
        data-testid={WizardTestId.Modal}
        open={open}
        dismissable={true}
        ignoreBackdropDismissal={true}
        onClose={() => setOpen(false)}
        headerContent={
          <WizardHeader
            title={t(
              "instrumentScreens.proCyteDx.changeReagentWizard.kit.header"
            )}
            subTitle={t(
              `instrumentScreens.proCyteDx.changeReagentWizard.kit.${currentStep}.header`
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
            {...footerProps} // spread of remaining props
          />
        }
      />
    </WizardModalWrapper>
  );
}
