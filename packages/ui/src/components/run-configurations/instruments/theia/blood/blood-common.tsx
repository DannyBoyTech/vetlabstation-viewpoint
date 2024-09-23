import styled from "styled-components";
import { Theme } from "../../../../../utils/StyleConstants";
import {
  BloodRunConfigurationDto,
  ExecuteInstrumentRunDto,
  InstrumentDto,
  InstrumentRunConfigurationDto,
  InstrumentStatusDto,
  InstrumentType,
  LabRequestDto,
  SampleTypesMapping,
  TheiaBloodWorkflow,
  TheiaMatchingRunResultDto,
} from "@viewpoint/api";

export const TableRoot = styled.div`
  width: 100%;
  height: 300px;

  .spot-data-table {
    width: 100%;
  }

  .spot-data-table__row--clicked.spot-data-table__row--clicked {
    background-color: ${(p: { theme: Theme }) =>
      p.theme.colors?.interactive?.hoverPrimary};
  }
`;

export const BloodModalWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 600px;
`;

export const BloodModalContentRoot = styled.div`
  display: flex;
  gap: 18px;
  justify-content: space-between;
`;

export enum BloodConfigWorkflowType {
  NONE = "NONE",
  INITIAL = "INITIAL",
  CBC = "CBC",
  HEMATOLOGY_RUN = "HEMATOLOGY_RUN",
  HISTORICAL_RUN = "HISTORICAL_RUN",
}

export interface HematologyConfiguration {
  instrument: InstrumentDto;
  request: ExecuteInstrumentRunDto | undefined;
}

export interface CbcValues {
  rbcValue?: number;
  wbcValue?: number;
  hctValue?: number;
}

const hematologyInstrumentComparator = (
  instrument1: InstrumentDto,
  instrument2: InstrumentDto
) => {
  if (
    instrument1.instrumentType === InstrumentType.ProCyteDx &&
    instrument2.instrumentType === InstrumentType.ProCyteOne
  ) {
    return -1;
  } else if (
    instrument1.instrumentType === InstrumentType.ProCyteOne &&
    instrument2.instrumentType === InstrumentType.ProCyteDx
  ) {
    return 1;
  } else {
    return (instrument1.displayNumber || 0) - (instrument2.displayNumber || 0);
  }
};

export const findConfigurations = (
  availableInstruments: InstrumentDto[],
  allRunRequests: ExecuteInstrumentRunDto[],
  predicate: (dto: ExecuteInstrumentRunDto, index: number) => void
) => {
  const instrumentMap = availableInstruments.reduce((prev, curr) => {
    prev.set(curr.id, curr);
    return prev;
  }, new Map<number, InstrumentDto>());

  const configurations = allRunRequests
    .filter((request, index) => predicate(request, index))
    .filter((request) => instrumentMap?.get(request.instrumentId) != null)
    .map((request) => {
      return {
        request: request,
        instrument: instrumentMap?.get(request.instrumentId),
      } as HematologyConfiguration;
    });

  return configurations.sort((config1, config2) =>
    hematologyInstrumentComparator(config1.instrument, config2.instrument)
  );
};

export const findHematologyInstruments = (
  instrumentStatuses: InstrumentStatusDto[],
  runConfigurations: ExecuteInstrumentRunDto[]
): InstrumentDto[] => {
  const runConfigurationMap = runConfigurations.reduce((prev, curr) => {
    prev.set(curr.instrumentId, curr);
    return prev;
  }, new Map<number, ExecuteInstrumentRunDto>());

  return instrumentStatuses
    .map((status) => {
      return {
        instrument: status.instrument,
        request: runConfigurationMap.get(status.instrument.id),
      };
    })
    .filter((item) => {
      return (
        (item.instrument.instrumentType === InstrumentType.ProCyteDx &&
          (item.request == null ||
            item.request.instrumentRunConfigurations.every(
              (instrumentRunConfiguration) =>
                instrumentRunConfiguration.sampleTypeId ===
                SampleTypesMapping.WHOLEBLOOD
            ))) ||
        (item.instrument.instrumentType === InstrumentType.ProCyteOne &&
          (item.request == null ||
            item.request.instrumentRunConfigurations.every(
              (instrumentRunConfiguration) =>
                isBloodType(instrumentRunConfiguration)
            )))
      );
    })
    .map((item) => item.instrument);
};

export const provideCbcValues = (
  currentConfig: InstrumentRunConfigurationDto
) => {
  return currentConfig.bloodRunConfigurationDto?.workflow ===
    TheiaBloodWorkflow.MANUAL &&
    (currentConfig.bloodRunConfigurationDto?.rbcValue != null ||
      currentConfig.bloodRunConfigurationDto?.wbcValue != null ||
      currentConfig.bloodRunConfigurationDto?.hctValue != null)
    ? {
        rbcValue: currentConfig.bloodRunConfigurationDto?.rbcValue,
        wbcValue: currentConfig.bloodRunConfigurationDto?.wbcValue,
        hctValue: currentConfig.bloodRunConfigurationDto?.hctValue,
      }
    : undefined;
};

export const providePatientHistoricalRun = (
  suggestions: TheiaMatchingRunResultDto[],
  currentConfig: InstrumentRunConfigurationDto
) => {
  return currentConfig.bloodRunConfigurationDto?.workflow ===
    TheiaBloodWorkflow.APPEND &&
    currentConfig.bloodRunConfigurationDto?.hematologyRunId != null
    ? suggestions.find(
        (suggestion) =>
          suggestion.instrumentRunId ===
          currentConfig.bloodRunConfigurationDto?.hematologyRunId
      )
    : undefined;
};

export const provideHematologyInstrumentConfiguration = (
  hematologyInstrumentConfigurations: HematologyConfiguration[],
  currentConfig: InstrumentRunConfigurationDto
) => {
  return currentConfig.bloodRunConfigurationDto?.workflow ===
    TheiaBloodWorkflow.TOGETHER &&
    currentConfig.bloodRunConfigurationDto?.hematologyInstrumentId != null &&
    currentConfig.bloodRunConfigurationDto?.hematologyRunQueueId != null
    ? hematologyInstrumentConfigurations.find(
        (configuration) =>
          configuration.request?.instrumentId ===
            currentConfig.bloodRunConfigurationDto?.hematologyInstrumentId &&
          configuration.request?.runQueueId ===
            currentConfig.bloodRunConfigurationDto?.hematologyRunQueueId
      )
    : undefined;
};

export const toHematologyConfig = (
  cbcValues: CbcValues | undefined,
  patientHistoricalRun: TheiaMatchingRunResultDto | undefined,
  hematologyInstrumentConfiguration: HematologyConfiguration | undefined
): BloodRunConfigurationDto => {
  if (cbcValues != null) {
    return {
      workflow: TheiaBloodWorkflow.MANUAL,
      rbcValue: cbcValues.rbcValue,
      wbcValue: cbcValues.wbcValue,
      hctValue: cbcValues.hctValue,
    };
  } else if (patientHistoricalRun != null) {
    return {
      workflow: TheiaBloodWorkflow.APPEND,
      hematologyRunId: patientHistoricalRun.instrumentRunId,
    };
  } else if (hematologyInstrumentConfiguration != null) {
    return {
      workflow: TheiaBloodWorkflow.TOGETHER,
      hematologyInstrumentId:
        hematologyInstrumentConfiguration.request?.instrumentId,
      hematologyRunQueueId:
        hematologyInstrumentConfiguration.request?.runQueueId,
    };
  } else {
    return {
      workflow: TheiaBloodWorkflow.STANDALONE,
    };
  }
};

// Checks if the current instrument requests contain a valid Hematology "partner"
// run for inVue Dx blood workflow. If not, removes the blood run configuration
// portion of the instrument run configuration
export function provideCleanedConfiguration(
  // props
  currentConfig: InstrumentRunConfigurationDto,
  // context
  availableInstruments: InstrumentStatusDto[],
  instrumentRunDtos: ExecuteInstrumentRunDto[]
): BloodRunConfigurationDto | undefined {
  // all PCDx/PC1 instruments
  const hematologyInstruments = findHematologyInstruments(
    availableInstruments,
    instrumentRunDtos
  );

  // all PCDx/PC1 configurations
  const hematologyInstrumentConfigurations = findConfigurations(
    hematologyInstruments,
    instrumentRunDtos,
    () => true
  );

  const hematologyInstrumentConfiguration: HematologyConfiguration | undefined =
    provideHematologyInstrumentConfiguration(
      hematologyInstrumentConfigurations,
      currentConfig
    );

  // User deselected PC instrument or BLOOD sample type
  if (
    currentConfig.bloodRunConfigurationDto?.workflow ===
      TheiaBloodWorkflow.TOGETHER &&
    hematologyInstrumentConfiguration == null
  ) {
    return toHematologyConfig(undefined, undefined, undefined);
  } else {
    return undefined;
  }
}

export function provideInitialConfiguration(
  // loaded
  suggestions: TheiaMatchingRunResultDto[],
  // props
  run: ExecuteInstrumentRunDto,
  // context
  originalLabRequest: LabRequestDto | undefined,
  availableInstruments: InstrumentStatusDto[],
  instrumentRunDtos: ExecuteInstrumentRunDto[]
): BloodRunConfigurationDto | undefined {
  // all PC instruments
  const hematologyInstruments = findHematologyInstruments(
    availableInstruments,
    instrumentRunDtos
  );

  // all PC configurations valid for auto attachment
  const priorHematologyInstrumentConfigurations = findConfigurations(
    hematologyInstruments,
    instrumentRunDtos,
    (request, index) => index < instrumentRunDtos.indexOf(run)
  );
  if (originalLabRequest != null && suggestions.length == 1) {
    // Add tests flow with single valid result
    return toHematologyConfig(undefined, suggestions[0], undefined);
  } else if (
    priorHematologyInstrumentConfigurations != null &&
    priorHematologyInstrumentConfigurations.length > 0
  ) {
    // Set blood instrument from same run request
    return toHematologyConfig(
      undefined,
      undefined,
      priorHematologyInstrumentConfigurations[0]
    );
  }

  return undefined;
}

export function isBloodType(runConfig?: InstrumentRunConfigurationDto) {
  return SampleTypesMapping.BLOOD === runConfig?.sampleTypeId;
}

export function validBloodRun(run: ExecuteInstrumentRunDto) {
  return (
    run.instrumentRunConfigurations != null &&
    run.instrumentRunConfigurations.length > 0 &&
    run.instrumentRunConfigurations.every(isBloodType)
  );
}
