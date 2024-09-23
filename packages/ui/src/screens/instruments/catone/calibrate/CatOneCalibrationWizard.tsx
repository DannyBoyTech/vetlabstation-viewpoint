import { ReactNode, useCallback, useMemo, useState } from "react";
import {
  EventIds,
  HealthCode,
  InstrumentMaintenanceResultDto,
  InstrumentStatusDto,
  InstrumentType,
  MaintenanceProcedure,
  MaintenanceResult,
} from "@viewpoint/api";
import {
  WizardFooter,
  WizardFooterProps,
  WizardHeader,
  WizardModalWrapper,
} from "../../../../components/wizard/wizard-components";
import { BasicModal } from "../../../../components/basic-modal/BasicModal";
import { Trans, useTranslation } from "react-i18next";
import { useGetDetailedInstrumentStatusQuery } from "../../../../api/InstrumentApi";
import styled from "styled-components";
import { getInstrumentDisplayImage } from "../../../../utils/instrument-utils";
import { SpotText } from "@viewpoint/spot-react";
import LoadMaterialsImage from "../../../../assets/instruments/maintenance/catOne/calibrate/CatOne_Calibrate_LoadMaterials.png";
import { CommonTransComponents } from "../../../../utils/i18n-utils";
import { useRequestOpticsCalibrationMutation } from "../../../../api/CatOneApi";
import { useEventListener } from "../../../../context/EventSourceContext";
import { CatOneCleaningButton } from "../cleaning/CatOneCleaningButton";

export const TestId = {
  CalibrationWizard: "calibration-wizard",
} as const;

const CalibrationStep = {
  Clean: "Clean",
  LoadMaterials: "LoadMaterials",
} as const;

const StepOrder = [CalibrationStep.Clean, CalibrationStep.LoadMaterials];

interface CatOneCalibrationWizardProps {
  instrumentStatus: InstrumentStatusDto;
  onCancel: () => void;
  onDone: () => void;
}

export function CatOneCalibrationWizard({
  instrumentStatus,
  onDone,
  onCancel,
}: CatOneCalibrationWizardProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const currentStep = StepOrder[currentStepIndex];

  const { data: detailedStatus, isLoading: detailedStatusLoading } =
    useGetDetailedInstrumentStatusQuery(instrumentStatus.instrument.id);

  const { t } = useTranslation();
  const isReady = detailedStatus?.status === HealthCode.READY;

  const [requestCalibration] = useRequestOpticsCalibrationMutation();

  const handleCancel = () => {
    onCancel();
  };

  const handleNext = () => {
    if (currentStepIndex + 1 >= StepOrder.length) {
      onDone();
    }
    if (currentStep === CalibrationStep.Clean) {
      // Kick off the calibration process
      requestCalibration(instrumentStatus.instrument.id);
    }
    setCurrentStepIndex(currentStepIndex + 1);
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    } else {
      onCancel();
    }
  };

  const maintenanceCompleteCallback = useCallback(
    (msg: MessageEvent) => {
      const payload: InstrumentMaintenanceResultDto = JSON.parse(msg.data);
      if (
        payload.maintenanceType === MaintenanceProcedure.OPTICS_CALIBRATION &&
        payload.result === MaintenanceResult.SUCCESS
      ) {
        onCancel();
      }
    },
    [onCancel]
  );

  useEventListener(
    EventIds.InstrumentMaintenanceResult,
    maintenanceCompleteCallback
  );

  const { bodyContent, footerProps } = useMemo<{
    bodyContent?: ReactNode;
    footerProps?: Partial<WizardFooterProps>;
  }>(() => {
    switch (currentStep) {
      case CalibrationStep.Clean:
        return {
          bodyContent: (
            <CleanStep
              instrumentStatus={instrumentStatus}
              waitingForReady={!detailedStatusLoading && !isReady}
            />
          ),
          footerProps: {},
        };
      case CalibrationStep.LoadMaterials:
        return {
          bodyContent: <LoadMaterialsStep />,
          footerProps: {
            nextButtonContent: t("general.buttons.done"),
            nextButtonProps: {
              rightIcon: undefined,
            },
          },
        };
    }
    return {};
  }, [currentStep, detailedStatusLoading, isReady, instrumentStatus, t]);

  return (
    <>
      <WizardModalWrapper>
        <BasicModal
          data-testid={TestId.CalibrationWizard}
          dismissable
          ignoreBackdropDismissal
          open={true}
          onClose={handleCancel}
          bodyContent={bodyContent}
          headerContent={
            <WizardHeader
              title={t(
                "instrumentScreens.catOne.calibrateWizard.headers.primary"
              )}
              subTitle={t(
                `instrumentScreens.catOne.calibrateWizard.headers.${currentStep}`
              )}
            />
          }
          footerContent={
            <WizardFooter
              totalSteps={StepOrder.length}
              currentStepIndex={currentStepIndex}
              onNext={handleNext}
              onBack={handleBack}
              nextButtonProps={{
                disabled: !isReady,
              }}
              {...footerProps}
            />
          }
        />
      </WizardModalWrapper>
    </>
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
  gap: 40px;

  img {
    max-width: 100%;
    object-fit: contain;
  }

  ul {
    margin: unset;
  }

  li {
    margin-bottom: 20px;
  }
`;

interface CleanStepProps {
  instrumentStatus: InstrumentStatusDto;
  waitingForReady: boolean;
}

function CleanStep(props: CleanStepProps) {
  const { t } = useTranslation();
  return (
    <ContentRoot>
      <Column>
        <img
          alt={InstrumentType.CatalystOne}
          src={getInstrumentDisplayImage(InstrumentType.CatalystOne)}
        />
      </Column>
      <Column>
        <SpotText level="paragraph">
          {t("instrumentScreens.catOne.calibrateWizard.Clean.instructions")}
        </SpotText>
        <div>
          <CatOneCleaningButton
            instrumentStatus={props.instrumentStatus}
            buttonType="secondary"
            buttonSize="large"
          >
            {t("instrumentScreens.catOne.calibrateWizard.Clean.viewButton")}
          </CatOneCleaningButton>
        </div>
        {props.waitingForReady && (
          <SpotText level="paragraph" bold>
            {t("instrumentScreens.catOne.calibrateWizard.Clean.pleaseWait")}
          </SpotText>
        )}
      </Column>
    </ContentRoot>
  );
}

function LoadMaterialsStep() {
  return (
    <ContentRoot>
      <Column>
        <img alt={InstrumentType.CatalystOne} src={LoadMaterialsImage} />
      </Column>
      <Column>
        <SpotText level="paragraph">
          <Trans
            i18nKey="instrumentScreens.catOne.calibrateWizard.LoadMaterials.list"
            components={CommonTransComponents}
          />
        </SpotText>
      </Column>
    </ContentRoot>
  );
}
