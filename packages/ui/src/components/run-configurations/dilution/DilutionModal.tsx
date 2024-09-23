import { DilutionConfig, DilutionSelector } from "./DilutionSelector";
import { Button, Modal, SpotText } from "@viewpoint/spot-react";
import { BasicModal } from "../../basic-modal/BasicModal";
import {
  DilutionDisplayConfig,
  DilutionTypeEnum,
  InstrumentType,
  ValidDilutionType,
} from "@viewpoint/api";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { ResponsiveModalWrapper } from "../../modal/ResponsiveModalWrapper";
import styled from "styled-components";

const Content = styled.div`
  width: 400px;
`;

interface DilutionModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (config?: DilutionConfig) => void;
  onInstructions: (config?: DilutionConfig) => void;
  instrumentType: InstrumentType;
  dilutionDisplayConfig: DilutionDisplayConfig;
  initialConfig?: DilutionConfig;
}

export function getInitialDilutionConfig(
  initialConfig: DilutionConfig | undefined,
  displayConfig: DilutionDisplayConfig
) {
  const dilutionType =
    initialConfig?.dilutionType == null ||
    initialConfig.dilutionType === DilutionTypeEnum.NOTDEFINED
      ? displayConfig?.defaultType
      : initialConfig.dilutionType;

  return {
    dilutionType,
    // Dilution value is set to 1 even when dilution is not being performed
    dilution:
      initialConfig?.dilutionType == null ||
      initialConfig?.dilutionType === DilutionTypeEnum.NOTDEFINED
        ? (displayConfig[dilutionType]?.[0] ?? 1) + 1
        : initialConfig.dilution,
  };
}

export function DilutionModal(props: DilutionModalProps) {
  const [config, setConfig] = useState<DilutionConfig>(
    getInitialDilutionConfig(props.initialConfig, props.dilutionDisplayConfig)
  );

  const { t } = useTranslation();

  return (
    <ResponsiveModalWrapper>
      <BasicModal
        open={props.open}
        onClose={props.onClose}
        dismissable={false}
        headerContent={
          <>
            <SpotText level="h4" className="spot-modal__secondary-title">
              {t(`instruments.names.${props.instrumentType}`)}
            </SpotText>
            <SpotText level="h3" className="spot-modal__title">
              {t("orderFulfillment.runConfig.dilution.adjust")}
            </SpotText>
          </>
        }
        bodyContent={
          <Content>
            <DilutionSelector
              modifiable
              partsDiluentConfig={props.dilutionDisplayConfig}
              onDilutionChanged={(dilution) => setConfig(dilution)}
              totalParts={config.dilution ?? 2}
              dilutionType={config.dilutionType as ValidDilutionType}
            />
          </Content>
        }
        footerContent={
          <>
            <Modal.FooterCancelButton onClick={props.onClose}>
              {t("general.buttons.cancel")}
            </Modal.FooterCancelButton>

            <Button
              buttonType="secondary"
              onClick={() => props.onInstructions(config)}
            >
              {t("general.buttons.instructions")}
            </Button>
            <Button buttonType="primary" onClick={() => props.onSave(config)}>
              {t("general.buttons.save")}
            </Button>
          </>
        }
      />
    </ResponsiveModalWrapper>
  );
}

const RightAlignedButton = styled(Button)`
  && {
    margin-left: auto;
  }
`;

export function InformationalDilutionModal(props: DilutionModalProps) {
  const [config, setConfig] = useState<DilutionConfig>(
    getInitialDilutionConfig(props.initialConfig, props.dilutionDisplayConfig)
  );

  const { t } = useTranslation();

  return (
    <ResponsiveModalWrapper>
      <BasicModal
        open={props.open}
        onClose={props.onClose}
        headerContent={
          <>
            <SpotText level="h4" className="spot-modal__secondary-title">
              {t(`instruments.names.${props.instrumentType}`)}
            </SpotText>
            <SpotText level="h3" className="spot-modal__title">
              {props.dilutionDisplayConfig?.defaultType ===
              DilutionTypeEnum.UPCAUTOMATIC
                ? t("orderFulfillment.runConfig.dilution.upcDilution")
                : t("orderFulfillment.runConfig.dilution.adjust")}
            </SpotText>
          </>
        }
        bodyContent={
          <Content>
            <DilutionSelector
              modifiable={false}
              partsDiluentConfig={props.dilutionDisplayConfig}
              onDilutionChanged={(dilution) => setConfig(dilution)}
              totalParts={config.dilution ?? 2}
              dilutionType={config.dilutionType as ValidDilutionType}
            />
          </Content>
        }
        footerContent={
          <>
            <RightAlignedButton
              buttonType="secondary"
              onClick={() => props.onInstructions(config)}
            >
              {t("general.buttons.instructions")}
            </RightAlignedButton>
            <Button buttonType="primary" onClick={props.onClose}>
              {t("general.buttons.ok")}
            </Button>
          </>
        }
      />
    </ResponsiveModalWrapper>
  );
}
