import {
  DilutionDisplayConfig,
  DilutionTypeEnum,
  InstrumentRunConfigurationDto,
  InstrumentType,
  RunConfiguration,
  SampleTypeDto,
} from "@viewpoint/api";
import { useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import styled from "styled-components";
import { Link } from "@viewpoint/spot-react";
import {
  DilutionModal,
  InformationalDilutionModal,
} from "../dilution/DilutionModal";
import { RunConfigToggle } from "../RunConfigToggle";
import { getRunConfigType } from "../run-config-utils";
import {
  ExclusiveRunConfigTypes,
  RunConfigHeaderLabel,
} from "../RunConfigHeaderLabel";
import { ConfirmModal } from "../../confirm-modal/ConfirmModal";
import { CommonTransComponents } from "../../../utils/i18n-utils";
import AutomatedDilutionInstructionsImage from "../../../assets/catone/dilution/AutomatedInstructions.png";
import ManualDilutionInstructionsImage from "../../../assets/catone/dilution/ManualInstructions.png";
import UpcInstructionsImage from "../../../assets/catone/dilution/UpcInstructions.png";

interface CatOneRunConfigurationPanelProps {
  currentConfig?: InstrumentRunConfigurationDto;
  defaultConfig: Omit<InstrumentRunConfigurationDto, "sampleTypeId">;
  onConfigurationChanged: (
    config: Omit<InstrumentRunConfigurationDto, "sampleTypeId">
  ) => void;
  dilutionDisplayConfig: DilutionDisplayConfig;
  sampleTypes: SampleTypeDto[];
}

const InstructionsModalBody = styled.div`
  ol {
    margin: 0;
    padding-left: 16px;
    li {
      margin-bottom: 8px;
    }
  }
`;

const InstructionsLink = styled(Link)`
  margin: 8px 0;
`;

const ImageHeader = styled.p`
  margin-top: 0;
`;

const ImageContainer = styled.div`
  margin: 4px 0;
  max-width: 480px;
  img {
    width: 100%;
  }
`;

export function CatOneRunConfigurationPanel(
  props: CatOneRunConfigurationPanelProps
) {
  const selectedConfig = getRunConfigType(props.currentConfig ?? {});

  const [dilutionModalVisible, setDilutionModalVisible] = useState(false);
  const [upcModalVisible, setUpcModalVisible] = useState(false);
  const [dilutionInstructionsModal, setDilutionInstructionsModal] =
    useState<DilutionTypeEnum>();

  const { t } = useTranslation();
  const { [DilutionTypeEnum.UPCAUTOMATIC]: upcConfig, ...dilutionConfig } =
    props.dilutionDisplayConfig;

  function handleToggle(type?: ExclusiveRunConfigTypes) {
    if (type === selectedConfig) {
      props.onConfigurationChanged({
        ...props.defaultConfig,
      });
    } else if (type === RunConfiguration.DILUTION) {
      props.onConfigurationChanged({
        ...props.defaultConfig,
      });
      setDilutionModalVisible(true);
    } else if (type === RunConfiguration.UPC) {
      props.onConfigurationChanged({
        ...props.defaultConfig,
        dilutionType: DilutionTypeEnum.UPCAUTOMATIC,
        dilution: (upcConfig?.[0] ?? 0) + 1,
      });
    }
  }

  return (
    <>
      <RunConfigToggle
        onToggleChange={handleToggle}
        toggleKeys={[RunConfiguration.DILUTION, RunConfiguration.UPC]}
        selectedToggle={selectedConfig}
        getToggleLabel={(key: ExclusiveRunConfigTypes) =>
          t(`orderFulfillment.runConfig.${key}.toggle`)
        }
      />
      {selectedConfig != null && (
        <RunConfigHeaderLabel
          iconName={
            selectedConfig === RunConfiguration.DILUTION ? "edit" : "info-2"
          }
          runConfigType={selectedConfig}
          onClick={() => {
            if (selectedConfig === RunConfiguration.DILUTION) {
              setDilutionModalVisible(true);
            } else if (selectedConfig === RunConfiguration.UPC) {
              setUpcModalVisible(true);
            }
          }}
          config={props.currentConfig}
          sampleTypes={props.sampleTypes}
        />
      )}

      {(selectedConfig === RunConfiguration.DILUTION ||
        selectedConfig === RunConfiguration.UPC) && (
        <InstructionsLink
          onClick={() =>
            setDilutionInstructionsModal(props.currentConfig?.dilutionType)
          }
        >
          {t("general.buttons.instructions")}
        </InstructionsLink>
      )}
      {dilutionModalVisible && (
        <DilutionModal
          open
          onClose={() => setDilutionModalVisible(false)}
          onSave={(config) => {
            props.onConfigurationChanged({
              ...props.defaultConfig,
              dilution: config?.dilution,
              dilutionType: config?.dilutionType,
            });
            setDilutionModalVisible(false);
          }}
          onInstructions={(config) =>
            setDilutionInstructionsModal(config?.dilutionType)
          }
          instrumentType={InstrumentType.CatalystOne}
          dilutionDisplayConfig={dilutionConfig}
          initialConfig={props.currentConfig}
        />
      )}
      {upcModalVisible && (
        <InformationalDilutionModal
          open
          onClose={() => setUpcModalVisible(false)}
          onSave={(config) => {
            props.onConfigurationChanged({
              ...props.defaultConfig,
              dilution: config?.dilution,
              dilutionType: config?.dilutionType,
            });
            setUpcModalVisible(false);
          }}
          onInstructions={(config) =>
            setDilutionInstructionsModal(config?.dilutionType)
          }
          instrumentType={InstrumentType.CatalystOne}
          dilutionDisplayConfig={{
            [DilutionTypeEnum.UPCAUTOMATIC]: upcConfig,
            defaultType: DilutionTypeEnum.UPCAUTOMATIC,
          }}
        />
      )}

      {dilutionInstructionsModal === DilutionTypeEnum.AUTOMATIC && (
        <ConfirmModal
          open
          headerContent={t(
            "orderFulfillment.runConfig.catOne.automaticDilutionInstructions.title"
          )}
          secondaryHeaderContent={t("instruments.names.CATONE")}
          onClose={() => setDilutionInstructionsModal(undefined)}
          onConfirm={() => setDilutionInstructionsModal(undefined)}
          bodyContent={
            <InstructionsModalBody>
              <ImageHeader>
                {t(
                  "orderFulfillment.runConfig.catOne.manualDilutionInstructions.body"
                )}
              </ImageHeader>
              <ImageContainer>
                <img src={AutomatedDilutionInstructionsImage}></img>
              </ImageContainer>
              <Trans
                i18nKey={
                  "orderFulfillment.runConfig.catOne.automaticDilutionInstructions.instructions"
                }
                components={CommonTransComponents}
              />
            </InstructionsModalBody>
          }
          confirmButtonContent={t("general.buttons.ok")}
        />
      )}

      {dilutionInstructionsModal === DilutionTypeEnum.MANUAL && (
        <ConfirmModal
          open
          headerContent={t(
            "orderFulfillment.runConfig.catOne.manualDilutionInstructions.title"
          )}
          secondaryHeaderContent={t("instruments.names.CATONE")}
          onClose={() => setDilutionInstructionsModal(undefined)}
          onConfirm={() => setDilutionInstructionsModal(undefined)}
          bodyContent={
            <InstructionsModalBody>
              <ImageHeader>
                {t(
                  "orderFulfillment.runConfig.catOne.manualDilutionInstructions.body"
                )}
              </ImageHeader>
              <ImageContainer>
                <img src={ManualDilutionInstructionsImage}></img>
              </ImageContainer>
              <Trans
                i18nKey={
                  "orderFulfillment.runConfig.catOne.manualDilutionInstructions.instructions"
                }
                components={CommonTransComponents}
              />
            </InstructionsModalBody>
          }
          confirmButtonContent={t("general.buttons.ok")}
        />
      )}

      {dilutionInstructionsModal === DilutionTypeEnum.UPCAUTOMATIC && (
        <ConfirmModal
          open
          headerContent={t(
            "orderFulfillment.runConfig.catOne.upcInstructions.title"
          )}
          secondaryHeaderContent={t("instruments.names.CATONE")}
          onClose={() => setDilutionInstructionsModal(undefined)}
          onConfirm={() => setDilutionInstructionsModal(undefined)}
          bodyContent={
            <InstructionsModalBody>
              <Trans
                i18nKey={
                  "orderFulfillment.runConfig.catOne.upcInstructions.instructions"
                }
                components={CommonTransComponents}
              />
              <ImageContainer>
                <img src={UpcInstructionsImage}></img>
              </ImageContainer>
            </InstructionsModalBody>
          }
          confirmButtonContent={t("general.buttons.ok")}
        />
      )}
    </>
  );
}
