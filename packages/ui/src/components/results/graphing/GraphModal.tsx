import styled from "styled-components";
import { ResponsiveModalWrapper } from "../../modal/ResponsiveModalWrapper";
import { DarkTheme } from "../../../utils/StyleConstants";
import { Modal, Select, SpotText } from "@viewpoint/spot-react";
import { Paginator } from "../../image-viewer/Paginator";
import { useCallback, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { getLocalizedAssayName } from "../result-utils";
import { CommonTransComponents } from "../../../utils/i18n-utils";
import { GraphTimeframe, useGraphData } from "./graph-components";
import { AnalyteLineGraph } from "../../graphing/AnalyteLineGraph";
import {
  GraphParams,
  useResultColorsForTheme,
} from "../../../context/ResultsPageContext";
import SpinnerOverlay from "../../overlay/SpinnerOverlay";
import { SpotIcon } from "@viewpoint/spot-icons";
import classNames from "classnames";

const ModalWrapper = styled(ResponsiveModalWrapper)`
  .spot-modal {
    max-width: 920px;
    width: 920px;
    height: 690px;
  }

  .spot-modal__titles {
    width: 100%;
  }
`;

const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

const BodyContent = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const GraphContainer = styled.div`
  display: grid;
  grid-template-columns: 40px 1fr 40px;
  align-items: center;
  column-gap: 16px;

  > .spot-icon {
    fill: ${DarkTheme.colors?.text?.primary};
  }

  > .spot-icon.disabled {
    fill: ${DarkTheme.colors?.text?.disabled};
    pointer-events: none;
  }

  > .spot-icon:active {
    opacity: 0.5;
  }
`;

const StyledSelect = styled(Select)`
  width: 250px;
`;

const StyledSpinnerOverlay = styled(SpinnerOverlay)`
  background-color: ${DarkTheme.colors?.background?.primary};
`;

export interface GraphModalProps {
  open: boolean;
  onClose: () => void;
  requestedGraphs: GraphParams[];
  initialGraphKey?: string;
}

export function GraphModal(props: GraphModalProps) {
  const [currentAssayIndex, setCurrentAssayIndex] = useState(
    props.initialGraphKey == null
      ? 0
      : props.requestedGraphs.findIndex(
          (params) => params.graphKey === props.initialGraphKey
        )
  );
  const [selectedTimeframe, setSelectedTimeframe] = useState<GraphTimeframe>(
    GraphTimeframe.All
  );
  const { t } = useTranslation();
  const colors = useResultColorsForTheme("Dark");

  const currentGraph = props.requestedGraphs[currentAssayIndex];
  const { data: graphData, isFetching } = useGraphData({
    graphParams: currentGraph,
    timeframe: selectedTimeframe,
  });

  const handleBack = useCallback(
    () => setCurrentAssayIndex((prev) => Math.max(0, prev - 1)),
    []
  );
  const handleNext = useCallback(
    () =>
      setCurrentAssayIndex((prev) =>
        Math.min(props.requestedGraphs.length - 1, prev + 1)
      ),
    [props.requestedGraphs.length]
  );

  return (
    <ModalWrapper className={DarkTheme.primaryContainerClass}>
      <Modal visible={props.open} onClose={props.onClose}>
        <Modal.Header onClose={props.onClose}>
          <HeaderContent>
            <SpotText level="h3">
              <Trans
                i18nKey={
                  `Assay.extended.${currentGraph.assayIdentityName}` as any
                }
                defaults={getLocalizedAssayName(
                  t,
                  currentGraph.assayIdentityName,
                  currentGraph.assayIdentityName
                )}
                components={CommonTransComponents}
              />
            </SpotText>
            <Paginator
              currentPage={currentAssayIndex}
              totalPages={props.requestedGraphs.length}
              onPageBack={handleBack}
              onPageForward={handleNext}
            />
          </HeaderContent>
        </Modal.Header>
        <Modal.Body>
          <BodyContent>
            <StyledSelect
              value={selectedTimeframe}
              onChange={(ev) =>
                setSelectedTimeframe(ev.target.value as GraphTimeframe)
              }
            >
              {Object.values(GraphTimeframe).map((timeframe) => (
                <Select.Option key={timeframe} value={timeframe}>
                  {t(`resultsPage.graphing.timeframe.${timeframe}`)}
                </Select.Option>
              ))}
            </StyledSelect>

            {isFetching && <StyledSpinnerOverlay />}
            <GraphContainer>
              <SpotIcon
                name="previous"
                size={36}
                className={classNames({
                  disabled: currentAssayIndex === 0,
                })}
                onClick={handleBack}
              />
              {graphData != null && (
                <AnalyteLineGraph
                  {...graphData}
                  darkMode
                  dotSize="large"
                  resultColors={colors}
                />
              )}
              <SpotIcon
                name="next"
                size={36}
                className={classNames({
                  disabled:
                    currentAssayIndex === props.requestedGraphs.length - 1,
                })}
                onClick={handleNext}
              />
            </GraphContainer>
          </BodyContent>
        </Modal.Body>
      </Modal>
    </ModalWrapper>
  );
}
