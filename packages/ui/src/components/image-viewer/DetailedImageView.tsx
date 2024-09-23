import styled from "styled-components";
import { CellsDto, CytologyImageObjectDto } from "@viewpoint/api";
import { useCallback, useEffect, useRef, useState } from "react";
import { CropToolBar, ImageViewerToolBar } from "./ImageViewerToolBar";
import { ImageViewerTopBar } from "./ImageViewerTopBar";
import {
  calculateCanvasSize,
  calculateRestrainedPanValue,
  CropDimensions,
  Dimensions,
  drawToContext,
  handleCrop,
} from "./canvas-utils";
import { usePan } from "./UsePan";
import { ImageViewerCropView } from "./ImageViewerCropView";
import { ImageViewerCellView } from "./ImageViewerCellView";
import {
  ImageViewerConfiguration,
  WrappedImageData,
} from "./common-components";

const ContentRoot = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  max-height: 100%;
  height: 100%;
  width: 100%;
  position: relative;
`;
const ImageCanvas = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
`;

const CanvasRoot = styled.div<{ height?: number; width?: number }>`
  position: relative;
  display: flex;
  justify-content: center;
  max-height: 100%;
  height: ${(p) =>
    typeof p.height === "undefined" ? "100%" : `${p.height}px`};
  width: ${(p) => (typeof p.width != null ? `${p.width}px` : "100%")};
`;

const ToolBarRoot = styled.div<{ positionToTop?: boolean }>`
  position: absolute;
  ${(p) => (p.positionToTop ? "top: 0;" : "bottom: 0;")}
  left: 0;
  right: 0;
  z-index: 10;
`;

const InfoBarRoot = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
`;

interface DetailedImageViewProps {
  configuration: ImageViewerConfiguration;

  imageData: WrappedImageData;
  markedForPermanentRecordByInstrument: boolean;
  markedForPermanentRecordByUser: boolean;
  cells: CellsDto[];
  imageObjects: CytologyImageObjectDto[];

  onGridView: () => void;
  onToggleMarkForRecord: (marked: boolean) => void;

  shareButtonDisabled: boolean;
  shareButtonHidden: boolean;

  onShareImage: (imageData: ArrayBuffer) => void;
  onPrint: (imageData: ArrayBuffer) => void;
  shareImageStatus: { isLoading: boolean };

  availableAssayIdentities: string[];
}

export function DetailedImageView(props: DetailedImageViewProps) {
  const [zoomFactor, setZoomFactor] = useState(1.0);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [toolsVisible, setToolsVisible] = useState(true);
  const [scaledImageDimensions, setScaledImageDimensions] =
    useState<Dimensions>();
  const [originalImageDimensions, setOriginalImageDimensions] =
    useState<Dimensions>();

  const [inverted, setInverted] = useState(false);
  const [tagsVisible, setTagsVisible] = useState(false);
  const [cropping, setCropping] = useState(false);
  const [moveCropTools, setMoveCropTools] = useState(false);
  const [cropSelection, setCropSelection] = useState<CropDimensions>();

  const stageRef = useRef<HTMLDivElement | null>(null);
  const imageCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const cellCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const reset = useCallback(() => {
    setZoomFactor(1);
    setPanX(0);
    setPanY(0);
    setCropping(false);
  }, []);

  // Reset zoom/panning if image changes
  useEffect(() => {
    reset();
  }, [props.imageData.image.imageUuid, reset]);

  // Handle panning change on the X axis
  const incrementPanX = useCallback(
    (amount: number, zoomFactorArg: number) => {
      if (imageCanvasRef.current != null && !cropping) {
        setPanX((prevPanX) =>
          imageCanvasRef.current == null
            ? prevPanX
            : calculateRestrainedPanValue(
                amount,
                prevPanX,
                imageCanvasRef.current.width,
                zoomFactorArg
              )
        );
      }
    },
    [cropping]
  );

  // Handle panning change on the Y axis
  const incrementPanY = useCallback(
    (amount: number, zoomFactorArg: number) => {
      if (imageCanvasRef.current != null && !cropping) {
        setPanY((prevPanY) =>
          imageCanvasRef.current == null
            ? prevPanY
            : calculateRestrainedPanValue(
                amount,
                prevPanY,
                imageCanvasRef.current.height,
                zoomFactorArg
              )
        );
      }
    },
    [cropping]
  );

  const incrementZoom = useCallback(
    (incrementBy: number) => {
      setZoomFactor((prev) => {
        const newZoom = prev + incrementBy;
        incrementPanX(0, newZoom);
        incrementPanY(0, newZoom);
        return newZoom;
      });
    },
    [incrementPanX, incrementPanY]
  );

  const handlePrint = () => {
    if (cropSelection != null && imageCanvasRef.current != null) {
      handleCrop(
        cropSelection,
        imageCanvasRef.current,
        cellCanvasRef.current,
        (bytes) => {
          props.onPrint(bytes as ArrayBuffer);
        }
      );
    }
  };

  const handleShare = () => {
    if (cropSelection != null && imageCanvasRef.current != null) {
      handleCrop(
        cropSelection,
        imageCanvasRef.current,
        cellCanvasRef.current,
        (bytes) => {
          props.onShareImage(bytes as ArrayBuffer);
        }
      );
    }
  };

  // Pan listener hook
  const { attachListeners } = usePan({
    zoomFactor,
    incrementPanX,
    incrementPanY,
  });

  // Set up touch/click listeners here directly on the ref (instead of on the component) because React's passive events
  // do not allow preventDefault, which is needed to prevent things like swipe to go back in the browser, attempting to scroll
  // the page behind the modal, etc.
  useEffect(() => attachListeners(imageCanvasRef.current), [attachListeners]);

  // Callback for drawing the detailed image in the canvas
  useEffect(() => {
    if (stageRef.current != null && imageCanvasRef.current != null) {
      const canvasContext = imageCanvasRef.current!.getContext("2d")!;
      const image = new Image();
      image.src = props.imageData.image.imageUrl;
      image.onload = () => {
        if (stageRef.current != null && imageCanvasRef.current != null) {
          // Adjust height/width of the canvas, so it is as large as possible without distorting the image's ratio
          const containerRect = stageRef.current.getBoundingClientRect();
          const newCanvasSize = calculateCanvasSize(
            containerRect.height,
            image.width,
            image.height
          );
          imageCanvasRef.current.width = newCanvasSize.width;
          imageCanvasRef.current.height = newCanvasSize.height;
          setScaledImageDimensions(newCanvasSize);
          setOriginalImageDimensions({
            height: image.height,
            width: image.width,
          });

          if (inverted) {
            canvasContext.filter = "invert(1)";
          }

          // Draw the image
          drawToContext(
            canvasContext,
            newCanvasSize,
            image,
            zoomFactor,
            panX,
            panY
          );
        }
      };
    }
  }, [props.imageData, zoomFactor, panX, panY, inverted]);

  return (
    <ContentRoot>
      {!cropping && (
        <InfoBarRoot>
          <ImageViewerTopBar
            showAddToRecordMark={props.configuration.showAddToRecordMark}
            zoomFactor={zoomFactor}
            visible={toolsVisible}
            addedToRecord={props.markedForPermanentRecordByUser}
            markedForRecordByInstrument={
              props.markedForPermanentRecordByInstrument
            }
            setAddedToRecord={props.onToggleMarkForRecord}
          />
        </InfoBarRoot>
      )}
      <CanvasRoot ref={stageRef} {...scaledImageDimensions}>
        <ImageCanvas ref={imageCanvasRef} />
        {cropping && scaledImageDimensions && (
          <ImageViewerCropView
            imageDimensions={scaledImageDimensions}
            setMoveCropTools={setMoveCropTools}
            onSelectionChanged={setCropSelection}
          />
        )}
        {tagsVisible &&
          scaledImageDimensions &&
          originalImageDimensions &&
          (props.cells || props.imageObjects) && (
            <ImageViewerCellView
              viewableAssays={props.availableAssayIdentities}
              cellsCanvasRef={cellCanvasRef}
              imageDimensions={originalImageDimensions}
              canvasDimensions={scaledImageDimensions}
              cells={props.cells}
              imageObjects={props.imageObjects}
              zoomFactor={zoomFactor}
              panX={panX}
              panY={panY}
            />
          )}
      </CanvasRoot>

      <ToolBarRoot positionToTop={cropping && moveCropTools}>
        {cropping ? (
          <CropToolBar
            onCancel={() => setCropping(false)}
            onPrint={handlePrint}
            onShare={handleShare}
            printButtonDisabled={cropSelection == null}
            shareButtonDisabled={props.shareButtonDisabled}
            shareButtonHidden={props.shareButtonHidden}
            shareStatus={props.shareImageStatus}
          />
        ) : (
          <ImageViewerToolBar
            configuration={props.configuration}
            imageData={props.imageData}
            onZoom={(increment) => incrementZoom(increment)}
            canZoomIn={zoomFactor < 2.5}
            canZoomOut={zoomFactor > 1}
            onGridViewSelected={props.onGridView}
            onCropSelected={() => setCropping(true)}
            visible={toolsVisible}
            setVisible={setToolsVisible}
            inverted={inverted}
            setInverted={setInverted}
            tagsVisible={tagsVisible}
            setTagsVisible={setTagsVisible}
          />
        )}
      </ToolBarRoot>
    </ContentRoot>
  );
}
