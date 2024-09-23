import { SpotText } from "@viewpoint/spot-react";
import { useTranslation } from "react-i18next";
import { Fragment, useCallback, useMemo, useState } from "react";
import {
  CytologyImageDto,
  CytologyImageObjectDto,
  SampleTypeEnum,
  TestOrderDto,
  TranslatedNoteType,
} from "@viewpoint/api";
import { useGetCytologyImageDataQuery } from "../../../api/InstrumentRunApi";
import { ImageViewerModal } from "../../image-viewer/ImageViewer";
import { ImageViewerConfiguration } from "../../image-viewer/common-components";
import { ResultTableHeader } from "../common-components/ResultTableHeader";
import {
  Cell,
  ResultTableContentProps,
  RunDivider,
  RunTable,
} from "../common-components/result-table-components";
import { NotesResultTableRow } from "../common-rows/NotesResultTableRow";
import styled from "styled-components";
import { GetMatchingHistoricalResultFn } from "../common-cells/HistoricalResultCells";
import { TheiaResultRow } from "./TheiaResultRow";
import { shouldDisplayCategory } from "../result-utils";
import { CategoryRow } from "../common-rows/CategoryRow";
import { TheiaSourceRow } from "./TheiaSourceRow";
import { RunTableRow } from "../common-components/RunTableRow";
import { TheiaImageResultRow } from "./TheiaImageResultRow";
import ReactMarkdown from "react-markdown";

const NotesSection = styled(Cell)`
  grid-column: 2 / 5;
  display: flex;
  flex-direction: column;
  align-items: start;
  justify-content: center;
`;

const NotesSpotText = styled(SpotText)`
  br {
    // make br to have a margin
    display: block;
    content: "";
    margin-top: 0.5em;
  }
`;

const NotesReactMarkdown = styled(ReactMarkdown)`
  p {
    margin-block-start: 0.7em;
    margin-block-end: 0.7em;
  }
`;

type MappedTestOrders = { [key: number]: TestOrderDto };

export function TheiaResultTableContent(props: ResultTableContentProps) {
  const { t } = useTranslation();

  const { data: imageData } = useGetCytologyImageDataQuery({
    runId: props.run.id,
    thumbnailWidth: 225,
  });

  // Map test order ID to the actual test order -- makes it easier to look up data from the test order
  // entity when we just have the result ID (for historical results)
  const testOrders = useMemo(
    () =>
      [props.run, ...props.historicalRuns]
        .flatMap((run) => run.testOrders ?? [])
        .reduce(
          (prev, curr) => ({
            ...prev,
            [curr.id]: curr,
          }),
          {} as MappedTestOrders
        ),
    [props.run, props.historicalRuns]
  );

  const matchTheiaResult: GetMatchingHistoricalResultFn = useCallback(
    (currentResult, historicalResult) => {
      const currentTestOrder = testOrders[currentResult.testOrderId];
      const historicalTestOrder = testOrders[historicalResult.testOrderId];
      if (
        currentTestOrder.earSwabRunConfigurationDto != null &&
        historicalTestOrder.earSwabRunConfigurationDto != null
      ) {
        return (
          currentTestOrder.earSwabRunConfigurationDto.theiaSampleLocation ===
            historicalTestOrder.earSwabRunConfigurationDto
              .theiaSampleLocation &&
          currentResult.assay === historicalResult.assay
        );
      } else {
        return currentResult.assay === historicalResult.assay;
      }
    },
    [testOrders]
  );

  const diagnosticConsiderationRunNotes = props.run.runNotes?.filter(
    (note) => note.type === TranslatedNoteType.DIAGNOSTIC_CONSIDERATION
  );
  const genericRunNotes = props.run.runNotes?.filter(
    (note) => note.type !== TranslatedNoteType.DIAGNOSTIC_CONSIDERATION
  );
  const hasGenericRunNotes =
    genericRunNotes != null && genericRunNotes.length > 0;

  return (
    <RunTable>
      {(props.run.testOrders ?? []).map(
        (testOrder, testOrderIndex, testOrderArray) => {
          const testOrderImageData =
            imageData == null
              ? []
              : imageData.filter((image) => {
                  return image.runChamber === `${testOrder.sequenceNumber}`;
                });
          const diagnosticConsiderationTestOrderNotes =
            testOrder.testOrderNotes?.filter(
              (note) =>
                note.type === TranslatedNoteType.DIAGNOSTIC_CONSIDERATION
            );
          const genericTestOrderNotes = testOrder.testOrderNotes?.filter(
            (note) => note.type !== TranslatedNoteType.DIAGNOSTIC_CONSIDERATION
          );

          const isLastTestOrder = testOrderIndex === testOrderArray.length - 1;

          const hasTestOrderImages =
            Object.keys(testOrderImageData ?? {}).length > 0;
          const hasTestOrderResults = testOrder.instrumentResultDtos.length > 0;

          const hasDiagnosticConsiderationNotes =
            (diagnosticConsiderationTestOrderNotes != null &&
              diagnosticConsiderationTestOrderNotes.length > 0) ||
            (diagnosticConsiderationRunNotes != null &&
              diagnosticConsiderationRunNotes.length > 0);

          const hasGenericTestOrderNotes =
            genericTestOrderNotes != null && genericTestOrderNotes.length > 0;

          const omitDiagnosticConsiderationBorder = !(
            hasTestOrderImages ||
            hasGenericTestOrderNotes ||
            (isLastTestOrder && hasGenericRunNotes)
          );
          const omitTestOrderImagesBorder = !(
            hasGenericTestOrderNotes ||
            (isLastTestOrder && hasGenericRunNotes)
          );
          const omitGenericTestOrderNotesBorder = !(
            isLastTestOrder && hasGenericRunNotes
          );

          return (
            <Fragment key={testOrder.id}>
              {!props.omitRunDateHeader && (
                <ResultTableHeader
                  run={props.run}
                  historicalRuns={props.historicalRuns}
                />
              )}

              {props.run.sampleType === SampleTypeEnum.EAR_SWAB &&
                testOrder.earSwabRunConfigurationDto != null && (
                  <TheiaSourceRow
                    additionalColumnCount={props.historicalRuns.length}
                    testOrder={testOrder}
                  />
                )}

              {testOrder.instrumentResultDtos?.map((result) => (
                <Fragment key={result.id}>
                  {shouldDisplayCategory(
                    result,
                    props.assayCategoryResultMappings
                  ) && (
                    <CategoryRow
                      category={result.category!}
                      additionalColumnCount={props.historicalRuns.length}
                    />
                  )}
                  <TheiaResultRow
                    record={props.record}
                    run={props.run}
                    result={result}
                    historicalRuns={props.historicalRuns}
                    assayCategoryResultMappings={
                      props.assayCategoryResultMappings
                    }
                    getMatchingHistoricalResult={matchTheiaResult}
                    graphingToggled={props.resultsBeingGraphed?.includes(
                      result.id
                    )}
                    onGraphSelect={() => props.onGraphResultSelect?.(result.id)}
                  />
                </Fragment>
              ))}

              {hasDiagnosticConsiderationNotes && (
                <RunTableRow
                  omitBorder={omitDiagnosticConsiderationBorder}
                  includePlaceholders
                  additionalColumnCount={props.historicalRuns.length}
                >
                  <Fragment>
                    <Cell>
                      <SpotText level="secondary">
                        {t(
                          "resultsPage.resultDetails.labels.diagnosticConsiderations"
                        )}
                      </SpotText>
                    </Cell>
                    <NotesSection>
                      {diagnosticConsiderationTestOrderNotes?.map((note) => (
                        <NotesSpotText key={note.hashId} level="secondary">
                          <NotesReactMarkdown>{note.note}</NotesReactMarkdown>
                        </NotesSpotText>
                      ))}
                      {diagnosticConsiderationRunNotes?.map((note) => (
                        <NotesSpotText key={note.hashId} level="secondary">
                          <NotesReactMarkdown>{note.note}</NotesReactMarkdown>
                        </NotesSpotText>
                      ))}
                    </NotesSection>
                  </Fragment>
                </RunTableRow>
              )}

              {hasTestOrderResults && hasTestOrderImages && (
                <TheiaImageResultContainer
                  omitBorder={omitTestOrderImagesBorder}
                  runId={props.run.id}
                  testOrderImageData={testOrderImageData}
                  additionalColumnCount={props.historicalRuns.length}
                  sampleType={props.run.sampleType}
                />
              )}

              {hasGenericTestOrderNotes && (
                <NotesResultTableRow
                  omitBorder={omitGenericTestOrderNotesBorder}
                  notes={genericTestOrderNotes}
                  additionalColumnCount={props.historicalRuns.length}
                />
              )}

              {!isLastTestOrder && <RunDivider />}
            </Fragment>
          );
        }
      )}

      {hasGenericRunNotes && (
        <NotesResultTableRow
          notes={genericRunNotes}
          additionalColumnCount={props.historicalRuns.length}
          omitBorder
        />
      )}
    </RunTable>
  );
}

export interface TheiaImageResultContainerProps {
  runId: number;
  testOrderImageData: CytologyImageDto[];
  omitBorder: boolean;
  additionalColumnCount: number;
  sampleType?: SampleTypeEnum;
}

const theiaConfiguration: ImageViewerConfiguration = {
  showAddToRecordMark: false,
  showCellLabelsButton: true,
  showAreaOfInterestButton: false,
  showInvertColorsButton: false,
  showAdditionalInfoButton: false,
};

export function TheiaImageResultContainer(
  props: TheiaImageResultContainerProps
) {
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const imageCount = props.sampleType === SampleTypeEnum.BLOOD ? 6 : 3;
  const testOrderImageUrls = props.testOrderImageData
    .slice(0, imageCount)
    .reduce(
      (prev, curr) => ({
        ...prev,
        [curr.imageUuid]: curr.thumbnailImageUrl,
      }),
      {} as Record<string, string>
    );

  return (
    <Fragment key={props.runId}>
      <TheiaImageResultRow
        runId={props.runId}
        omitBorder={props.omitBorder}
        imageUrls={testOrderImageUrls}
        onImageClicked={() => setImageViewerOpen(true)}
        additionalColumnCount={props.additionalColumnCount}
      />

      {props.testOrderImageData && imageViewerOpen && (
        <ImageViewerModal
          configuration={theiaConfiguration}
          imageData={props.testOrderImageData.map((local) => {
            return props.sampleType === SampleTypeEnum.BLOOD
              ? {
                  image: local,
                  index: local.index,
                  imageTitle: local.imageTitle,
                  tagCount: local.imageObjects?.length ?? 0,
                }
              : {
                  image: local,
                  index: local.index,
                  tagCount: local.imageObjects?.length ?? 0,
                };
          })}
          imageObjects={props.testOrderImageData.reduce(
            (prev, curr) => ({
              [curr.imageUuid]: curr.imageObjects ?? [],
              ...prev,
            }),
            {} as Record<string, CytologyImageObjectDto[]>
          )}
          totalImagesInRecord={props.testOrderImageData.length}
          visible={imageViewerOpen}
          runId={props.runId}
          onClose={() => {
            setImageViewerOpen(false);
          }}
          onMarkedForRecordChanged={(uuid, marked) => {}}
        />
      )}
    </Fragment>
  );
}
