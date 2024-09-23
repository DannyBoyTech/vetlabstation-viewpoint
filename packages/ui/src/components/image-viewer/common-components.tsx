import styled from "styled-components";
import { DarkTheme } from "../../utils/StyleConstants";
import { ImageDto } from "@viewpoint/api";

export const AddToRecordMarker = styled.div`
  width: 30px;
  height: 30px;
  background-color: white;
  border-radius: 50%;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
`;
export const AddedToRecordMarker = styled.div`
  width: 90%;
  height: 90%;
  background-color: ${DarkTheme.colors?.background?.primary};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export interface ImageViewerConfiguration {
  showAddToRecordMark: boolean;
  showCellLabelsButton: boolean;
  showAreaOfInterestButton: boolean;
  showInvertColorsButton: boolean;
  showAdditionalInfoButton: boolean;
}

export interface WrappedImageData {
  image: ImageDto;
  index: number;
  tagCount: number;
  imageTitle?: string;
  referenceId?: number;
}
