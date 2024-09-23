import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  DilutionDisplayConfig,
  InstrumentRunConfigurationDto,
  InstrumentType,
  RunConfiguration,
} from "@viewpoint/api";
import { DilutionModal } from "../dilution/DilutionModal";
import { RunConfigToggle } from "../RunConfigToggle";
import {
  ExclusiveRunConfigTypes,
  RunConfigHeaderLabel,
} from "../RunConfigHeaderLabel";

interface VetTestRunConfigurationPanelProps {
  currentConfig?: InstrumentRunConfigurationDto;
  defaultConfig: Omit<InstrumentRunConfigurationDto, "sampleTypeId">;
  onConfigurationChanged: (
    config: Omit<InstrumentRunConfigurationDto, "sampleTypeId">
  ) => void;
  dilutionDisplayConfig: DilutionDisplayConfig;
}

export function VetTestRunConfigurationPanel(
  props: VetTestRunConfigurationPanelProps
) {
  const [dilutionModalOpen, setDilutionModalOpen] = useState(false);
  const selectedConfig =
    props.currentConfig?.dilution != null && props.currentConfig.dilution > 1
      ? RunConfiguration.DILUTION
      : undefined;
  const { t } = useTranslation();

  function handleToggle(type?: ExclusiveRunConfigTypes) {
    if (type == selectedConfig) {
      props.onConfigurationChanged({ dilution: 1, dilutionType: undefined });
    } else if (type === RunConfiguration.DILUTION) {
      setDilutionModalOpen(true);
    }
  }

  return (
    <>
      <RunConfigToggle
        onToggleChange={handleToggle}
        toggleKeys={[RunConfiguration.DILUTION]}
        selectedToggle={selectedConfig}
        getToggleLabel={(key: ExclusiveRunConfigTypes) =>
          t(`orderFulfillment.runConfig.${key}.toggle`)
        }
      />
      {selectedConfig != null && (
        <RunConfigHeaderLabel
          iconName={
            selectedConfig === RunConfiguration.DILUTION ? "edit" : "help-2"
          }
          runConfigType={selectedConfig}
          onClick={() => setDilutionModalOpen(true)}
          config={props.currentConfig}
          sampleTypes={[]}
        />
      )}
      {dilutionModalOpen && (
        <DilutionModal
          open
          onClose={() => setDilutionModalOpen(false)}
          onSave={(config) => {
            props.onConfigurationChanged({
              ...props.defaultConfig,
              // NOTE - IVLS will throw an error if we specify a dilution type for VetTest, even if it's "MANUAL"
              dilution: config?.dilution,
            });
            setDilutionModalOpen(false);
          }}
          onInstructions={() => {}}
          instrumentType={InstrumentType.VetTest}
          dilutionDisplayConfig={props.dilutionDisplayConfig}
        />
      )}
    </>
  );
}
