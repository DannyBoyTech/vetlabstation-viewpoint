import { EarSwabRunConfigurationPanel } from "./ear/EarSwabRunConfigurationPanel";
import { BloodRunConfigurationPanel } from "./blood/BloodRunConfigurationPanel";
import { SampleTypeConfiguration } from "../../SampleTypeConfiguration";
import {
  BloodRunConfigurationDto,
  EarSwabRunConfigurationDto,
  FeatureFlagName,
  InstrumentRunConfigurationDto,
  SampleTypeDto,
  SampleTypeEnum,
  SampleTypesMapping,
  TheiaSampleLocation,
} from "@viewpoint/api";
import {
  HTMLAttributes,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { FnaConfigWorkflow } from "./fna/FnaConfigWorkflow";
import { FnaRunConfigurationPanel } from "./fna/FnaRunConfigurationPanel";
import { isFnaSampleType } from "./fna/fna-utils";
import { ConfirmModal } from "../../../confirm-modal/ConfirmModal";
import { useTranslation } from "react-i18next";
import { CommonMasks, MaskedInput } from "../../../input/MaskedInput";
import { InputAware } from "../../../InputAware";
import styled from "styled-components";
import { SpotIcon } from "@viewpoint/spot-icons";
import { useFeatureFlagQuery } from "../../../../api/FeatureFlagApi";
import { TheiaRunConfigurationPanelProps } from "./TheiaRunConfigurationPanelProps";
import { createEarSwabRunConfig, validEarSwabRun } from "./ear/ear-swab-utils";
import { BuildLabRequestContext } from "../../../../screens/order-fulfillment/BuildLabRequestContext";
import { useGetMatchingRunsQuery } from "../../../../api/TheiaApi";
import {
  BloodConfigWorkflowType,
  provideCleanedConfiguration,
  provideInitialConfiguration,
  validBloodRun,
} from "./blood/blood-common";
import { BloodConfigWorkflow } from "./blood/BloodConfigWorkflow";

const RemovableConfigContainer = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const RemovableConfigLeftContainer = styled.div`
  flex: 1;
`;

export function TheiaRunConfigurationPanel(
  props: TheiaRunConfigurationPanelProps
) {
  const [bloodConfigWorkflowType, setBloodConfigWorkflowType] =
    useState<BloodConfigWorkflowType>(BloodConfigWorkflowType.NONE);

  const [fnaWorkflowOpen, setFnaWorkflowOpen] = useState(false);
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);
  const { t } = useTranslation();

  const labRequestContext = useContext(BuildLabRequestContext);

  const { data: suggestions } = useGetMatchingRunsQuery(
    labRequestContext.patient.id
  );
  const { data: barcodeEntryEnabled } = useFeatureFlagQuery(
    FeatureFlagName.THEIA_BARCODE_ENTRY_ENABLED
  );

  const {
    onConfigChange,
    run: { instrumentRunConfigurations: allConfigs },
    run: executeRunRequest,
    currentConfig,
  } = props;

  // Handle sample type selection changes. Apply all "default" run configurations
  // that are based on sample type here
  const handleSampleTypeSelected = useCallback(
    (st: SampleTypeDto | undefined) => {
      // Apply default run configurations as soon as sample type is selected
      let updatedConfig: InstrumentRunConfigurationDto[] = [
        { sampleTypeId: st?.id },
      ];

      switch (st?.name) {
        case SampleTypeEnum.FNA:
          setFnaWorkflowOpen(true);
          break;
        case SampleTypeEnum.EAR_SWAB:
          // Ear swab requires 2 run configuration items
          updatedConfig = [
            {
              sampleTypeId: st?.id,
              earSwabRunConfiguration: createEarSwabRunConfig(
                TheiaSampleLocation.LEFT,
                false
              ),
            },
            {
              sampleTypeId: st?.id,
              earSwabRunConfiguration: createEarSwabRunConfig(
                TheiaSampleLocation.RIGHT,
                false
              ),
            },
          ];
          break;
        case SampleTypeEnum.BLOOD:
          // Get initial Blood type configuration based on suggested runs or
          // other instruments on the lab request
          const initialConfiguration = provideInitialConfiguration(
            suggestions || [],
            executeRunRequest,
            labRequestContext.originalLabRequest,
            labRequestContext.referenceData.availableInstruments || [],
            labRequestContext.labRequest.instrumentRunDtos || []
          );
          // If there is a valid initial configuration, apply it directly to the
          // run configurations
          if (initialConfiguration != null) {
            updatedConfig.forEach(
              (cfg) =>
                (cfg.bloodRunConfigurationDto = { ...initialConfiguration })
            );
          } else {
            // If not, prompt the user to follow the InVue blood configuration workflow
            setBloodConfigWorkflowType(BloodConfigWorkflowType.INITIAL);
          }
          break;
      }
      onConfigChange(updatedConfig);
    },
    [
      executeRunRequest,
      labRequestContext.labRequest.instrumentRunDtos,
      labRequestContext.originalLabRequest,
      labRequestContext.referenceData.availableInstruments,
      onConfigChange,
      suggestions,
    ]
  );

  const handleBloodRunConfigChange = useCallback(
    (bloodRunConfiguration: BloodRunConfigurationDto | undefined) => {
      onConfigChange([
        {
          ...currentConfig,
          bloodRunConfigurationDto: bloodRunConfiguration,
          fnaRunConfigurationDto: undefined,
          earSwabRunConfiguration: undefined,
        },
      ]);
    },
    [currentConfig, onConfigChange]
  );

  const handleEarSwabConfigChange = useCallback(
    (earSwabConfigChanges: EarSwabRunConfigurationDto[]) => {
      if (allConfigs?.length === 2) {
        // Find the corresponding left vs right config and updated appropriately
        onConfigChange(
          allConfigs.map((cfg) => ({
            ...cfg,
            earSwabRunConfiguration: earSwabConfigChanges.find(
              (c) =>
                c.theiaSampleLocation ===
                cfg.earSwabRunConfiguration?.theiaSampleLocation
            ),
          }))
        );
      } else {
        // Update to include 2 run configuration entries
        onConfigChange([
          {
            ...currentConfig,
            earSwabRunConfiguration: earSwabConfigChanges[0],
          },
          {
            ...currentConfig,
            earSwabRunConfiguration: earSwabConfigChanges[1],
          },
        ]);
      }
    },
    [allConfigs, currentConfig, onConfigChange]
  );

  const handleBarcodeChanged = useCallback(
    (barcode: string) => {
      onConfigChange(
        // Apply barcode to all available run configurations. For ear swab, there may be 2.
        allConfigs.map((cfg) => ({
          ...cfg,
          userBarcode: barcode?.length > 0 ? barcode : undefined,
        }))
      );
    },
    [allConfigs, onConfigChange]
  );

  // Since inVue Dx BLOOD "together" workflow requires a hema instrument to be
  // on the lab request with sample type blood, we need to react to changes made
  // to run configs on other instruments.
  useEffect(() => {
    if (
      props.currentConfig != null &&
      props.currentConfig.sampleTypeId === SampleTypesMapping.BLOOD
    ) {
      const cleanedConfiguration = provideCleanedConfiguration(
        props.currentConfig,
        labRequestContext.referenceData.availableInstruments || [],
        labRequestContext.labRequest.instrumentRunDtos || []
      );
      if (cleanedConfiguration != null) {
        handleBloodRunConfigChange(cleanedConfiguration);
      }
    }
  }, [
    handleBloodRunConfigChange,
    labRequestContext.labRequest.instrumentRunDtos,
    labRequestContext.referenceData.availableInstruments,
    props.currentConfig,
  ]);

  return (
    <>
      <SampleTypeConfiguration
        sampleTypes={props.sampleTypes}
        selectedSampleTypeId={currentConfig?.sampleTypeId}
        onSampleTypeSelected={handleSampleTypeSelected}
      />

      {validEarSwabRun(props.run) && (
        <EarSwabRunConfigurationPanel
          run={props.run}
          currentEarSwabConfigs={
            allConfigs
              ?.map((cfg) => cfg.earSwabRunConfiguration)
              .filter((cfg) => cfg != null) as EarSwabRunConfigurationDto[]
          }
          onEarSwabConfigChanged={handleEarSwabConfigChange}
        />
      )}

      {validBloodRun(props.run) && suggestions != null && (
        <BloodRunConfigurationPanel
          suggestions={suggestions}
          currentConfig={props.currentConfig}
          availableInstruments={
            labRequestContext.referenceData.availableInstruments || []
          }
          instrumentRunDtos={
            labRequestContext.labRequest.instrumentRunDtos || []
          }
          onConfigStart={() => {
            setBloodConfigWorkflowType(BloodConfigWorkflowType.INITIAL);
          }}
          onCbcEdit={() => {
            setBloodConfigWorkflowType(BloodConfigWorkflowType.CBC);
          }}
          handleRunConfigChange={handleBloodRunConfigChange}
        />
      )}

      {isFnaSampleType(props.run) && (
        <FnaRunConfigurationPanel onEdit={() => setFnaWorkflowOpen(true)} />
      )}

      {barcodeEntryEnabled && (
        <RemovableConfigContainer>
          <RemovableConfigLeftContainer>
            <InputAware layout={"numpad"}>
              <MaskedInput
                value={currentConfig.userBarcode ?? ""}
                onAccept={handleBarcodeChanged}
                mask={CommonMasks.DIGITS}
                placeholder={t(
                  "orderFulfillment.runConfig.inVueDx.barcodePlaceholder"
                )}
              />
            </InputAware>
          </RemovableConfigLeftContainer>

          <ClearButton
            onClick={() => {
              props.onConfigChange([
                { ...currentConfig, userBarcode: undefined },
              ]);
            }}
          />
        </RemovableConfigContainer>
      )}

      {bloodConfigWorkflowType != BloodConfigWorkflowType.NONE && (
        <BloodConfigWorkflow
          bloodConfigWorkflowType={bloodConfigWorkflowType}
          handleBloodConfigWorkflowTypeChange={setBloodConfigWorkflowType}
          suggestions={suggestions || []}
          currentConfig={props.currentConfig}
          availableInstruments={
            labRequestContext.referenceData.availableInstruments || []
          }
          instrumentRunDtos={
            labRequestContext.labRequest.instrumentRunDtos || []
          }
          handleAddInstrument={labRequestContext.addExecuteRun}
          handleRunConfigChange={handleBloodRunConfigChange}
          onClose={() =>
            setBloodConfigWorkflowType(BloodConfigWorkflowType.NONE)
          }
        />
      )}

      {fnaWorkflowOpen && (
        <FnaConfigWorkflow
          open
          initialConfig={currentConfig.fnaRunConfigurationDto}
          onClose={() => {
            setConfirmCancelOpen(true);
          }}
          onSave={(fnaConfig) => {
            props.onConfigChange([
              {
                ...currentConfig,
                fnaRunConfigurationDto: fnaConfig,
              },
            ]);
            setFnaWorkflowOpen(false);
          }}
        />
      )}
      {confirmCancelOpen && (
        <ConfirmModal
          open
          onClose={() => setConfirmCancelOpen(false)}
          onConfirm={() => {
            setConfirmCancelOpen(false);
            setFnaWorkflowOpen(false);
            if (currentConfig.fnaRunConfigurationDto == null) {
              props.onConfigChange([
                { ...currentConfig, sampleTypeId: undefined },
              ]);
            }
          }}
          headerContent={t(
            "orderFulfillment.runConfig.inVueDx.fna.confirmCancel.title"
          )}
          bodyContent={t(
            "orderFulfillment.runConfig.inVueDx.fna.confirmCancel.body"
          )}
          confirmButtonContent={t("general.buttons.yes")}
          cancelButtonContent={t("general.buttons.no")}
        />
      )}
    </>
  );
}

const ClearButtonRoot = styled.div`
  > .spot-icon {
    fill: ${(p) => p.theme.colors?.interactive?.primary};
  }

  > .spot-icon:active {
    opacity: 0.5;
  }
`;

function ClearButton(props: HTMLAttributes<HTMLDivElement>) {
  return (
    <ClearButtonRoot {...props}>
      <SpotIcon name="close" />
    </ClearButtonRoot>
  );
}
