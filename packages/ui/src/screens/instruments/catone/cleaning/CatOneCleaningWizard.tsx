import { InstrumentStatusDto } from "@viewpoint/api";
import {
  WizardFooter,
  WizardHeader,
  WizardModalWrapper,
  WizardStepDetails,
} from "../../../../components/wizard/wizard-components";
import { ReactNode, useCallback, useContext, useMemo, useState } from "react";
import { BasicModal } from "../../../../components/basic-modal/BasicModal";
import { Trans, useTranslation } from "react-i18next";
import { Button, SpotText } from "@viewpoint/spot-react";
import styled from "styled-components";
import { CommonTransComponents } from "../../../../utils/i18n-utils";
import { ViewpointThemeContext } from "../../../../context/ThemeContext";
import { SpotIcon } from "@viewpoint/spot-icons";
import { LimitedLoopedVideo } from "../../../../components/video/LimitedLoopedVideo";

import PrepareAnalyzer from "../../../../assets/instruments/maintenance/catOne/cleaning/CatOne_Clean_Prepare.webm";
import CleanAnalyzer from "../../../../assets/instruments/maintenance/catOne/cleaning/CatOne_Clean_Clean.webm";
import CompleteCleaning from "../../../../assets/instruments/maintenance/catOne/cleaning/CatOne_Clean_Complete.webm";

export const CatOneCleaningStep = {
  Landing: "Landing",
  Prepare: "Prepare",
  Clean: "Clean",
  Complete: "Complete",
} as const;

const Steps = Object.values(CatOneCleaningStep);

export interface CatOneCleaningWizardProps {
  instrumentStatus: InstrumentStatusDto;
  onCancel: () => void;
  onDone: () => void;
}

export function CatOneCleaningWizard({
  onCancel,
  onDone,
}: CatOneCleaningWizardProps) {
  const [open, setOpen] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { t } = useTranslation();
  const currentStep = Steps[currentIndex];

  const handleNext = () => {
    if (currentIndex + 1 >= Steps.length) {
      onDone();
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleCancel = useCallback(() => {
    setOpen(false);
    onCancel();
  }, [onCancel]);

  const handleBack = useCallback(() => {
    if (currentIndex === 0) {
      handleCancel();
    } else {
      setCurrentIndex((ci) => ci - 1);
    }
  }, [currentIndex, handleCancel]);

  const { bodyContent, footerProps }: WizardStepDetails = useMemo(() => {
    switch (currentStep) {
      case CatOneCleaningStep.Landing:
        return {
          bodyContent: <LandingContent />,
          footerProps: {
            backButton: (
              <Button buttonType="link" onClick={handleBack}>
                {t("general.buttons.cancel")}
              </Button>
            ),
          },
        };
      case CatOneCleaningStep.Prepare:
        return {
          bodyContent: (
            <ImageAndTextContent
              videoSrc={PrepareAnalyzer}
              textContent={
                <Trans
                  i18nKey="instrumentScreens.catOne.cleaningWizard.Prepare.steps"
                  components={{
                    ...CommonTransComponents,
                    ...ListItemComponents,
                  }}
                />
              }
            />
          ),
        };
      case CatOneCleaningStep.Clean:
        return {
          bodyContent: (
            <ImageAndTextContent
              videoSrc={CleanAnalyzer}
              textContent={
                <Trans
                  i18nKey="instrumentScreens.catOne.cleaningWizard.Clean.steps"
                  components={{
                    ...CommonTransComponents,
                    ...ListItemComponents,
                  }}
                />
              }
            />
          ),
        };
      case CatOneCleaningStep.Complete:
        return {
          bodyContent: (
            <ImageAndTextContent
              videoSrc={CompleteCleaning}
              textContent={
                <Trans
                  i18nKey="instrumentScreens.catOne.cleaningWizard.Complete.steps"
                  components={{
                    ...CommonTransComponents,
                    ...ListItemComponents,
                  }}
                />
              }
            />
          ),
          footerProps: {
            nextButtonContent: t("general.buttons.done"),
          },
        };
    }
  }, [currentStep, handleBack, t]);

  return (
    <WizardModalWrapper>
      <BasicModal
        data-testid={TestId.CleaningWizard}
        dismissable
        ignoreBackdropDismissal
        open={open}
        onClose={handleCancel}
        bodyContent={bodyContent}
        headerContent={
          <WizardHeader
            title={t("instrumentScreens.catOne.cleaningWizard.headers.primary")}
            subTitle={t(
              `instrumentScreens.catOne.cleaningWizard.headers.${currentStep}`
            )}
          />
        }
        footerContent={
          <WizardFooter
            totalSteps={Steps.length}
            currentStepIndex={currentIndex}
            onNext={handleNext}
            onBack={handleBack}
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

  ul {
    margin: unset;
  }

  li {
    margin-bottom: 20px;
  }
`;

const Columns = styled.div`
  display: flex;
  height: 100%;
  padding: 30px;
  gap: 50px;
`;
const ImageColumn = styled.div`
  flex: 1;
  display: flex;
`;
const TextColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 2;
`;

const ListItemComponents = {
  ul: <ul />,
  li: <li />,
};

const TestId = {
  CleaningWizard: "cleaning-wizard",
  IdexxRecommendations: "idexx-recommendations",
  Content: "wizard-content",
} as const;

function LandingContent() {
  const { theme } = useContext(ViewpointThemeContext);
  return (
    <ContentRoot>
      <Columns data-testid={TestId.IdexxRecommendations}>
        <ImageColumn>
          <SpotIcon
            name={"clipboard"}
            size={175}
            color={theme.colors?.feedback?.success}
          />
        </ImageColumn>
        <TextColumn>
          <SpotText level="paragraph" bold>
            <Trans
              i18nKey={
                "instrumentScreens.catOne.cleaningWizard.Landing.recommends"
              }
              components={{ ...CommonTransComponents, ...ListItemComponents }}
            />
          </SpotText>

          <Trans
            i18nKey={"instrumentScreens.catOne.cleaningWizard.Landing.list"}
            components={{ ...CommonTransComponents, ...ListItemComponents }}
          />

          <Trans
            i18nKey={"instrumentScreens.catOne.cleaningWizard.Landing.moreInfo"}
            components={{ ...CommonTransComponents, ...ListItemComponents }}
          />
        </TextColumn>
      </Columns>
    </ContentRoot>
  );
}

interface ImageAndTextContentProps {
  videoSrc: string;
  textContent: ReactNode;
}

function ImageAndTextContent(props: ImageAndTextContentProps) {
  return (
    <ContentRoot>
      <Columns data-testid={TestId.Content}>
        <ImageColumn>
          <LimitedLoopedVideo
            autoPlay
            key={props.videoSrc}
            src={props.videoSrc}
            loopTimes={3}
          />
        </ImageColumn>
        <TextColumn>{props.textContent}</TextColumn>
      </Columns>
    </ContentRoot>
  );
}
