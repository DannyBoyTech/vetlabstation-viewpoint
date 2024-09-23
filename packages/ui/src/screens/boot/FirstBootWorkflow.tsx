import React, { useCallback, useEffect, useRef, useState } from "react";
import { BootRoot } from "./BootWorkflow";
import { SelectLanguageModal } from "./SelectLanguageModal";
import { FirstBootEulaModal } from "./FirstBootEulaModal";
import { TimeZoneSelectionModal } from "./TimeZoneSelectionModal";
import { ConfirmModal } from "../../components/confirm-modal/ConfirmModal";
import { Trans, useTranslation } from "react-i18next";
import { BootItemsDto, SmartServiceStatus } from "@viewpoint/api";
import { ActivateSmartServiceModal } from "./ActivateSmartServiceModal";
import { UsbRestore } from "../instruments/system/restore/UsbRestore";

export const FirstBootStep = {
  Language: "Language",
  Eula: "Eula",
  TimeZone: "TimeZone",
  SmartService: "SmartService",
  DataRestore: "DataRestore",
  Restart: "Restart",
} as const;

type FirstBootStep = (typeof FirstBootStep)[keyof typeof FirstBootStep];

interface FirstBootWorkflowProps {
  onComplete: (restart: boolean) => void;
  bootItems: BootItemsDto;
  smartServiceStatus: SmartServiceStatus;
}

export function FirstBootWorkflow({
  onComplete,
  bootItems,
  smartServiceStatus,
}: FirstBootWorkflowProps) {
  // First boot can consist of just time zone selection (upgrade from pre-TZ build, or if systemconfig DB is wiped)
  const [currentStep, setCurrentStep] = useState<FirstBootStep>(
    bootItems.isFirstBoot ? FirstBootStep.Language : FirstBootStep.TimeZone
  );
  const [restartRequired, setRestartRequired] = useState(false);
  const { t } = useTranslation();

  const restartTimeout = useRef<number>();

  const promptForSmartService =
    smartServiceStatus === SmartServiceStatus.NOT_ACTIVATED ||
    smartServiceStatus === SmartServiceStatus.DISABLED;

  const onNextForLanguage = useCallback(() => {
    setCurrentStep(FirstBootStep.Eula);
  }, []);

  const onNextForEula = useCallback(() => {
    if (bootItems.timeZoneOnBoarding) {
      setCurrentStep(FirstBootStep.TimeZone);
    } else if (promptForSmartService) {
      setCurrentStep(FirstBootStep.SmartService);
    } else {
      setCurrentStep(FirstBootStep.DataRestore);
    }
  }, [bootItems.timeZoneOnBoarding, promptForSmartService]);

  // User has selected a time zone -- mark a pending restart and move to the next step
  const onNextForTimezone = useCallback(() => {
    setRestartRequired(true);
    if (bootItems.isFirstBoot) {
      if (promptForSmartService) {
        setCurrentStep(FirstBootStep.SmartService);
      } else {
        setCurrentStep(FirstBootStep.DataRestore);
      }
    } else {
      onComplete(true);
    }
  }, [bootItems.isFirstBoot, onComplete, promptForSmartService]);

  const onNextForSmartService = useCallback(() => {
    setCurrentStep(FirstBootStep.DataRestore);
  }, []);

  // User has queued a data restore -- mark as pending restart and move to the next step
  const onDataRestore = useCallback(() => {
    setRestartRequired(true);
    setCurrentStep(FirstBootStep.Restart);
  }, []);

  const onSkipDataRestore = useCallback(() => {
    onComplete(restartRequired);
  }, [onComplete, restartRequired]);

  const onRestart = useCallback(() => {
    onComplete(true);
  }, [onComplete]);

  const onCancelRestart = useCallback(() => {
    setCurrentStep(
      bootItems.isFirstBoot ? FirstBootStep.DataRestore : FirstBootStep.TimeZone
    );
  }, [bootItems.isFirstBoot]);

  useEffect(() => {
    // Start timer to move to next step automatically once we're on the restart step
    if (currentStep === FirstBootStep.Restart) {
      if (restartTimeout.current == null) {
        setRestartRequired(true);
        restartTimeout.current = setTimeout(
          onRestart,
          30000
        ) as unknown as number;
      }
    }
    return () => {
      clearTimeout(restartTimeout.current);
      restartTimeout.current = undefined;
    };
  }, [currentStep, onRestart]);

  return (
    <BootRoot>
      {currentStep === FirstBootStep.Language && (
        <SelectLanguageModal open={true} onNext={onNextForLanguage} />
      )}
      {currentStep === FirstBootStep.Eula && (
        <FirstBootEulaModal open={true} onNext={onNextForEula} />
      )}
      {currentStep === FirstBootStep.TimeZone && (
        <TimeZoneSelectionModal open={true} onNext={onNextForTimezone} />
      )}
      {currentStep === FirstBootStep.SmartService && (
        <ActivateSmartServiceModal open={true} onNext={onNextForSmartService} />
      )}
      {currentStep === FirstBootStep.DataRestore && (
        <UsbRestore onCancel={onSkipDataRestore} isFirstBoot={true} />
      )}
      {currentStep === FirstBootStep.Restart && (
        <ConfirmModal
          dismissable={false}
          open={true}
          onClose={onCancelRestart}
          onConfirm={onRestart}
          headerContent={t("boot.restart.header")}
          bodyContent={<Trans i18nKey={"boot.restart.body"} />}
          confirmButtonContent={t("settings.confirmRestart.restartNow")}
          cancelButtonContent={t("general.buttons.back")}
        />
      )}
    </BootRoot>
  );
}
