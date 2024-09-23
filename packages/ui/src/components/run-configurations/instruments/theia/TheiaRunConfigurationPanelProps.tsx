import {
  ExecuteInstrumentRunDto,
  InstrumentDto,
  InstrumentRunConfigurationDto,
  SampleTypeDto,
} from "@viewpoint/api";

export interface TheiaRunConfigurationPanelProps {
  run: ExecuteInstrumentRunDto;
  onConfigChange: (changes: Partial<InstrumentRunConfigurationDto>[]) => void;
  sampleTypes: SampleTypeDto[];
  currentConfig: InstrumentRunConfigurationDto;
}
