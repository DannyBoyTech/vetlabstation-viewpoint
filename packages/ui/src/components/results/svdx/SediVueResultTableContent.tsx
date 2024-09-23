import { CellsDto, UriSedImageDto } from "@viewpoint/api";
import { ImageResultRow } from "../common-rows/ImageResultRow";
import { Fragment, useCallback, useContext, useEffect, useState } from "react";
import {
  useGetImageDataQuery,
  useMarkImagesForRecordMutation,
} from "../../../api/InstrumentRunApi";
import { ImageViewerModal } from "../../image-viewer/ImageViewer";
import { Link } from "@viewpoint/spot-react";
import { useTranslation } from "react-i18next";
import { SediVueCommentModal } from "./SediVueCommentModal";
import { ViewpointResultsPageContext } from "../../../context/ResultsPageContext";
import { useUpdateSediVueCommentMutation } from "../../../api/SediVueApi";
import SpinnerOverlay from "../../overlay/SpinnerOverlay";
import styled from "styled-components";
import { SpotIcon } from "@viewpoint/spot-icons";
import { ImageViewerConfiguration } from "../../image-viewer/common-components";
import { ResultTableHeader } from "../common-components/ResultTableHeader";

import { DefaultResultTableResultRow } from "../default-components/DefaultResultTableResultRow";
import { NotesResultTableRow } from "../common-rows/NotesResultTableRow";
import { shouldDisplayCategory } from "../result-utils";
import { CategoryRow } from "../common-rows/CategoryRow";
import {
  Cell,
  ResultTableContentProps,
  RunTable,
} from "../common-components/result-table-components";
import { RunTableRow } from "../common-components/RunTableRow";

const EditCommentCell = styled(Cell)`
  display: flex;
  align-items: center;
  grid-column: 2 / 5;
`;

const AddCommentCell = styled(EditCommentCell)`
  grid-column: 2 / 5;
  margin-top: 10px;
`;

export function SediVueResultTableContent(props: ResultTableContentProps) {
  const [editCommentModalOpen, setEditCommentModalOpen] = useState(false);
  const { t } = useTranslation();
  const { labRequest } = useContext(ViewpointResultsPageContext);
  const [updateComment, updateCommentStatus] =
    useUpdateSediVueCommentMutation();

  const handleSaveComment = async (comment?: string) => {
    try {
      setEditCommentModalOpen(false);
      await updateComment({ instrumentRunId: props.run.id, comment });
    } catch (err) {
      console.error(err);
    }
  };

  const hasComment = props.run.userComment != null;

  const CommentCell = hasComment ? EditCommentCell : AddCommentCell;

  return (
    <RunTable>
      {updateCommentStatus.isLoading && <SpinnerOverlay />}
      {!props.omitRunDateHeader && (
        <ResultTableHeader
          run={props.run}
          historicalRuns={props.historicalRuns}
        />
      )}

      <SediVueImageResultRow
        runId={props.run.id}
        omitBorder={!props.run.runNotes || props.run.runNotes.length === 0}
        additionalColumnCount={props.historicalRuns.length}
      />

      {props.run.instrumentResultDtos?.map((result, index) => (
        <Fragment key={result.id}>
          {shouldDisplayCategory(result, props.assayCategoryResultMappings) && (
            <CategoryRow
              category={result.category!}
              additionalColumnCount={props.historicalRuns.length}
            />
          )}
          <DefaultResultTableResultRow
            record={props.record}
            run={props.run}
            result={result}
            historicalRuns={props.historicalRuns}
            assayCategoryResultMappings={props.assayCategoryResultMappings}
            omitBorder={false}
          />
        </Fragment>
      ))}
      {(props.run.runNotes?.length ?? 0) > 0 && (
        <NotesResultTableRow
          notes={props.run.runNotes}
          additionalColumnCount={props.historicalRuns.length}
        />
      )}

      <RunTableRow
        includePlaceholders
        additionalColumnCount={props.historicalRuns.length}
        omitBorder
      >
        <CommentCell>
          <Link
            href="#"
            size="small"
            onClick={() => setEditCommentModalOpen(true)}
            iconLeft={hasComment ? undefined : <SpotIcon name="add" />}
          >
            {hasComment
              ? t("resultsPage.buttons.editComment")
              : t("resultsPage.buttons.addComment")}
          </Link>
        </CommentCell>
      </RunTableRow>

      {editCommentModalOpen && labRequest != null && (
        <SediVueCommentModal
          open={editCommentModalOpen}
          assayCategoryResultMappings={props.assayCategoryResultMappings}
          onClose={() => setEditCommentModalOpen(false)}
          onSave={handleSaveComment}
          run={props.run}
          patient={labRequest?.patientDto}
        />
      )}
    </RunTable>
  );
}

export interface SedivueImageResultRowProps {
  runId: number;
  omitBorder: boolean;
  additionalColumnCount: number;
}

const sediVueConfiguration: ImageViewerConfiguration = {
  showAddToRecordMark: true,
  showCellLabelsButton: true,
  showAreaOfInterestButton: true,
  showInvertColorsButton: true,
  showAdditionalInfoButton: true,
};

export function SediVueImageResultRow(props: SedivueImageResultRowProps) {
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [instrumentSelectedImages, setInstrumentSelectedImages] = useState<
    UriSedImageDto[]
  >([]);
  const [updatedImageMarkings, setUpdatedImageMarkings] = useState<
    Record<string, boolean>
  >({});

  const {
    data: imageData,
    isLoading,
    isError,
  } = useGetImageDataQuery({
    runId: props.runId,
    thumbnailWidth: 225,
  });

  const [markImagesForRecord, markImagesForRecordStatus] =
    useMarkImagesForRecordMutation();

  useEffect(() => {
    setInstrumentSelectedImages(
      imageData?.filter(
        (image: UriSedImageDto) => image.markedForPermanentRecordByInstrument
      ) ?? []
    );
  }, [imageData]);

  const saveChanges = useCallback(() => {
    if (imageData && Object.keys(updatedImageMarkings).length > 0) {
      // Merge existing user selections with new user selections
      markImagesForRecord({
        runId: props.runId,
        markedImageMappings: imageData.reduce(
          (prev, curr) => ({
            [curr.imageUuid]:
              typeof updatedImageMarkings[curr.imageUuid] === "undefined"
                ? !!curr.markedForPermanentRecordByUser
                : updatedImageMarkings[curr.imageUuid],
            ...prev,
          }),
          {} as Record<string, boolean>
        ),
      });
      setUpdatedImageMarkings({});
    }
  }, [updatedImageMarkings]);

  const localImageData = imageData?.map((image: UriSedImageDto) => ({
    ...image,
    // Provide local state to the modal -- data will sync back to the server when the modal is closed (FX client parity)
    markedForPermanentRecordByUser:
      typeof updatedImageMarkings[image.imageUuid] === "undefined"
        ? !!image.markedForPermanentRecordByUser
        : updatedImageMarkings[image.imageUuid],
  })) as UriSedImageDto[];

  return (
    <Fragment key={props.runId}>
      <ImageResultRow
        additionalColumnCount={props.additionalColumnCount}
        runId={props.runId}
        isInitializing={isLoading}
        isLoading={markImagesForRecordStatus.isLoading}
        isError={isError}
        omitBorder={props.omitBorder}
        onImageClicked={() => setImageViewerOpen(true)}
        imageUrls={instrumentSelectedImages?.reduce(
          (prev, curr: UriSedImageDto) => ({
            ...prev,
            [curr.imageUuid]: curr.thumbnailImageUrl,
          }),
          {} as Record<string, string>
        )}
      />

      {localImageData && imageViewerOpen && (
        <ImageViewerModal
          configuration={sediVueConfiguration}
          imageData={localImageData.map((local) => {
            return {
              image: local,
              index: local.index,
              tagCount: local.cells?.length ?? 0,
              referenceId: local.referenceId,
            };
          })}
          uuidsMarkedForPermanentRecordByInstrument={
            new Set<string>(
              localImageData
                .filter((image) => image.markedForPermanentRecordByInstrument)
                .map((image) => image.imageUuid)
            )
          }
          uuidsMarkedForPermanentRecordByUser={
            new Set<string>(
              localImageData
                .filter((image) => image.markedForPermanentRecordByUser)
                .map((image) => image.imageUuid)
            )
          }
          cells={localImageData.reduce(
            (prev, curr) => ({
              [curr.imageUuid]: curr.cells ?? [],
              ...prev,
            }),
            {} as Record<string, CellsDto[]>
          )}
          totalImagesInRecord={
            localImageData.filter(
              (image) =>
                image.markedForPermanentRecordByInstrument ||
                image.markedForPermanentRecordByUser
            ).length
          }
          visible={imageViewerOpen}
          runId={props.runId}
          onClose={() => {
            saveChanges();
            setImageViewerOpen(false);
          }}
          onMarkedForRecordChanged={(imageUuid, marked) =>
            setUpdatedImageMarkings({
              ...updatedImageMarkings,
              [imageUuid]: marked,
            })
          }
        />
      )}
    </Fragment>
  );
}
