import styled from "styled-components";
import { Theme } from "../../utils/StyleConstants";
import { ReactNode, useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Button, SpotText } from "@viewpoint/spot-react";
import { ButtonProps } from "@viewpoint/spot-react/src/components/button/Button";
import { ResponsiveModalWrapper } from "../modal/ResponsiveModalWrapper";

export interface WizardFooterProps {
  totalSteps: number;
  currentStepIndex: number;

  nextButtonProps?: Partial<ButtonProps>;
  backButtonProps?: Partial<ButtonProps>;

  nextButtonContent?: ReactNode;
  backButtonContent?: ReactNode;

  nextButton?: ReactNode;
  backButton?: ReactNode;

  onNext: () => void;
  onBack: () => void;
}

const WizardFooterContainer = styled.div`
  display: grid;
  grid-template-columns: 2fr 5fr 2fr;
  width: 100%;
`;

const ButtonWrapper = styled.div`
  display: flex;
`;

const SingleLineButton = styled(Button)`
  > .spot-button__text {
    white-space: nowrap;
  }
`;

const NextButton = styled(SingleLineButton)`
  && {
    margin-left: auto;
  }
`;

export function WizardFooter(props: WizardFooterProps) {
  const { t } = useTranslation();
  return (
    <WizardFooterContainer>
      {props.backButton ?? (
        <ButtonWrapper>
          <SingleLineButton
            leftIcon={"previous"}
            onClick={props.onBack}
            data-testid={TestId.BackButton}
            {...props.backButtonProps}
          >
            {props.backButtonContent ?? t("general.buttons.back")}
          </SingleLineButton>
        </ButtonWrapper>
      )}
      <WizardStepCounter
        totalSteps={props.totalSteps}
        currentStepIndex={props.currentStepIndex}
      />
      {props.nextButton ?? (
        <ButtonWrapper>
          <NextButton
            rightIcon="next"
            onClick={props.onNext}
            data-testid={TestId.NextButton}
            {...props.nextButtonProps}
          >
            {props.nextButtonContent ?? t("general.buttons.next")}
          </NextButton>
        </ButtonWrapper>
      )}
    </WizardFooterContainer>
  );
}

const StepsContainer = styled.div`
  display: flex;
  flex: 1;
  gap: 10px;

  overflow-x: hidden;

  ::-webkit-scrollbar {
    display: none;
  }
`;

const Step = styled.div<{ first?: boolean; last?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  width: 35px;
  height: 35px;
  min-width: 35px;
  min-height: 35px;

  ${(p) => (p.first ? "margin-left: auto;" : "")}
  ${(p) => (p.last ? "margin-right: auto;" : "")}
  &:not(.active) {
    background-color: ${(p: { theme: Theme }) =>
      p.theme.colors?.background?.disabled};
    border: ${(p: { theme: Theme }) => p.theme.borders?.heavyPrimary};
    border-width: 3px;

    .spot-typography__text--body {
      color: ${(p: { theme: Theme }) => p.theme.colors?.text?.disabled};
    }
  }

  &.active {
    border: ${(p: { theme: Theme }) => p.theme.borders?.controlFocus};
    border-width: 3px;
    background-color: ${(p: { theme: Theme }) =>
      p.theme.colors?.background?.primary};
  }
`;

interface WizardStepCounterProps {
  totalSteps: number;
  currentStepIndex: number;
}

export function WizardStepCounter(props: WizardStepCounterProps) {
  const stepRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const steps = useMemo(
    () =>
      new Array(props.totalSteps).fill(0).map((_v, index) => (
        <Step
          key={index}
          ref={(r) => (stepRefs.current[index] = r)}
          className={props.currentStepIndex === index ? "active" : ""}
          first={index === 0}
          last={index === props.totalSteps - 1}
        >
          <SpotText bold level={"paragraph"}>
            {index + 1}
          </SpotText>
        </Step>
      )),
    [props.currentStepIndex, props.totalSteps]
  );

  useEffect(() => {
    stepRefs.current[props.currentStepIndex]?.scrollIntoView();
  }, [props.currentStepIndex]);
  return <StepsContainer>{steps}</StepsContainer>;
}

export const TestId = {
  PrimaryTitle: "wizard-header-primary-title",
  SecondaryTitle: "wizard-header-secondary-title",
  BackButton: "wizard-back-button",
  NextButton: "wizard-next-button",
  Modal: "wizard-modal",
};

interface WizardHeaderProps {
  title: ReactNode;
  subTitle: ReactNode;
}

export function WizardHeader(props: WizardHeaderProps) {
  return (
    <>
      <SpotText
        level="h4"
        className="spot-modal__secondary-title"
        data-testid={TestId.SecondaryTitle}
      >
        {props.title}
      </SpotText>
      <SpotText
        level="h3"
        className="spot-modal__title"
        data-testid={TestId.PrimaryTitle}
      >
        {props.subTitle}
      </SpotText>
    </>
  );
}

export const WizardModalWrapper = styled(ResponsiveModalWrapper)`
  .spot-modal {
    width: 900px;
    max-width: 900px;
  }

  .spot-modal__content {
    height: 450px;
    max-height: 450px;
    min-height: 450px;
  }
`;

export interface WizardStepDetails {
  bodyContent: ReactNode;
  footerProps?: Partial<WizardFooterProps>;
}
