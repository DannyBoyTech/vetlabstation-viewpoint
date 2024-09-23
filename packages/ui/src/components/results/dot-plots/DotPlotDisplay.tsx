import styled from "styled-components";
import {
  DotPlotNodeDataResponse,
  InstrumentType,
  ScattergramType,
  SpeciesType,
} from "@viewpoint/api";
import { SpotText } from "@viewpoint/spot-react";
import { useTranslation } from "react-i18next";
import { useMemo } from "react";
import { DotPlotGraph, Legend } from "./DotPlotGraph";
import { getDotPlotReferenceImage } from "../../../utils/dot-plot-utils";

const DotPlotDisplayRoot = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
`;

const GraphsContainer = styled.div`
  display: flex;
  gap: 20px;
`;

const PatientGraphContainer = styled.div`
  flex: 3;
  display: flex;
`;

const NormalGraphContainer = styled.div`
  flex: 2;
`;

const LegendContainer = styled.div`
  display: flex;
`;

export interface DotPlotDisplayProps {
  onClickImage: () => void;
  metadata: DotPlotNodeDataResponse;
  instrumentType: InstrumentType;
  speciesType: SpeciesType;
}

export const TestId = {
  Graph: (type: ScattergramType) => `dot-plot-${type}-graph`,
  ReferenceGraph: (type: ScattergramType) => `dot-plot-${type}-reference-graph`,
};

export function DotPlotDisplay(props: DotPlotDisplayProps) {
  const { t } = useTranslation();
  const dotPlotReferenceImage = useMemo(
    () =>
      getDotPlotReferenceImage(
        props.instrumentType,
        props.speciesType,
        props.metadata.scattergramType,
        props.metadata.sampleType
      ),
    [
      props.instrumentType,
      props.speciesType,
      props.metadata.scattergramType,
      props.metadata.sampleType,
    ]
  );
  return (
    <DotPlotDisplayRoot>
      <GraphsContainer onClick={props.onClickImage}>
        <PatientGraphContainer>
          <DotPlotGraph
            data-testid={TestId.Graph(props.metadata.scattergramType)}
            bordered
            imageUrl={props.metadata.imageUrl}
            xAxisLabel={t(
              `dotPlots.labels.axis.${props.metadata.axisX}` as any
            )}
            yAxisLabel={t(
              `dotPlots.labels.axis.${props.metadata.axisY}` as any
            )}
          />
        </PatientGraphContainer>
        <NormalGraphContainer>
          {dotPlotReferenceImage && (
            <NormalDotPlotGraph
              data-testid={TestId.ReferenceGraph(
                props.metadata.scattergramType
              )}
              type={props.metadata.scattergramType}
              speciesType={props.speciesType}
              imageUrl={dotPlotReferenceImage}
            />
          )}
        </NormalGraphContainer>
      </GraphsContainer>

      <SpotText level="tertiary">{t("dotPlots.labels.patientRun")}</SpotText>

      <LegendContainer>
        <Legend legend={props.metadata.legend} columnCount={4} />
      </LegendContainer>
    </DotPlotDisplayRoot>
  );
}

interface NormalDotPlotGraphProps {
  type: string;
  speciesType?: SpeciesType;
  imageUrl: string;
  ["data-testid"]?: string;
}

function NormalDotPlotGraph(props: NormalDotPlotGraphProps) {
  const { t } = useTranslation();
  return (
    <>
      <DotPlotGraph
        imageUrl={props.imageUrl}
        data-testid={props["data-testid"]}
        bordered
      />
      <SpotText level="tertiary">
        {t("dotPlots.labels.normalRun", {
          type: props.type,
        })}
      </SpotText>
      <SpotText level="tertiary">
        ({t(`Species.${props.speciesType}` as any)})
      </SpotText>
    </>
  );
}
