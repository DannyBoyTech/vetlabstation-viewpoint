import { useEffect, useMemo, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import {
  DilutionDisplayConfig,
  InstrumentRunConfigurationDto,
  InstrumentType,
  RunConfiguration,
  SampleTypeDto,
  SampleTypeEnum,
  SpeciesType,
  TestProtocolEnum,
} from "@viewpoint/api";
import { Button, Link, SpotText } from "@viewpoint/spot-react";
import styled from "styled-components";
import { Theme } from "../../../utils/StyleConstants";
import { DilutionModal } from "../dilution/DilutionModal";
import { SpotIconName } from "@viewpoint/spot-icons/src";
import { RunConfigToggle } from "../RunConfigToggle";
import { ConfirmModal } from "../../confirm-modal/ConfirmModal";
import { CommonTransComponents } from "../../../utils/i18n-utils";
import { getRunConfigType } from "../run-config-utils";
import {
  ExclusiveRunConfigTypes,
  RunConfigHeaderLabel,
} from "../RunConfigHeaderLabel";

const VALID_BACTERIA_REFLEX_SPECIES = [SpeciesType.Canine, SpeciesType.Feline];
const VALIDATED_URINE_SPECIES = [SpeciesType.Canine, SpeciesType.Feline];

const WarningText = styled(SpotText)`
  && {
    color: ${(p: { theme: Theme }) => p.theme.colors?.feedback?.error};
  }
`;

const InstructionsLink = styled(Link)`
  margin-top: 8px;
`;

const InstructionsModalBody = styled.div`
  ol {
    margin: 0;

    li {
      margin-bottom: 12px;
    }
  }
`;

const BacteriaInstructionsLink = styled(Link)`
  margin-top: 8px;
`;

interface SediVueRunConfigurationPanelProps {
  currentConfig?: InstrumentRunConfigurationDto;
  defaultConfig: Omit<InstrumentRunConfigurationDto, "sampleTypeId">;
  onConfigurationChanged: (
    config: Omit<InstrumentRunConfigurationDto, "sampleTypeId">
  ) => void;
  dilutionDisplayConfig: DilutionDisplayConfig;
  sampleTypes: SampleTypeDto[];
  speciesType: SpeciesType;
}

const ICONS: { [key in RunConfiguration]?: SpotIconName } = {
  [RunConfiguration.DILUTION]: "edit",
  [RunConfiguration.UPC]: "help-2",
};

export function SediVueRunConfigurationPanel(
  props: SediVueRunConfigurationPanelProps
) {
  const selectedConfig = getRunConfigType(props.currentConfig ?? {});

  const [dilutionModalOpen, setDilutionModalOpen] = useState(false);
  const [dilutionInstructionsOpen, setDilutionInstructionsOpen] =
    useState(false);
  const [bacteriaInstructionsOpen, setBacteriaInstructionsOpen] =
    useState(false);
  const { t } = useTranslation();

  const currentSampleType = useMemo(
    () =>
      props.sampleTypes.find(
        (st) => st.id === props.currentConfig?.sampleTypeId
      ),
    [props.currentConfig?.sampleTypeId, props.sampleTypes]
  );

  // Bacteria reflex not supported for non-urine samples
  const toggleKeys: ExclusiveRunConfigTypes[] =
    currentSampleType?.name === SampleTypeEnum.URINE &&
    VALID_BACTERIA_REFLEX_SPECIES.includes(props.speciesType)
      ? [RunConfiguration.DILUTION, RunConfiguration.BACTERIA_REFLEX]
      : [RunConfiguration.DILUTION];

  function handleToggle(type?: ExclusiveRunConfigTypes) {
    if (type === selectedConfig) {
      props.onConfigurationChanged({ ...props.defaultConfig });
    } else if (type === RunConfiguration.DILUTION) {
      setDilutionModalOpen(true);
    } else if (type === RunConfiguration.BACTERIA_REFLEX) {
      props.onConfigurationChanged({
        ...props.defaultConfig,
        testProtocol: TestProtocolEnum.BACTERIALREFLEX,
      });
    }
  }

  const { onConfigurationChanged, currentConfig } = props;
  useEffect(() => {
    if (
      currentConfig !== undefined &&
      currentSampleType?.name !== SampleTypeEnum.URINE &&
      selectedConfig === RunConfiguration.BACTERIA_REFLEX
    ) {
      // Remove bacteria reflex -- only supported with urine sample type
      onConfigurationChanged({
        ...currentConfig,
        testProtocol: TestProtocolEnum.FULLANALYSIS,
      });
    }
  }, [
    currentConfig,
    selectedConfig,
    currentSampleType?.name,
    onConfigurationChanged,
  ]);

  const sampleTypeValid =
    currentSampleType?.name === SampleTypeEnum.URINE &&
    VALIDATED_URINE_SPECIES.includes(props.speciesType);

  return (
    <div>
      {props.currentConfig?.sampleTypeId != null && !sampleTypeValid && (
        <WarningText level="tertiary">
          {t("orderFulfillment.runConfig.fluidTypeNotValidated")}
        </WarningText>
      )}
      <RunConfigToggle
        onToggleChange={handleToggle}
        toggleKeys={toggleKeys}
        selectedToggle={selectedConfig}
        getToggleLabel={(key: ExclusiveRunConfigTypes) =>
          t(`orderFulfillment.runConfig.${key}.toggle`)
        }
      />
      {selectedConfig != null && (
        <RunConfigHeaderLabel
          iconName={ICONS[selectedConfig]}
          runConfigType={selectedConfig}
          onClick={() => {
            if (selectedConfig === RunConfiguration.DILUTION) {
              setDilutionModalOpen(true);
            }
          }}
          config={props.currentConfig}
          sampleTypes={props.sampleTypes}
        />
      )}
      {selectedConfig === RunConfiguration.DILUTION && (
        <InstructionsLink onClick={() => setDilutionInstructionsOpen(true)}>
          {t("general.buttons.instructions")}
        </InstructionsLink>
      )}
      {selectedConfig === RunConfiguration.BACTERIA_REFLEX && (
        <>
          <BacteriaInstructionsLink
            onClick={() => setBacteriaInstructionsOpen(true)}
          >
            {t("general.buttons.instructions")}
          </BacteriaInstructionsLink>
        </>
      )}
      {dilutionModalOpen && (
        <DilutionModal
          open
          onClose={() => setDilutionModalOpen(false)}
          onSave={(config) => {
            setDilutionModalOpen(false);
            props.onConfigurationChanged({
              ...props.defaultConfig,
              dilution: config?.dilution,
              dilutionType: config?.dilutionType,
            });
          }}
          initialConfig={props.currentConfig}
          onInstructions={() => setDilutionInstructionsOpen(true)}
          instrumentType={InstrumentType.SediVueDx}
          dilutionDisplayConfig={props.dilutionDisplayConfig}
        />
      )}
      {dilutionInstructionsOpen && (
        <ConfirmModal
          open
          headerContent={t(
            "orderFulfillment.runConfig.sediVueDx.dilutionInstructions.title"
          )}
          secondaryHeaderContent={t("instruments.names.URISED")}
          onClose={() => setDilutionInstructionsOpen(false)}
          onConfirm={() => setDilutionInstructionsOpen(false)}
          bodyContent={
            <InstructionsModalBody>
              <Trans
                i18nKey={
                  "orderFulfillment.runConfig.sediVueDx.dilutionInstructions.instructions"
                }
                components={CommonTransComponents}
              />
            </InstructionsModalBody>
          }
          confirmButtonContent={t("general.buttons.ok")}
        />
      )}
      {bacteriaInstructionsOpen && (
        <ConfirmModal
          open
          headerContent={t(
            "orderFulfillment.runConfig.BACTERIA_REFLEX.instructionsModalHeader"
          )}
          secondaryHeaderContent={t("instruments.names.URISED")}
          onClose={() => setBacteriaInstructionsOpen(false)}
          onConfirm={() => setBacteriaInstructionsOpen(false)}
          bodyContent={
            <InstructionsModalBody>
              <Trans
                i18nKey={
                  "orderFulfillment.runConfig.BACTERIA_REFLEX.instructionsModalBody"
                }
                components={CommonTransComponents}
              />
            </InstructionsModalBody>
          }
          confirmButtonContent={t("general.buttons.ok")}
        />
      )}
    </div>
  );
}
