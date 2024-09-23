import {
  InstrumentRunDto,
  InstrumentType,
  ServiceCategory,
  ServiceCategoryMappings,
} from "@viewpoint/api";
import styled from "styled-components";
import { Theme } from "../../utils/StyleConstants";
import { useCallback, useContext, useMemo, useState } from "react";
import { DotPlotResultTableContent } from "./dot-plots/DotPlotResultTableContent";
import { SnapDeviceResultTableContent } from "./snap/SnapDeviceResultTableContent";
import { SediVueResultTableContent } from "./svdx/SediVueResultTableContent";
import { DefaultResultTableContent } from "./default-components/DefaultResultTableContent";
import { TheiaResultTableContent } from "./theia/TheiaResultTableContent";
import {
  ResultTableContentProps,
  RunDivider,
  TestOrderResultIdentifier,
} from "./common-components/result-table-components";
import { Collapse } from "../collapse/Collapse";
import {
  ResultTableHeader,
  GraphTableHeader,
} from "./common-components/ResultTableHeader";
import { ServiceCategoryHeader } from "./common-components/ServiceCategoryHeader";
import { ViewpointResultsPageContext } from "../../context/ResultsPageContext";
import { GraphPanel } from "./graphing/graph-components";
import { GraphModal } from "./graphing/GraphModal";

const Root = styled.div`
  display: flex;
  margin-bottom: 15px;
`;

const ResultsContent = styled.div`
  display: flex;
`;

const ServiceCategoryTable = styled.div<{ $stretch: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 8px;
  background-color: ${(p: { theme: Theme }) =>
    p.theme.colors?.background?.primary};

  border: ${(p: { theme: Theme }) => p.theme.borders?.lightPrimary};

  border-radius: 5px;
  padding: 15px;
  margin-top: 8px;

  .spot-typography__text--secondary {
    color: ${(p: { theme: Theme }) => p.theme.colors?.text?.primary};
  }

  ${(p) => (p.$stretch ? "flex: 1;" : "")}
`;

export const TestId = {
  ResultTable: (category: ServiceCategory) => `results-table-${category}`,
  RunTable: (runId: number) => `run-table-${runId}`,
};

export interface ResultsTableProps {
  instrumentRuns: InstrumentRunDto[];
  serviceCategory: ServiceCategory;
  historicalRuns: Record<number, InstrumentRunDto[]>;
  expanded: boolean;
  onToggleExpanded: () => void;
}

export function ResultsTable(props: ResultsTableProps) {
  const [graphModalOpen, setGraphModalOpen] = useState(false);
  const [initialGraphKey, setInitialGraphKey] = useState<string>();
  // Sort and map runs as well as assay categories. Runs are sorted by service
  // category as well as display order, and assay categories are mapped to test order
  // and result IDs.
  const sortedMappedRuns = useMemo(
    () =>
      props.instrumentRuns
        .sort((runOne, runTwo) => runOne.displayOrder - runTwo.displayOrder)
        .map((run, index) => {
          const assayCategoryResultMappings = run.instrumentResultDtos?.reduce(
            (prev, curr) => {
              if (curr.category != null) {
                const testOrderIdentifiers = prev[curr.category] ?? [];
                if (
                  !testOrderIdentifiers.some(
                    (torId) => torId.testOrderId === curr.testOrderId
                  )
                ) {
                  testOrderIdentifiers.push({
                    testOrderId: curr.testOrderId,
                    resultId: curr.id,
                  });
                }
                prev[curr.category] = testOrderIdentifiers;
              }
              return prev;
            },
            {} as Record<string, TestOrderResultIdentifier[]>
          );
          return { run, assayCategoryResultMappings };
        }),
    [props.instrumentRuns]
  );

  const {
    record,
    labRequest,
    currentGraphingParams: allGraphingParams,
    resultsBeingGraphed,
    toggleGraphingForResult,
    clearGraphs,
  } = useContext(ViewpointResultsPageContext);

  const currentGraphingParams = useMemo(
    () =>
      allGraphingParams.filter(
        (gp) =>
          ServiceCategoryMappings[gp.instrumentType] === props.serviceCategory
      ),
    [allGraphingParams, props.serviceCategory]
  );

  const showGraphing = currentGraphingParams.length > 0;

  const titleCellContent = (
    <ServiceCategoryHeader
      serviceCategory={props.serviceCategory}
      expanded={props.expanded}
      onToggleExpanded={props.onToggleExpanded}
    />
  );

  return (
    <Root>
      <ServiceCategoryTable
        $stretch={showGraphing}
        data-testid={TestId.ResultTable(props.serviceCategory)}
      >
        {showGraphing ? (
          <GraphTableHeader
            run={sortedMappedRuns[0].run}
            titleCellContent={titleCellContent}
            onClear={() => clearGraphs()}
          />
        ) : (
          <ResultTableHeader
            run={sortedMappedRuns[0].run}
            historicalRuns={
              showGraphing
                ? []
                : props.historicalRuns[sortedMappedRuns[0].run.id]
            }
            titleCellContent={titleCellContent}
          />
        )}

        <Collapse
          expanded={props.expanded}
          expandDuration={350}
          transitionTimingFunction="ease-in-out"
        >
          <ResultsContent>
            <div>
              {sortedMappedRuns.map(
                ({ run, assayCategoryResultMappings }, index) => (
                  <div key={run.id} data-testid={TestId.RunTable(run.id)}>
                    <ResultTableContentRouter
                      record={record}
                      run={run}
                      historicalRuns={
                        showGraphing ? [] : props.historicalRuns[run.id]
                      }
                      assayCategoryResultMappings={assayCategoryResultMappings}
                      omitRunDateHeader={index === 0}
                      resultsBeingGraphed={resultsBeingGraphed}
                      onGraphResultSelect={(resultId) =>
                        toggleGraphingForResult(resultId)
                      }
                    />
                    {index < props.instrumentRuns.length - 1 && <RunDivider />}
                  </div>
                )
              )}
            </div>

            {showGraphing && labRequest != null && (
              <GraphPanel
                requestedGraphs={currentGraphingParams}
                onGraphClick={(assay) => {
                  setGraphModalOpen(true);
                  setInitialGraphKey(assay);
                }}
              />
            )}
          </ResultsContent>
        </Collapse>
      </ServiceCategoryTable>
      {graphModalOpen && labRequest != null && (
        <GraphModal
          open
          requestedGraphs={currentGraphingParams}
          initialGraphKey={initialGraphKey}
          onClose={() => {
            setGraphModalOpen(false);
            setInitialGraphKey(undefined);
          }}
        />
      )}
    </Root>
  );
}

/**
 * If a particular instrument needs to break out of the established results
 * table view, this is the place to intercept and replace the run table component
 */
function ResultTableContentRouter(props: ResultTableContentProps) {
  if (props.run.hasDotPlots) {
    return <DotPlotResultTableContent {...props} />;
  }
  if (props.run.snapDeviceDto != null) {
    return <SnapDeviceResultTableContent {...props} />;
  }
  if (props.run.instrumentType === InstrumentType.SediVueDx) {
    return <SediVueResultTableContent {...props} />;
  }
  if (props.run.instrumentType === InstrumentType.Theia) {
    return <TheiaResultTableContent {...props} />;
  }

  return <DefaultResultTableContent {...props} />;
}
