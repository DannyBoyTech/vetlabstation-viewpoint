import { useTranslation } from "react-i18next";
import classNames from "classnames";
import styled from "styled-components";
import { SpotText } from "@viewpoint/spot-react";
import { SpotIcon } from "@viewpoint/spot-icons";
import { AddedToRecordMarker, AddToRecordMarker } from "./common-components";

const TopInfoRoot = styled.div`
  display: flex;
  align-items: center;

  transition: transform 0.25s ease-in-out;

  &.hidden {
    transform: translateY(-100px);
  }

  .spot-typography__heading--level-1,
  .spot-typography__heading--level-4,
  .spot-typography__text--body {
    color: white;
    text-shadow: 0 4px 4px rgba(0, 0, 0, 0.25);
  }
`;
const MagnificationContainer = styled.div`
  margin-left: auto;
  display: flex;
  flex-direction: column;
  margin-right: 20px;
`;
const AddToRecordContainer = styled.div`
  display: flex;
  gap: 20px;
  margin-left: 20px;
`;

export const TestId = {
  TopBar: `image-viewer-detailed-view-top-bar`,
  MagnificationLevel: `image-viewer-magnification-level`,
  MarkedForRecord: `image-viewer-detailed-marked-for-record`,
  AddToRecordMarker: `image-viewer-detailed-add-to-record`,
};

interface ImageViewerTopBarProps {
  showAddToRecordMark: boolean;
  zoomFactor: number;
  markedForRecordByInstrument: boolean;
  addedToRecord: boolean;
  setAddedToRecord: (added: boolean) => void;
  visible: boolean;
}

export function ImageViewerTopBar(props: ImageViewerTopBarProps) {
  const { t } = useTranslation();
  const classes = classNames({ hidden: !props.visible });
  return (
    <TopInfoRoot className={classes} data-testid={TestId.TopBar}>
      {props.showAddToRecordMark && !props.markedForRecordByInstrument && (
        <AddToRecordContainer
          onClick={() => props.setAddedToRecord(!props.addedToRecord)}
        >
          <AddToRecordMarker data-testid={TestId.AddToRecordMarker}>
            {props.addedToRecord && (
              <AddedToRecordMarker data-testid={TestId.MarkedForRecord}>
                <SpotIcon name="checkmark" size={15} color="white" />
              </AddedToRecordMarker>
            )}
          </AddToRecordMarker>

          <SpotText level="h4" bold>
            {t(
              props.addedToRecord
                ? "imageViewer.labels.partOfRecord"
                : "imageViewer.labels.addToRecord"
            )}
          </SpotText>
        </AddToRecordContainer>
      )}

      <MagnificationContainer>
        <SpotText level="h1" bold data-testid={TestId.MagnificationLevel}>
          {props.zoomFactor * 100}%
        </SpotText>
        <SpotText level="paragraph" bold>
          {t("imageViewer.labels.magnification")}
        </SpotText>
      </MagnificationContainer>
    </TopInfoRoot>
  );
}
