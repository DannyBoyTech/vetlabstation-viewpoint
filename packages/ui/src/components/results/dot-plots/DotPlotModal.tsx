import { ImageModalWrapper } from "../../image-modal/ImageModalWrapper";
import {
  DotPlotApiLegendItem,
  DotPlotNodeDataResponse,
  InstrumentType,
  PatientDto,
  ScattergramType,
  SpeciesType,
} from "@viewpoint/api";
import { Modal, SpotText } from "@viewpoint/spot-react";
import { LocalizedPatientSignalment } from "../../localized-signalment/LocalizedPatientSignalment";
import { useTranslation } from "react-i18next";
import { FullSizeSpinner } from "../../spinner/FullSizeSpinner";
import { useFormatShortDate } from "../../../utils/hooks/datetime";
import styled from "styled-components";
import { DotPlotGraph, Legend } from "./DotPlotGraph";
import { SpotIcon } from "@viewpoint/spot-icons";
import { useCallback, useContext, useRef, useState } from "react";
import { ViewpointThemeContext } from "../../../context/ThemeContext";
import { SpotPopover } from "../../popover/Popover";
import { getDotPlotReferenceImage } from "../../../utils/dot-plot-utils";
import { DarkTheme } from "../../../utils/StyleConstants";

export interface DotPlotModalProps {
  visible: boolean;
  onClose: () => void;
  patient: PatientDto;
  speciesType: SpeciesType;
  instrumentType: InstrumentType;
  metadata?: DotPlotNodeDataResponse;
}

export const TestId = {
  Modal: "dot-plot-modal",
  Graph: (type: ScattergramType) => `dot-plot-modal-${type}-graph`,
};

export function DotPlotModal(props: DotPlotModalProps) {
  const [infoOpen, setInfoOpen] = useState(false);

  const { t } = useTranslation();
  const { theme } = useContext(ViewpointThemeContext);
  const formatDate = useFormatShortDate();

  const onClose = useCallback(() => {
    setInfoOpen(false);
    props.onClose();
  }, [setInfoOpen, props.onClose]);

  return (
    <ImageModalWrapper
      visible={props.visible}
      className={DarkTheme.primaryContainerClass}
    >
      <Modal
        visible={props.visible}
        onClose={onClose}
        data-testid={TestId.Modal}
      >
        <Modal.Header onClose={onClose}>
          <LocalizedPatientSignalment size="small" patient={props.patient} />
        </Modal.Header>

        <Modal.Body>
          {props.metadata ? (
            <Content>
              <SpotText level="h3">
                {t(`dotPlots.labels.runType.${props.metadata.scattergramType}`)}
              </SpotText>
              <SpotText level="tertiary">
                {formatDate(props.metadata.dateCreated)}
              </SpotText>
              <DotPlotGraph
                data-testid={TestId.Graph(props.metadata.scattergramType)}
                theme={theme.getOppositeTheme()}
                imageUrl={props.metadata.imageUrl}
                xAxisLabel={t(
                  `dotPlots.labels.axis.${props.metadata.axisX}` as any
                )}
                yAxisLabel={t(
                  `dotPlots.labels.axis.${props.metadata.axisY}` as any
                )}
                width="500px"
                labelLevel="h3"
              />

              <Footer
                infoOpen={infoOpen}
                setInfoOpen={setInfoOpen}
                referenceGraphUrl={getDotPlotReferenceImage(
                  props.instrumentType,
                  props.speciesType,
                  props.metadata.scattergramType,
                  props.metadata.sampleType
                )}
                legend={props.metadata.legend}
                type={props.metadata.scattergramType}
                speciesType={props.speciesType}
              />
            </Content>
          ) : (
            <FullSizeSpinner />
          )}
        </Modal.Body>
      </Modal>
    </ImageModalWrapper>
  );
}

interface FooterProps {
  infoOpen: boolean;
  setInfoOpen: (open: boolean) => void;
  referenceGraphUrl?: string;
  legend: DotPlotApiLegendItem[];
  type: ScattergramType;
  speciesType: SpeciesType;
}

const InfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const LegendContainer = styled.div`
  background-color: white;
  padding: 5px;
`;

function Footer(props: FooterProps) {
  const { t } = useTranslation();
  const iconRef = useRef<HTMLDivElement | null>(null);
  return (
    <FooterContainer>
      <IconContainer>
        <div ref={iconRef} onClick={() => props.setInfoOpen(!props.infoOpen)}>
          <SpotIcon name="info-2" size={30} color="white" />
        </div>
        {props.infoOpen && (
          <SpotPopover
            anchor={iconRef.current}
            popFrom="top"
            onClickAway={() => props.setInfoOpen(false)}
          >
            <InfoContainer>
              {props.referenceGraphUrl && (
                <>
                  <SpotText level="tertiary">
                    {t("dotPlots.labels.normalRun", { type: props.type })}
                  </SpotText>
                  <SpotText level="tertiary">
                    ({t(`Species.${props.speciesType}` as any)})
                  </SpotText>
                  <DotPlotGraph
                    imageUrl={props.referenceGraphUrl}
                    width={"200px"}
                    labelLevel="tertiary"
                  />
                </>
              )}
              <SpotText level="tertiary">
                {t("dotPlots.labels.legend")}
              </SpotText>
              <LegendContainer>
                <Legend legend={props.legend} columnCount={2} />
              </LegendContainer>
            </InfoContainer>
          </SpotPopover>
        )}
      </IconContainer>
    </FooterContainer>
  );
}

const FooterContainer = styled.div`
  display: flex;
  width: 100%;
`;

const IconContainer = styled.div`
  margin-left: auto;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
  width: 700px;
`;
