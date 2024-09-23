import styled from "styled-components";
import { useContext } from "react";
import {
  ExecuteInstrumentRunDto,
  InstrumentDto,
  InstrumentRunConfigurationDto,
  InstrumentStatusDto,
  InstrumentType,
  PatientDto,
  RefClassDto,
  SampleTypesMapping,
  SpeciesDto,
  TheiaBloodWorkflow,
} from "@viewpoint/api";
import { useInstrumentNameForId } from "../../utils/hooks/hooks";
import { BuildLabRequestContext } from "./BuildLabRequestContext";
import { isBloodType } from "../../components/run-configurations/instruments/theia/blood/blood-common";
import { useLazyGetInstrumentRemindersQuery } from "../../api/HematologyInstrumentApi";
import { useConfirmModal } from "../../components/global-modals/components/GlobalConfirmModal";
import { LocalizedPatientSignalment } from "../../components/localized-signalment/LocalizedPatientSignalment";
import { useTranslation } from "react-i18next";
import { SpotIcon } from "@viewpoint/spot-icons";
import SpinnerOverlay from "../../components/overlay/SpinnerOverlay";
import { SelectableInstrumentWithRunConfig } from "./SelectableInstrumentWithRunConfig";

const InstrumentSelectionRoot = styled.div`
  flex: 1;
  display: flex;
  overflow-y: auto;
  gap: 8px;
`;

const Column = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 8px;
  width: 50%;
`;

export interface SelectInstrumentsProps {
  species: SpeciesDto;
  lifestage?: RefClassDto;
  executeRunRequests: ExecuteInstrumentRunDto[];
}

export function SelectInstruments({
  executeRunRequests,
  ...props
}: SelectInstrumentsProps) {
  const {
    initializing,
    referenceData,
    defaultRunConfigs,
    updateExecuteRun,
    addExecuteRun,
    updateSelectedSnapTests,
    removeExecuteRun,
    removeRunsForInstrument,
    patient,
  } = useContext(BuildLabRequestContext);

  const [getReminders] = useLazyGetInstrumentRemindersQuery();

  const { addConfirmModal, removeConfirmModal } = useConfirmModal();
  const { t } = useTranslation();
  const getInstrumentName = useInstrumentNameForId();

  // Sort instruments, based on their sort order, left to right
  const leftColumnInstruments = referenceData.availableInstruments?.filter(
    (_v, index) => index % 2 === 0
  );
  const rightColumnInstruments = referenceData.availableInstruments?.filter(
    (_v, index) => index % 2 !== 0
  );

  const updateDefaultRunConfigurations = (
    instrumentType: InstrumentType,
    instrumentRunConfigurations: InstrumentRunConfigurationDto[]
  ) => {
    instrumentRunConfigurations.forEach((configuration) => {
      // InVueDx specific configurations
      if (instrumentType == InstrumentType.Theia) {
        if (isBloodType(configuration)) {
          configuration.bloodRunConfigurationDto =
            configuration.bloodRunConfigurationDto ?? {
              workflow: TheiaBloodWorkflow.STANDALONE,
            };
          configuration.fnaRunConfigurationDto = undefined;
          configuration.earSwabRunConfiguration = undefined;
        }
        if (configuration.sampleTypeId === SampleTypesMapping.FNA) {
          configuration.bloodRunConfigurationDto = undefined;
          configuration.earSwabRunConfiguration = undefined;
        }
        if (configuration.sampleTypeId === SampleTypesMapping.EAR_SWAB) {
          configuration.bloodRunConfigurationDto = undefined;
          configuration.fnaRunConfigurationDto = undefined;
        }
      }
    });
  };

  const handleUpdatedRunConfig = (
    instrument: InstrumentDto,
    runQueueId: number,
    newRunConfigurations?: InstrumentRunConfigurationDto[]
  ) => {
    // Find the run
    const run = executeRunRequests?.find((er) => {
      return er.instrumentId === instrument.id && er.runQueueId === runQueueId;
    });
    if (run == null || executeRunRequests == null) {
      console.error(
        `Attempted to add run configuration for missing execute run request: ${instrument.id}@runQueueId=${runQueueId}`
      );
    } else {
      run.instrumentRunConfigurations =
        newRunConfigurations == null ? [] : newRunConfigurations;
      updateDefaultRunConfigurations(
        instrument.instrumentType,
        run.instrumentRunConfigurations
      );
      updateExecuteRun(instrument.id, runQueueId, run);
    }
  };

  const handleAddInstrument = async (instrument: InstrumentDto) => {
    if (instrument.instrumentType === InstrumentType.ProCyteDx) {
      const reminders = (await getReminders(instrument.id).unwrap()) ?? [];
      if (reminders.length > 0) {
        const modalId = crypto.randomUUID();
        addConfirmModal({
          id: modalId,
          dismissable: true,
          headerContent: getInstrumentName(instrument.id),
          bodyContent: (
            <InstrumentReminderModalContent
              patient={patient}
              instrument={instrument}
              reminders={reminders}
            />
          ),
          onConfirm: () => addExecuteRun(instrument),
          onClose: () => removeConfirmModal(modalId),
          cancelButtonContent: t("general.buttons.cancel"),
          confirmButtonContent: t("general.buttons.addToRun"),
        });
      } else {
        addExecuteRun(instrument);
      }
    } else {
      addExecuteRun(instrument);
    }
  };

  const handleRemoveInstrument = (
    instrument: InstrumentDto,
    runQueueId?: number
  ) => {
    if (executeRunRequests != null) {
      if (
        instrument.instrumentType === InstrumentType.SNAP ||
        runQueueId == null
      ) {
        removeRunsForInstrument(
          instrument.id,
          instrument.instrumentType === InstrumentType.SNAP
        );
      } else {
        removeExecuteRun(instrument.id, runQueueId);
      }
    }
  };

  const getSelectableInstrumentWithRunConfig = (
    statusDto: InstrumentStatusDto
  ) => (
    <SelectableInstrumentWithRunConfig
      key={statusDto.instrument.id}
      instrument={statusDto.instrument}
      instrumentStatus={statusDto.instrumentStatus}
      executeRunRequests={executeRunRequests}
      onAdd={() => handleAddInstrument(statusDto.instrument)}
      onSnapsChanged={(ids) => updateSelectedSnapTests(ids)}
      onRemove={(runQueueId) =>
        handleRemoveInstrument(statusDto.instrument, runQueueId)
      }
      onRunConfigUpdated={(runQueueId, configurations) =>
        handleUpdatedRunConfig(statusDto.instrument, runQueueId, configurations)
      }
      species={props.species}
      lifestage={props.lifestage}
      referenceData={referenceData}
      defaultRunConfigs={defaultRunConfigs ?? {}}
    />
  );

  return (
    <InstrumentSelectionRoot>
      {initializing ? (
        <SpinnerOverlay />
      ) : (
        <>
          <Column>
            {leftColumnInstruments?.map(getSelectableInstrumentWithRunConfig)}
          </Column>

          <Column>
            {rightColumnInstruments?.map(getSelectableInstrumentWithRunConfig)}
          </Column>
        </>
      )}
    </InstrumentSelectionRoot>
  );
}

const InstrumentReminderModalContentRoot = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

const RemindersListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ReminderContainer = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;

  > .spot-icon {
    fill: ${(p) => p.theme.colors?.feedback?.error};
  }
`;

interface InstrumentReminderModalContentProps {
  patient: PatientDto;
  instrument: InstrumentDto;
  reminders: string[];
}

function InstrumentReminderModalContent(
  props: InstrumentReminderModalContentProps
) {
  const { t } = useTranslation();
  return (
    <InstrumentReminderModalContentRoot>
      <LocalizedPatientSignalment patient={props.patient} size="small" />
      <RemindersListContainer>
        {props.reminders.map((reminder) => (
          <ReminderContainer key={reminder}>
            <SpotIcon name="alert-notification" />
            <div key={reminder}>{t(reminder as any)}</div>
          </ReminderContainer>
        ))}
      </RemindersListContainer>
    </InstrumentReminderModalContentRoot>
  );
}
