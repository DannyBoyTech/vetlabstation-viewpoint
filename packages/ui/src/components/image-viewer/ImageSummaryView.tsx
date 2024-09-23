import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { Property } from "csstype";
import { SpotText } from "@viewpoint/spot-react";
import { SpotIcon } from "@viewpoint/spot-icons";
import { Paginator } from "./Paginator";
import { ImageWithPlaceholder } from "../images/ImageWithPlaceholder";
import {
  AddedToRecordMarker,
  AddToRecordMarker,
  ImageViewerConfiguration,
  WrappedImageData,
} from "./common-components";

const ContentRoot = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const ImageGrid = styled.div`
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  column-gap: 30px;
`;

export const TestId = {
  ImageSummaryView: "image-viewer-summary-view",
  ImagePreviewContainer: "image-viewer-summary-image-preview",
  ImagePreview: (uuid: string) => `image-viewer-summary-image-preview-${uuid}`,
  MarkedForRecord: (uuid: string) =>
    `image-viewer-summary-marked-for-record-${uuid}`,
  AddToRecordMarker: (uuid: string) =>
    `image-viewer-summary-add-to-record-${uuid}`,
};

interface ImageSummaryViewProps {
  configuration: ImageViewerConfiguration;
  displayedImages: WrappedImageData[];
  uuidsMarkedForPermanentRecordByInstrument?: Set<string>;
  uuidsMarkedForPermanentRecordByUser?: Set<string>;
  onClickImage: (index: number) => void;
  onToggleMarkForRecord: (imageUuid: string, marked: boolean) => void;
  onPageBack: () => void;
  onPageForward: () => void;
  currentPage: number;
  totalPages: number;
  imagesInRecord: number;
}

export function ImageSummaryView(props: ImageSummaryViewProps) {
  return (
    <ContentRoot data-testid={TestId.ImageSummaryView}>
      <ImageGrid>
        {props.displayedImages.map((imageData, index) => (
          <ImagePreview
            onClick={() => props.onClickImage(index)}
            key={imageData.image.imageUuid}
            imageData={imageData}
            showAddToRecordMark={props.configuration.showAddToRecordMark}
            markedForPermanentRecordByInstrument={
              props.uuidsMarkedForPermanentRecordByInstrument?.has(
                imageData.image.imageUuid
              ) ?? false
            }
            markedForPermanentRecordByUser={
              props.uuidsMarkedForPermanentRecordByUser?.has(
                imageData.image.imageUuid
              ) ?? false
            }
            onToggleMarkForRecord={(marked) =>
              props.onToggleMarkForRecord(imageData.image.imageUuid, marked)
            }
          />
        ))}
      </ImageGrid>

      <Footer
        configuration={props.configuration}
        onPageBack={props.onPageBack}
        onPageForward={props.onPageForward}
        currentPage={props.currentPage}
        totalPages={props.totalPages}
        imagesInRecord={props.imagesInRecord}
      />
    </ContentRoot>
  );
}

const BorderedImage = styled(ImageWithPlaceholder)`
  border: 2px solid white;
  border-radius: 5px;
`;
const ImagePreviewWrapper = styled.div`
  flex: 1;
  display: flex;
  align-items: self-start;
  justify-content: center;
  position: relative;
`;

const ImagePreviewTitle = styled.div`
  display: flex;
  justify-content: center;
  padding-top: 0.5em;
`;

const RecordMarkerContainer = styled.div`
  position: absolute;
  top: 20px;
  left: 20px;
`;

interface ImagePreviewProps {
  imageData: WrappedImageData;
  showAddToRecordMark: boolean;
  markedForPermanentRecordByInstrument: boolean;
  markedForPermanentRecordByUser: boolean;
  onToggleMarkForRecord: (marked: boolean) => void;
  onClick: () => void;
}

function ImagePreview(props: ImagePreviewProps) {
  return (
    <div>
      <ImagePreviewWrapper
        onClick={props.onClick}
        data-testid={TestId.ImagePreviewContainer}
      >
        {props.showAddToRecordMark &&
          !props.markedForPermanentRecordByInstrument && (
            <RecordMarkerContainer>
              <AddToRecordMarker
                data-testid={TestId.AddToRecordMarker(
                  props.imageData.image.imageUuid
                )}
                onClick={(ev) => {
                  ev.stopPropagation();
                  props.onToggleMarkForRecord(
                    !props.markedForPermanentRecordByUser
                  );
                }}
              >
                {props.markedForPermanentRecordByUser && (
                  <AddedToRecordMarker
                    data-testid={TestId.MarkedForRecord(
                      props.imageData.image.imageUuid
                    )}
                  >
                    <SpotIcon name="checkmark" size={15} color="white" />
                  </AddedToRecordMarker>
                )}
              </AddToRecordMarker>
            </RecordMarkerContainer>
          )}
        <BorderedImage
          src={props.imageData.image.thumbnailImageUrl}
          data-testid={TestId.ImagePreview(props.imageData.image.imageUuid)}
        />
      </ImagePreviewWrapper>
      {props.imageData.imageTitle != null && (
        <ImagePreviewTitle>
          <SpotText level="paragraph">{props.imageData.imageTitle}</SpotText>
        </ImagePreviewTitle>
      )}
    </div>
  );
}

const FooterRoot = styled.div`
  flex: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;
const InfoContainer = styled.div`
  display: flex;
  width: 100%;
`;
const InfoItem = styled.div<{ justifyContent?: Property.JustifyContent }>`
  flex: 1;
  display: flex;
  ${(p) => (p.justifyContent ? `justify-content: ${p.justifyContent};` : "")}
  align-items: center;
`;

interface FooterProps {
  configuration: ImageViewerConfiguration;
  onPageBack: () => void;
  onPageForward: () => void;
  currentPage: number;
  totalPages: number;
  imagesInRecord: number;
}

function Footer(props: FooterProps) {
  const { t } = useTranslation();

  return (
    <FooterRoot>
      <Paginator
        size={"large"}
        currentPage={props.currentPage}
        totalPages={props.totalPages}
        onPageBack={props.onPageBack}
        onPageForward={props.onPageForward}
      />

      <InfoContainer>
        <InfoItem />
        <InfoItem justifyContent="center">
          <SpotText level="paragraph">
            {props.configuration.showAddToRecordMark
              ? t("imageViewer.labels.previewInstructionsWithAddToRecord")
              : t("imageViewer.labels.previewInstructions")}
          </SpotText>
        </InfoItem>
        <InfoItem justifyContent={"flex-end"}>
          <SpotText level="tertiary">
            {props.imagesInRecord === 6
              ? t("imageViewer.labels.maxImagesInRecord")
              : t("imageViewer.labels.recordImageCount", {
                  recordImageCount: props.imagesInRecord,
                })}
          </SpotText>
        </InfoItem>
      </InfoContainer>
    </FooterRoot>
  );
}
