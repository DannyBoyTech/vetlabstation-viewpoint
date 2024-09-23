import { BasicModal } from "../../../../components/basic-modal/BasicModal";
import React, { useCallback, useMemo, useState } from "react";
import {
  TestId as WizardTestId,
  WizardFooter,
  WizardHeader,
  WizardModalWrapper,
  WizardStepDetails,
} from "../../../../components/wizard/wizard-components";
import { Trans, useTranslation } from "react-i18next";
import styled from "styled-components";
import PdxInstrumentImage from "../../../../assets/instruments/display/300x300/Crimson.png";
import TubeAdapterImage from "../../../../assets/instruments/maintenance/proCyteDx/shutdown/tube_adapter.png";
import KitTubingImage from "../../../../assets/instruments/maintenance/proCyteDx/shutdown/reagent_kit_tubing.png";
import StainProbesImage from "../../../../assets/instruments/maintenance/proCyteDx/shutdown/stain_probes.png";
import { CommonTransComponents } from "../../../../utils/i18n-utils";
import { SpotText } from "@viewpoint/spot-react/src";

const PdxShutDownForShippingStep = {
  Notes: "Notes",
  TubeAdapter: "TubeAdapter",
  KitTubing: "KitTubing",
  StainProbes: "StainProbes",
  DrainReagents: "DrainReagents",
} as const;

const StepOrder = Object.values(PdxShutDownForShippingStep);

export interface ProCyteDxShutDownForShippingWizardProps {
  onCancel: () => void;
  onDone: () => void;
}

export function ProCyteDxShutDownForShippingWizard(
  props: ProCyteDxShutDownForShippingWizardProps
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

  const handleCancel = useCallback(() => {
    setOpen(false);
    props.onCancel();
  }, [props.onCancel]);

  const { bodyContent, footerProps }: WizardStepDetails = useMemo(() => {
    switch (currentStep) {
      case PdxShutDownForShippingStep.Notes:
        return {
          bodyContent: (
            <ShutDownStep
              imgSrc={PdxInstrumentImage}
              i18nKey="instrumentScreens.proCyteDx.shutDownForShippingWizard.Notes.instructions"
            />
          ),
          footerProps: {
            backButtonContent: t("general.buttons.cancel"),
            backButtonProps: {
              buttonType: "link",
              leftIcon: undefined,
            },
          },
        };
      case PdxShutDownForShippingStep.TubeAdapter:
        return {
          bodyContent: (
            <ShutDownStep
              imgSrc={TubeAdapterImage}
              i18nKey="instrumentScreens.proCyteDx.shutDownForShippingWizard.TubeAdapter.instructions"
            />
          ),
        };
      case PdxShutDownForShippingStep.KitTubing:
        return {
          bodyContent: (
            <ShutDownStep
              imgSrc={KitTubingImage}
              i18nKey="instrumentScreens.proCyteDx.shutDownForShippingWizard.KitTubing.instructions"
            />
          ),
        };
      case PdxShutDownForShippingStep.StainProbes:
        return {
          bodyContent: (
            <ShutDownStep
              imgSrc={StainProbesImage}
              i18nKey="instrumentScreens.proCyteDx.shutDownForShippingWizard.StainProbes.instructions"
            />
          ),
        };
      case PdxShutDownForShippingStep.DrainReagents:
        return {
          bodyContent: (
            <ShutDownStep i18nKey="instrumentScreens.proCyteDx.shutDownForShippingWizard.DrainReagents.instructions" />
          ),
          footerProps: {
            nextButtonContent: t(
              "instrumentScreens.proCyteDx.shutDownForShippingWizard.DrainReagents.button"
            ),
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
        dismissable={true} // allow exit via 'X'
        ignoreBackdropDismissal={true} // disallow exit via 'tap outside' interaction
        onClose={handleCancel}
        headerContent={
          <WizardHeader
            title={t(
              "instrumentScreens.proCyteDx.shutDownForShippingWizard.header"
            )}
            subTitle={t(
              `instrumentScreens.proCyteDx.shutDownForShippingWizard.${currentStep}.header`
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
  flex-direction: column;
  flex: 1;
  gap: 10px;

  ol {
    margin: unset;
  }

  li {
    margin-bottom: 20px;
  }
`;

const Columns = styled.div`
  display: flex;
  height: 100%;
  gap: 50px;
`;
const ImageColumn = styled.div`
  display: flex;
  flex: 1;
  padding: 30px 0px 30px 30px;
`;
const TextColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 30px 30px 30px 0px;
  flex: 2;
`;

const Image = styled.img`
  align-self: flex-start;
  max-width: 100%;
`;

interface ShutDownStepProps {
  imgSrc?: string;
  i18nKey: string;
}

function ShutDownStep(props: ShutDownStepProps) {
  return (
    <ContentRoot>
      <Columns>
        {props.imgSrc !== undefined && (
          <ImageColumn>
            <Image src={props.imgSrc} key={props.imgSrc} />
          </ImageColumn>
        )}
        <TextColumn>
          <SpotText level="paragraph">
            <Trans
              i18nKey={props.i18nKey as any}
              components={CommonTransComponents}
            />
          </SpotText>
        </TextColumn>
      </Columns>
    </ContentRoot>
  );
}
