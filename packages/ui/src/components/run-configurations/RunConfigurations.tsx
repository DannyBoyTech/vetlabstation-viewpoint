import {
  DilutionDisplayConfig,
  ExecuteInstrumentRunDto,
  InstrumentDto,
  InstrumentRunConfigurationDto,
  InstrumentType,
  RunConfiguration,
  SampleTypeDto,
  SpeciesType,
} from "@viewpoint/api";
import styled from "styled-components";
import { SampleTypeConfiguration } from "./SampleTypeConfiguration";
import { CatOneRunConfigurationPanel } from "./instruments/CatOneRunConfigurationPanel";
import { VetTestRunConfigurationPanel } from "./instruments/VetTestRunConfigurationPanel";
import { SediVueRunConfigurationPanel } from "./instruments/SediVueRunConfigurationPanel";
import { TheiaRunConfigurationPanel } from "./instruments/theia/TheiaRunConfigurationPanel";
import { ProCyteDxRunConfigurationPanel } from "./instruments/ProCyteDxRunConfigurationPanel";
import { TenseiRunConfigurationPanel } from "./instruments/TenseiRunConfigurationPanel";

const ConfigContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin: 8px 4px 2px 4px;
  gap: 8px;
`;

/**
 * Run Configuration panel for a given instrument. Supports multiple queued instances of the same instrument.
 * Queued runs are indicated via index number
 */
export interface RunConfigurationProps {
  instrument: InstrumentDto;
  speciesType: SpeciesType;
  runRequest: ExecuteInstrumentRunDto;
  defaultRunConfiguration?: InstrumentRunConfigurationDto;
  sampleTypes?: SampleTypeDto[];
  onConfigurationChanged?: (
    runQueueId: number,
    configurations?: InstrumentRunConfigurationDto[]
  ) => void;
  dilutionDisplayConfig?: DilutionDisplayConfig;
}

export function RunConfigurationPanel(props: RunConfigurationProps) {
  const selectedRun = props.runRequest;
  const selectedConfig = selectedRun?.instrumentRunConfigurations[0];
  const runQueueId = selectedRun?.runQueueId;

  const supportedConfigs = props.instrument.supportedRunConfigurations;

  const handleConfigChanged = (
    configUpdates: Partial<InstrumentRunConfigurationDto>[]
  ) => {
    props.onConfigurationChanged?.(
      runQueueId,
      configUpdates?.map((configUpdate) => ({
        ...selectedConfig,
        ...configUpdate,
      }))
    );
  };

  const { sampleTypeId: _, ...defaultRunConfig } =
    props.defaultRunConfiguration ?? {};

  return (
    <ConfigContainer>
      {supportedConfigs.includes(RunConfiguration.SAMPLE_TYPE) &&
        props.instrument.instrumentType !== InstrumentType.ProCyteDx &&
        props.instrument.instrumentType !== InstrumentType.Tensei &&
        props.instrument.instrumentType !== InstrumentType.Theia &&
        props.sampleTypes != null && (
          <SampleTypeConfiguration
            sampleTypes={props.sampleTypes}
            selectedSampleTypeId={selectedConfig?.sampleTypeId}
            onSampleTypeSelected={(st) =>
              handleConfigChanged([{ sampleTypeId: st?.id }])
            }
          />
        )}
      {props.instrument.instrumentType === InstrumentType.CatalystOne &&
        props.dilutionDisplayConfig && (
          <CatOneRunConfigurationPanel
            currentConfig={selectedConfig}
            dilutionDisplayConfig={props.dilutionDisplayConfig}
            defaultConfig={defaultRunConfig}
            onConfigurationChanged={(config) => handleConfigChanged([config])}
            sampleTypes={props.sampleTypes ?? []}
          />
        )}

      {props.instrument.instrumentType === InstrumentType.VetTest &&
        props.dilutionDisplayConfig && (
          <VetTestRunConfigurationPanel
            currentConfig={selectedConfig}
            dilutionDisplayConfig={props.dilutionDisplayConfig}
            defaultConfig={defaultRunConfig}
            onConfigurationChanged={(config) => handleConfigChanged([config])}
          />
        )}

      {props.instrument.instrumentType === InstrumentType.SediVueDx &&
        props.dilutionDisplayConfig && (
          <SediVueRunConfigurationPanel
            currentConfig={selectedConfig}
            speciesType={props.speciesType}
            dilutionDisplayConfig={props.dilutionDisplayConfig}
            defaultConfig={defaultRunConfig}
            onConfigurationChanged={(config) => handleConfigChanged([config])}
            sampleTypes={props.sampleTypes ?? []}
          />
        )}

      {props.instrument.instrumentType === InstrumentType.Theia &&
        selectedRun != null && (
          <TheiaRunConfigurationPanel
            run={selectedRun}
            currentConfig={selectedConfig}
            onConfigChange={handleConfigChanged}
            sampleTypes={props.sampleTypes ?? []}
          />
        )}

      {props.instrument.instrumentType === InstrumentType.ProCyteDx &&
        props.sampleTypes != null && (
          <ProCyteDxRunConfigurationPanel
            sampleTypes={props.sampleTypes}
            selectedSampleTypeId={selectedConfig?.sampleTypeId}
            onSampleTypeSelected={(st) =>
              handleConfigChanged([{ sampleTypeId: st?.id }])
            }
          />
        )}

      {props.instrument.instrumentType === InstrumentType.Tensei &&
        props.sampleTypes != null && (
          <TenseiRunConfigurationPanel
            sampleTypes={props.sampleTypes}
            selectedSampleTypeId={selectedConfig?.sampleTypeId}
            onSampleTypeSelected={(st) =>
              handleConfigChanged([{ sampleTypeId: st?.id }])
            }
          />
        )}
    </ConfigContainer>
  );
}
