import styled from "styled-components";
import { Theme } from "../../../utils/StyleConstants";
import { FullSizeSpinner } from "../../spinner/FullSizeSpinner";
import { SpotText } from "@viewpoint/spot-react";
import { useTranslation } from "react-i18next";
import { ImageWithPlaceholder } from "../../images/ImageWithPlaceholder";
import { Cell } from "../common-components/result-table-components";
import { RunTableRow } from "../common-components/RunTableRow";

export const TestId = {
  ImageLabelCell: (runId: number) => `results-page-assay-cell-images-${runId}`,
  ImageThumbnail: (imageUuid: string) =>
    `results-page-image-thumbnail-${imageUuid}`,
};

export interface ImageResultRowProps {
  isInitializing?: boolean;
  isLoading?: boolean;
  isError?: boolean;
  imageUrls?: Record<string, string>;
  omitBorder?: boolean;
  onImageClicked?: (uuid: string) => void;
  runId: number;
  additionalColumnCount: number;
}

export function ImageResultRow(props: ImageResultRowProps) {
  const { t } = useTranslation();
  return (
    <RunTableRow
      includePlaceholders
      additionalColumnCount={props.additionalColumnCount}
      omitBorder={props.omitBorder}
    >
      <ImageLabelCell data-testid={TestId.ImageLabelCell(props.runId)}>
        <SpotText level="secondary">{t("resultsPage.labels.images")}</SpotText>
      </ImageLabelCell>

      <ImageContainerCell>
        <ResultImagesContainer>
          {(props.isInitializing || props.isError) && <FullSizeSpinner />}
          {Object.keys(props.imageUrls ?? {}).map((uuid) => (
            <ResultImageWrapper key={uuid}>
              <ImageWithPlaceholder
                data-testid={TestId.ImageThumbnail(uuid)}
                src={props.imageUrls?.[uuid]}
                isLoading={props.isLoading}
                onClick={() => props.onImageClicked?.(uuid)}
              />
            </ResultImageWrapper>
          ))}
        </ResultImagesContainer>
      </ImageContainerCell>
    </RunTableRow>
  );
}

const ResultImagesContainer = styled.div`
  height: 100px;
  display: flex;
  gap: 15px;
  padding-bottom: 10px;
`;

const ResultImageWrapper = styled.div`
  height: 100px;
  width: 100px;
  border: ${(p: { theme: Theme }) => p.theme.borders?.lightPrimary};
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ImageLabelCell = styled(Cell)`
  grid-column: 1;
`;
const ImageContainerCell = styled(Cell)`
  grid-column: 2/5;
`;
