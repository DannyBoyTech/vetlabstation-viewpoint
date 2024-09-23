import { useEventListener } from "../../../context/EventSourceContext";
import {
  EventIds,
  InstrumentType,
  PatientDto,
  PatientJobAcceptedDto,
  QcLotDto,
  RunningInstrumentRunDto,
  SampleTypeEnum,
  SettingTypeEnum,
} from "@viewpoint/api";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { ProCyteDxStartQcInstructions } from "../../../screens/instruments/procytedx/qc/ProCyteDxStartQcInstructions";
import { TenseiStartQcInstructions } from "../../../screens/instruments/tensei/qc/TenseiStartQcInstructions";
import { useConfirmModal } from "../../../components/global-modals/components/GlobalConfirmModal";
import { SediVueDxStartQcInstructions } from "../../../screens/instruments/sedivue/qc/SediVueDxStartQcInstructions";
import { useGetSettingsQuery } from "../../../api/SettingsApi";
import { useInstrumentNameForId } from "../hooks";
import { InvertSampleReminderContent } from "../../../components/reminders/InvertSampleReminderContent";
import { CatOneSmartQcInstructions } from "../../../screens/instruments/catone/qc/CatOneSmartQcInstructions";
import { UriSysDxSamplePrepInstructionsContent } from "../../../screens/instruments/urisysdx/UriSysDxSamplePrepInstructionsContent";

export function usePatientJobActions() {
  const { addConfirmModal, removeConfirmModal } = useConfirmModal();
  const { t } = useTranslation();
  const getInstrumentName = useInstrumentNameForId();

  const { data: settings } = useGetSettingsQuery([
    SettingTypeEnum.INVERT_SAMPLE_REMINDER,
    SettingTypeEnum.PROCYTE_ONE_INVERT_SAMPLE_REMINDER,
    SettingTypeEnum.URISYS_DX_SAMPLE_PREP_INSTRUCTIONS_ENABLED,
  ]);

  const pdxInvertSampleReminderEnabled =
    settings?.[SettingTypeEnum.INVERT_SAMPLE_REMINDER] === "true";
  const pcoInvertSampleReminderEnabled =
    settings?.[SettingTypeEnum.PROCYTE_ONE_INVERT_SAMPLE_REMINDER] === "true";
  const urisysdxSamplePrepInstructionsEnabled =
    settings?.[SettingTypeEnum.URISYS_DX_SAMPLE_PREP_INSTRUCTIONS_ENABLED] ===
    "true";

  const handleProCyteQc = useCallback(
    (qcDto: QcLotDto, instrumentId: number) => {
      const modalId = crypto.randomUUID();
      addConfirmModal({
        id: modalId,
        responsive: true,
        dismissable: false,
        headerContent: t(
          "instrumentScreens.proCyteDx.qualityControl.runQC.header"
        ),
        bodyContent: (
          <ProCyteDxStartQcInstructions
            modalId={modalId}
            qcLotInfo={qcDto}
            instrumentId={instrumentId}
          />
        ),
        onConfirm: () => {},
        onClose: () => {},
        confirmButtonContent: t("general.buttons.ok"),
      });
    },
    [addConfirmModal, t]
  );

  const handleTenseiQc = useCallback(
    (qcDto: QcLotDto, instrumentId: number) => {
      const modalId = crypto.randomUUID();
      addConfirmModal({
        id: modalId,
        responsive: true,
        dismissable: false,
        headerContent: t(
          "instrumentScreens.tensei.qualityControl.runQC.header"
        ),
        bodyContent: (
          <TenseiStartQcInstructions
            modalId={modalId}
            qcLotInfo={qcDto}
            instrumentId={instrumentId}
          />
        ),
        onConfirm: () => {},
        onClose: () => {},
        confirmButtonContent: t("general.buttons.ok"),
      });
    },
    [addConfirmModal, t]
  );

  const handleSediVueQc = useCallback(
    (qcDto: QcLotDto, instrumentId: number) => {
      const modalId = crypto.randomUUID();
      addConfirmModal({
        id: modalId,
        responsive: true,
        dismissable: false,
        headerContent: t("instrumentScreens.sediVueDx.qc.runQc.title"),
        bodyContent: (
          <SediVueDxStartQcInstructions
            qcLotInfo={qcDto}
            instrumentId={instrumentId}
            modalId={modalId}
          />
        ),
        onConfirm: () => {},
        onClose: () => {},
        confirmButtonContent: t("general.buttons.ok"),
      });
    },
    [addConfirmModal, t]
  );

  const handleInvertSampleReminder = useCallback(
    (instrumentRun: RunningInstrumentRunDto, patient: PatientDto) => {
      if (
        instrumentRun.instrumentType === InstrumentType.ProCyteDx ||
        instrumentRun.instrumentType === InstrumentType.ProCyteOne
      ) {
        const modalId = crypto.randomUUID();
        addConfirmModal({
          id: modalId,
          responsive: true,
          headerContent: t("reminders.sampleInvertReminder.title"),
          secondaryHeaderContent: getInstrumentName(instrumentRun.instrumentId),
          bodyContent: (
            <InvertSampleReminderContent
              patient={patient}
              instrumentId={instrumentRun.instrumentId}
              instrumentType={instrumentRun.instrumentType}
              onProgress={() => removeConfirmModal(modalId)}
            />
          ),
          onConfirm: () => {},
          onClose: () => {},
          confirmButtonContent: t("general.buttons.ok"),
        });
      } else {
        console.warn(
          `Instrument type ${instrumentRun.instrumentType} not applicable to sample invert reminder`
        );
      }
    },
    [addConfirmModal, getInstrumentName, removeConfirmModal, t]
  );

  const handleCatOneSmartQc = useCallback(
    (instrumentId: number) => {
      const modalId = crypto.randomUUID();
      addConfirmModal({
        id: modalId,
        dismissable: false,
        headerContent: t("instrumentScreens.catOne.smartQcModal.title"),
        secondaryHeaderContent: t(`instruments.names.CATONE`),
        bodyContent: (
          <CatOneSmartQcInstructions
            instrumentId={instrumentId}
            onProgress={() => removeConfirmModal(modalId)}
          />
        ),
        onConfirm: () => {},
        onClose: () => {},
        confirmButtonContent: t("general.buttons.ok"),
      });
    },
    [addConfirmModal, removeConfirmModal, t]
  );

  const handleUriSysDxSamplePrepInstructions = useCallback(
    (instrumentRun: RunningInstrumentRunDto, patient: PatientDto) => {
      const modalId = crypto.randomUUID();
      addConfirmModal({
        id: modalId,
        dismissable: true,
        headerContent: t(
          "instrumentScreens.uriSysDx.samplePreparationInstructions.title"
        ),
        secondaryHeaderContent: t(`instruments.names.URISYS_DX`),
        bodyContent: (
          <UriSysDxSamplePrepInstructionsContent
            patient={patient}
            instrumentRun={instrumentRun}
            onProgress={() => removeConfirmModal(modalId)}
          />
        ),
        onConfirm: () => removeConfirmModal(modalId),
        onClose: () => removeConfirmModal(modalId),
        confirmButtonContent: t("general.buttons.ok"),
      });
    },
    [addConfirmModal, removeConfirmModal, t]
  );

  const eventListenerCallback = useCallback(
    (msg: MessageEvent) => {
      const message: PatientJobAcceptedDto = JSON.parse(msg.data);
      const labRequest = message["lab-request"];
      const instrumentRun = message["instrument-run"];
      const qualityControl = message["quality-control"];

      if (instrumentRun.instrumentType === InstrumentType.ProCyteDx) {
        if (
          instrumentRun.sampleType === SampleTypeEnum.QUALITYCONTROL &&
          qualityControl != null
        ) {
          handleProCyteQc(qualityControl, instrumentRun.instrumentId);
        } else if (
          pdxInvertSampleReminderEnabled &&
          instrumentRun.sampleType !== SampleTypeEnum.QUALITYCONTROL
        ) {
          handleInvertSampleReminder(instrumentRun, labRequest.patientDto);
        }
      } else if (
        instrumentRun.instrumentType === InstrumentType.ProCyteOne &&
        pcoInvertSampleReminderEnabled &&
        instrumentRun.sampleType !== SampleTypeEnum.QUALITYCONTROL
      ) {
        handleInvertSampleReminder(instrumentRun, labRequest.patientDto);
      } else if (instrumentRun.instrumentType === InstrumentType.Tensei) {
        if (
          instrumentRun.sampleType === SampleTypeEnum.QUALITYCONTROL &&
          qualityControl != null
        ) {
          handleTenseiQc(qualityControl, instrumentRun.instrumentId);
        }
      } else if (instrumentRun.instrumentType === InstrumentType.SediVueDx) {
        if (
          instrumentRun.sampleType === SampleTypeEnum.QUALITYCONTROL &&
          qualityControl != null
        ) {
          handleSediVueQc(qualityControl, instrumentRun.instrumentId);
        }
      } else if (instrumentRun.instrumentType === InstrumentType.CatalystOne) {
        if (
          instrumentRun.sampleType === SampleTypeEnum.QUALITYCONTROL &&
          qualityControl != null
        ) {
          if (qualityControl.isSmartQc != null && qualityControl.isSmartQc) {
            handleCatOneSmartQc(instrumentRun.instrumentId);
          }
        }
      } else if (
        instrumentRun.instrumentType === InstrumentType.UriSysDx &&
        urisysdxSamplePrepInstructionsEnabled &&
        instrumentRun.sampleType != SampleTypeEnum.QUALITYCONTROL
      ) {
        handleUriSysDxSamplePrepInstructions(
          instrumentRun,
          labRequest.patientDto
        );
      }
    },
    [
      handleCatOneSmartQc,
      handleInvertSampleReminder,
      handleProCyteQc,
      handleTenseiQc,
      handleSediVueQc,
      handleUriSysDxSamplePrepInstructions,
      pcoInvertSampleReminderEnabled,
      pdxInvertSampleReminderEnabled,
      urisysdxSamplePrepInstructionsEnabled,
    ]
  );

  useEventListener(EventIds.PatientJobAccepted, eventListenerCallback);
}
