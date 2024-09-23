import { useNavigate, useParams } from "react-router-dom";
import {
  InstrumentPageContent,
  InstrumentPageRightPanel,
  InstrumentPageRightPanelButtonContainer,
  InstrumentPageRoot,
} from "../../common-components";
import { Button, Input, SpotText, useToast } from "@viewpoint/spot-react/src";
import { Trans, useTranslation } from "react-i18next";
import { useState } from "react";
import styled from "styled-components";
import { CommonTransComponents } from "../../../../utils/i18n-utils";
import { HealthCode, InstallationStatus, InstrumentType } from "@viewpoint/api";
import {
  ConfirmModal,
  ConfirmModalProps,
} from "../../../../components/confirm-modal/ConfirmModal";
import { UsbSelectionModal } from "../../../../components/usb/UsbSelectionModal";
import {
  DefaultSuccessToastOptions,
  ToastContentRoot,
  ToastText,
  ToastTextContentRoot,
} from "../../../../utils/toast/toast-defaults";
import { useGetDetailedInstrumentStatusQuery } from "../../../../api/InstrumentApi";
import {
  useInstallPdxFromLocalMutation,
  useInstallPdxFromUsbMutation,
  useLazyVerifyLocalForPdxInstallQuery,
  useLazyVerifyUsbForPdxInstallQuery,
  useTransmitPdxSerialNumberFromLocalMutation,
  useTransmitPdxSerialNumberFromUsbMutation,
} from "../../../../api/ProCyteDxApi";
import SpinnerOverlay from "../../../../components/overlay/SpinnerOverlay";
import { InputAware } from "../../../../components/InputAware";
import { useLazyGetRemovableDrivesQuery } from "../../../../api/UsbApi";
import {
  CommonMasks,
  MaskedInput,
} from "../../../../components/input/MaskedInput";
import {
  useHeaderTitle,
  useInstrumentNameForId,
} from "../../../../utils/hooks/hooks";

const InputContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 500px;
`;

export function PdxNewHardwareConfigurationScreen() {
  const [serialNumber, setSerialNumber] = useState("");
  const [activeWorkflow, setActiveWorkflow] = useState<"usb" | "local">();
  const { instrumentId: instrumentIdParam } = useParams();
  const instrumentId = Number(instrumentIdParam);
  const nav = useNavigate();

  const { t } = useTranslation();

  const [checkForLocal, checkLocalStatus] =
    useLazyVerifyLocalForPdxInstallQuery();

  useHeaderTitle({
    label: t("instrumentScreens.proCyteDx.newHardware.title"),
  });

  const handleNext = async () => {
    const installStatus = await checkForLocal({
      instrumentId,
      serialNumber,
    }).unwrap();
    if (installStatus === InstallationStatus.FILES_FOUND) {
      setActiveWorkflow("local");
    } else {
      setActiveWorkflow("usb");
    }
  };

  return (
    <InstrumentPageRoot>
      <InstrumentPageContent>
        <InputContent>
          <SpotText level="paragraph" bold>
            {t("instrumentScreens.proCyteDx.newHardware.header")}
          </SpotText>
          <InputAware>
            <MaskedInput
              autoFocus
              mask={CommonMasks.DIGITS_ALPHA_ANYCASE}
              value={serialNumber}
              onAccept={(value) => setSerialNumber(value.toUpperCase())}
            />
          </InputAware>
          <SpotText level="secondary">
            <Trans
              i18nKey="instrumentScreens.proCyteDx.newHardware.instructions"
              components={CommonTransComponents}
            />
          </SpotText>
        </InputContent>
      </InstrumentPageContent>
      <InstrumentPageRightPanel>
        <InstrumentPageRightPanelButtonContainer>
          <Button
            onClick={handleNext}
            buttonType="primary"
            disabled={serialNumber.length === 0 || checkLocalStatus.isLoading}
          >
            {t("general.buttons.next")}
          </Button>
          <Button buttonType="secondary" onClick={() => nav(-1)}>
            {t("general.buttons.cancel")}
          </Button>
        </InstrumentPageRightPanelButtonContainer>
      </InstrumentPageRightPanel>
      {activeWorkflow === "usb" && (
        <UsbWorkflow
          onClose={() => setActiveWorkflow(undefined)}
          instrumentId={instrumentId}
          serialNumber={serialNumber}
        />
      )}
      {activeWorkflow === "local" && checkLocalStatus.data != null && (
        <LocalWorkflow
          initialResponse={checkLocalStatus.data}
          onClose={() => setActiveWorkflow(undefined)}
          instrumentId={instrumentId}
          serialNumber={serialNumber}
        />
      )}
    </InstrumentPageRoot>
  );
}

const UsbStep = {
  PromptUsb: "PromptUsb",
  SelectUsbDrive: "SelectUsbDrive",
  NoFiles: "NoFiles",
  Loading: "loading",
} as const;
type Step = (typeof UsbStep)[keyof typeof UsbStep] | InstallationStatus;

interface WorkflowProps {
  instrumentId: number;
  serialNumber: string;
  onClose: () => void;
}

function UsbWorkflow(props: WorkflowProps) {
  const [currentStep, setCurrentStep] = useState<Step>(UsbStep.PromptUsb);
  const [selectedDriveId, setSelectedDriveId] = useState<string>();
  const { t } = useTranslation();
  const nav = useNavigate();

  const { addToast } = useToast();
  const [verifyUsb] = useLazyVerifyUsbForPdxInstallQuery();
  const [getDrives] = useLazyGetRemovableDrivesQuery();
  const [installFromUsb] = useInstallPdxFromUsbMutation();
  const [transmitFromUsb] = useTransmitPdxSerialNumberFromUsbMutation();

  const getInstrumentName = useInstrumentNameForId();

  const { data: detailedStatus } = useGetDetailedInstrumentStatusQuery(
    props.instrumentId
  );

  const handleAction = async (
    driveId: string,
    action: typeof verifyUsb | typeof installFromUsb | typeof transmitFromUsb
  ) => {
    setCurrentStep("loading");
    const status = await action({
      instrumentId: props.instrumentId,
      serialNumber: props.serialNumber,
      driveId,
    }).unwrap();
    if (status === InstallationStatus.SUCCESS) {
      addToast({
        ...DefaultSuccessToastOptions,
        content: <SuccessToastContent instrumentId={props.instrumentId} />,
      });
      nav("/");
    } else {
      setCurrentStep(status);
    }
  };

  const checkForUsb = async () => {
    setCurrentStep("loading");
    // Is there just a single USB drive?
    const usbDrives = await getDrives().unwrap();
    if (usbDrives.length === 1) {
      // Does it have a valid file?
      const status = await verifyUsb({
        driveId: usbDrives[0].id,
        instrumentId: props.instrumentId,
        serialNumber: props.serialNumber,
      }).unwrap();
      if (status === InstallationStatus.FILES_FOUND) {
        setSelectedDriveId(usbDrives[0].id);
        setCurrentStep(InstallationStatus.FILES_FOUND);
      } else {
        setCurrentStep(UsbStep.SelectUsbDrive);
      }
    } else {
      setCurrentStep(UsbStep.SelectUsbDrive);
    }
  };

  const commonModalProps: Pick<
    ConfirmModalProps,
    | "open"
    | "dismissable"
    | "onClose"
    | "headerContent"
    | "secondaryHeaderContent"
    | "cancelButtonContent"
  > = {
    open: true,
    dismissable: false,
    onClose: props.onClose,
    headerContent: t("instrumentScreens.proCyteDx.newHardware.dialogHeader"),
    secondaryHeaderContent: t("instruments.names.CRIMSON"),
    cancelButtonContent: t("general.buttons.cancel"),
  };

  switch (currentStep) {
    case UsbStep.PromptUsb:
      return (
        <ConfirmModal
          {...commonModalProps}
          onConfirm={checkForUsb}
          headerContent={t(
            "instrumentScreens.proCyteDx.newHardware.dialogHeader"
          )}
          bodyContent={
            <Trans
              i18nKey="instrumentScreens.proCyteDx.newHardware.selectUsb.body"
              components={CommonTransComponents}
            />
          }
          confirmButtonContent={t("general.buttons.next")}
        />
      );
    case UsbStep.SelectUsbDrive:
      return (
        <UsbSelectionModal
          visible
          secondaryHeaderContent={
            <SpotText level="h4" className="spot-modal__secondary-title">
              {t("instruments.names.CRIMSON")}
            </SpotText>
          }
          bodyContent={
            <SpotText level="paragraph">
              {t(
                "instrumentScreens.proCyteDx.newHardware.selectUsb.selectBody"
              )}
            </SpotText>
          }
          onClose={props.onClose}
          onDriveSelected={async (driveId) => {
            setSelectedDriveId(driveId);
            await handleAction(driveId, verifyUsb);
          }}
        />
      );
    case InstallationStatus.FILES_FOUND:
      return selectedDriveId == null ? (
        <></>
      ) : (
        <ConfirmModal
          {...commonModalProps}
          onConfirm={() => handleAction(selectedDriveId, installFromUsb)}
          bodyContent={
            <Trans
              i18nKey={"instrumentScreens.proCyteDx.newHardware.filesFound"}
              components={CommonTransComponents}
            />
          }
          confirmButtonContent={t("general.buttons.finish")}
        />
      );
    case InstallationStatus.FILES_NOT_FOUND:
      return selectedDriveId == null ? (
        <></>
      ) : (
        <ConfirmModal
          {...commonModalProps}
          headerContent={t(
            "instrumentScreens.proCyteDx.newHardware.filesNotFound_header"
          )}
          onConfirm={() => setCurrentStep(UsbStep.SelectUsbDrive)}
          bodyContent={
            <Trans
              i18nKey={"instrumentScreens.proCyteDx.newHardware.filesNotFound"}
              components={CommonTransComponents}
            />
          }
          confirmButtonContent={t("general.buttons.ok")}
        />
      );
    case InstallationStatus.MAIN_UNIT_ON:
      return selectedDriveId == null ? (
        <></>
      ) : (
        <ConfirmModal
          {...commonModalProps}
          onConfirm={() => handleAction(selectedDriveId, installFromUsb)}
          bodyContent={
            <Trans
              i18nKey={"instrumentScreens.proCyteDx.newHardware.mainUnitOn"}
              components={CommonTransComponents}
            />
          }
          confirmButtonContent={t("general.buttons.finish")}
          confirmable={detailedStatus?.status === HealthCode.HALT}
        />
      );
    case InstallationStatus.TRANSMISSION_ERROR_SYSTEM_CAL:
      return selectedDriveId == null ? (
        <></>
      ) : (
        <ConfirmModal
          {...commonModalProps}
          onConfirm={() => handleAction(selectedDriveId, installFromUsb)}
          bodyContent={
            <Trans
              i18nKey={
                "instrumentScreens.proCyteDx.newHardware.transmissionErrorSystemCal"
              }
              components={CommonTransComponents}
            />
          }
          confirmButtonContent={t("general.buttons.finish")}
        />
      );
    case InstallationStatus.TRANSMISSION_ERROR_SERIAL_NUMBER:
      return selectedDriveId == null ? (
        <></>
      ) : (
        <ConfirmModal
          {...commonModalProps}
          onConfirm={() => handleAction(selectedDriveId, transmitFromUsb)}
          bodyContent={
            <Trans
              i18nKey={
                "instrumentScreens.proCyteDx.newHardware.transmissionErrorSerialNumber"
              }
              components={CommonTransComponents}
            />
          }
          confirmButtonContent={t("general.buttons.finish")}
        />
      );
    case "loading":
      return <SpinnerOverlay />;
    default:
      if (currentStep != null) {
        return (
          <ConfirmModal
            {...commonModalProps}
            onConfirm={props.onClose}
            bodyContent={t("general.messages.somethingWentWrong")}
            confirmButtonContent={t("general.buttons.ok")}
            cancelButtonContent={undefined}
          />
        );
      }
  }
  return <></>;
}

interface LocalWorkflowProps extends WorkflowProps {
  initialResponse: InstallationStatus;
}

function LocalWorkflow(props: LocalWorkflowProps) {
  const [currentStep, setCurrentStep] = useState<
    InstallationStatus | "loading"
  >(props.initialResponse);
  const { t } = useTranslation();
  const nav = useNavigate();

  const { addToast } = useToast();
  const [verifyLocal] = useLazyVerifyLocalForPdxInstallQuery();
  const [installFromLocal] = useInstallPdxFromLocalMutation();
  const [transmitFromLocal] = useTransmitPdxSerialNumberFromLocalMutation();

  const { data: detailedStatus } = useGetDetailedInstrumentStatusQuery(
    props.instrumentId
  );

  const handleAction = async (
    action:
      | typeof verifyLocal
      | typeof installFromLocal
      | typeof transmitFromLocal
  ) => {
    setCurrentStep("loading");
    const status = await action({
      instrumentId: props.instrumentId,
      serialNumber: props.serialNumber,
    }).unwrap();
    if (status === InstallationStatus.SUCCESS) {
      addToast({
        ...DefaultSuccessToastOptions,
        content: <SuccessToastContent instrumentId={props.instrumentId} />,
      });
      nav("/");
    } else {
      setCurrentStep(status);
    }
  };

  const commonModalProps: Pick<
    ConfirmModalProps,
    | "open"
    | "dismissable"
    | "onClose"
    | "headerContent"
    | "secondaryHeaderContent"
    | "cancelButtonContent"
  > = {
    open: true,
    dismissable: false,
    onClose: props.onClose,
    headerContent: t("instrumentScreens.proCyteDx.newHardware.dialogHeader"),
    secondaryHeaderContent: t("instruments.names.CRIMSON"),
    cancelButtonContent: t("general.buttons.cancel"),
  };
  switch (currentStep) {
    case InstallationStatus.FILES_FOUND:
      return (
        <ConfirmModal
          {...commonModalProps}
          onConfirm={() => handleAction(installFromLocal)}
          bodyContent={
            <Trans
              i18nKey={"instrumentScreens.proCyteDx.newHardware.filesFound"}
              components={CommonTransComponents}
            />
          }
          confirmButtonContent={t("general.buttons.finish")}
        />
      );
    case InstallationStatus.MAIN_UNIT_ON:
      return (
        <ConfirmModal
          {...commonModalProps}
          onConfirm={() => handleAction(installFromLocal)}
          bodyContent={
            <Trans
              i18nKey={"instrumentScreens.proCyteDx.newHardware.mainUnitOn"}
              components={CommonTransComponents}
            />
          }
          confirmButtonContent={t("general.buttons.finish")}
          confirmable={detailedStatus?.status === HealthCode.HALT}
        />
      );
    case InstallationStatus.TRANSMISSION_ERROR_SYSTEM_CAL:
      return (
        <ConfirmModal
          {...commonModalProps}
          onConfirm={() => handleAction(installFromLocal)}
          bodyContent={
            <Trans
              i18nKey={
                "instrumentScreens.proCyteDx.newHardware.transmissionErrorSystemCal"
              }
              components={CommonTransComponents}
            />
          }
          confirmButtonContent={t("general.buttons.finish")}
        />
      );
    case InstallationStatus.TRANSMISSION_ERROR_SERIAL_NUMBER:
      return (
        <ConfirmModal
          {...commonModalProps}
          onConfirm={() => handleAction(transmitFromLocal)}
          bodyContent={
            <Trans
              i18nKey={
                "instrumentScreens.proCyteDx.newHardware.transmissionErrorSerialNumber"
              }
              components={CommonTransComponents}
            />
          }
          confirmButtonContent={t("general.buttons.finish")}
        />
      );
    case "loading":
      return <SpinnerOverlay />;
    default:
      if (currentStep != null) {
        return (
          <ConfirmModal
            {...commonModalProps}
            onConfirm={props.onClose}
            bodyContent={t("general.messages.somethingWentWrong")}
            confirmButtonContent={t("general.buttons.ok")}
            cancelButtonContent={undefined}
          />
        );
      }
  }
  return <></>;
}

function SuccessToastContent(props: { instrumentId: number }) {
  const { t } = useTranslation();
  const getInstrumentName = useInstrumentNameForId();
  return (
    <ToastContentRoot>
      <ToastTextContentRoot>
        <ToastText level="paragraph" bold $maxLines={1}>
          {getInstrumentName(props.instrumentId)}
        </ToastText>
        <ToastText level="paragraph" $maxLines={2}>
          {t("instrumentScreens.proCyteDx.newHardware.success")}
        </ToastText>
      </ToastTextContentRoot>
    </ToastContentRoot>
  );
}
