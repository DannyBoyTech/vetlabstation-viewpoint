import { useTranslation } from "react-i18next";
import { BasicModal } from "../../../../components/basic-modal/BasicModal";
import {
  WizardFooter,
  WizardHeader,
  WizardModalWrapper,
  WizardStepDetails,
} from "../../../../components/wizard/wizard-components";
import { useCallback, useMemo, useState } from "react";
import { Preparation } from "./Preparation";
import { SelectLot } from "./SelectLot";
import { LoadMaterials } from "./LoadMaterials";
import { Button } from "@viewpoint/spot-react";
import styled from "styled-components";
import { ButtonProps } from "@viewpoint/spot-react/src/components/button/Button";
import { TestId as WizardTestId } from "../../../../components/wizard/wizard-components";
import {
  InstrumentStatus,
  InstrumentStatusDto,
  OffsetsDto,
} from "@viewpoint/api";
import {
  useCancelOffsetsMutation,
  useCompleteOffsetsMutation,
  useRequestOffsetsMutation,
} from "../../../../api/CatOneApi";
import { ConfirmModal } from "../../../../components/confirm-modal/ConfirmModal";

const OffsetsSteps = {
  Preparation: "preparation",
  SelectLot: "selectLot",
  LoadMaterials: "loadMaterials",
} as const;

const StepSeq = Object.values(OffsetsSteps);

const CenteredButtonContainer = styled.div`
  display: flex;
  justify-content: center;

  button.spot-button {
    margin: 0;
  }
`;

function CenteredButton(props: ButtonProps) {
  return (
    <CenteredButtonContainer>
      <Button data-testid={WizardTestId.NextButton} {...props} />
    </CenteredButtonContainer>
  );
}

interface CatOneOffsetsWizardProps {
  instrumentStatus: InstrumentStatusDto;
  onCancel: () => void;
  onDone: () => void;
}

export function CatOneOffsetsWizard({
  instrumentStatus,
  onDone,
  onCancel,
}: CatOneOffsetsWizardProps) {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentStep = StepSeq[currentIndex];
  const [selectedLot, setSelectedLot] = useState<OffsetsDto>();

  const instrumentBusy =
    instrumentStatus.instrumentStatus !== InstrumentStatus.Ready;
  const instrumentId = instrumentStatus.instrument.id;

  const [requestOffsets] = useRequestOffsetsMutation();
  const [cancelOffsets] = useCancelOffsetsMutation();
  const [completeOffsets] = useCompleteOffsetsMutation();

  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);

  const handleNext = useCallback(() => {
    if (currentIndex + 1 >= StepSeq.length) {
      onDone();
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  }, [onDone, currentIndex, setCurrentIndex]);

  const handleCancel = useCallback(() => {
    setConfirmCancelOpen(true);
  }, []);

  const handleConfirmCancel = () => {
    cancelOffsets(instrumentId);
    onCancel();
  };

  const handleBack = useCallback(() => {
    if (currentIndex === 0) {
      handleCancel();
    } else {
      setCurrentIndex((ci) => ci - 1);
    }
  }, [currentIndex, handleCancel]);

  const handleLotSelection = useCallback(
    (selection?: OffsetsDto) => setSelectedLot(selection),
    []
  );

  const handleSelectLotNext = useCallback(async () => {
    if (selectedLot != null) {
      await requestOffsets({ instrumentId, offsetsDto: selectedLot }).unwrap();
      handleNext();
    }
  }, [instrumentId, selectedLot, requestOffsets, handleNext]);

  const handleLoadMaterialsBack = useCallback(async () => {
    await cancelOffsets(instrumentId).unwrap();
    handleBack();
  }, [cancelOffsets, instrumentId, handleBack]);

  const handleLoadMaterialsNext = useCallback(async () => {
    await completeOffsets(instrumentId).unwrap();
    handleNext();
  }, [completeOffsets, instrumentId, handleNext]);

  const { bodyContent, footerProps }: WizardStepDetails = useMemo(() => {
    switch (currentStep) {
      case OffsetsSteps.Preparation:
        return {
          bodyContent: <Preparation instrumentStatus={instrumentStatus} />,
        };

      case OffsetsSteps.SelectLot:
        return {
          bodyContent: (
            <SelectLot
              instrumentId={instrumentId}
              onSelection={handleLotSelection}
            />
          ),
          footerProps: {
            nextButtonProps: {
              disabled: instrumentBusy || selectedLot == null,
              rightIcon: instrumentBusy ? "spinner" : "next",
              spinIcon: instrumentBusy,
              onClick: handleSelectLotNext,
            },
          },
        };

      case OffsetsSteps.LoadMaterials:
        return {
          bodyContent: <LoadMaterials instrumentId={instrumentId} />,
          footerProps: {
            backButtonProps: {
              onClick: handleLoadMaterialsBack,
            },
            nextButton: (
              <CenteredButton onClick={handleLoadMaterialsNext}>
                {t("general.buttons.ok")}
              </CenteredButton>
            ),
          },
        };
    }
  }, [
    t,
    instrumentStatus,
    instrumentId,
    instrumentBusy,
    selectedLot,
    currentStep,
    handleLotSelection,
    handleSelectLotNext,
    handleLoadMaterialsBack,
    handleLoadMaterialsNext,
  ]);

  return (
    <>
      <WizardModalWrapper>
        <BasicModal
          open={true}
          onClose={handleCancel}
          dismissable
          headerContent={
            <WizardHeader
              title={t("instrumentScreens.catOne.offsetsWizard.title")}
              subTitle={t(
                `instrumentScreens.catOne.offsetsWizard.${currentStep}.title` as any
              )}
            />
          }
          bodyContent={bodyContent}
          footerContent={
            <WizardFooter
              {...footerProps}
              totalSteps={StepSeq.length}
              currentStepIndex={currentIndex}
              onNext={handleNext}
              onBack={handleBack}
            />
          }
        />
      </WizardModalWrapper>
      {confirmCancelOpen && (
        <ConfirmModal
          open={true}
          headerContent={t(
            "instrumentScreens.catOne.offsetsWizard.confirmCancel.title"
          )}
          bodyContent={t(
            "instrumentScreens.catOne.offsetsWizard.confirmCancel.content"
          )}
          confirmButtonContent={t("general.buttons.yes")}
          cancelButtonContent={t("general.buttons.no")}
          onClose={() => setConfirmCancelOpen(false)}
          onConfirm={handleConfirmCancel}
        />
      )}
    </>
  );
}
