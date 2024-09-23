import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { usePan } from "./UsePan";
import { CropDimensions, Dimensions } from "./canvas-utils";
import styled from "styled-components";
import { DarkTheme, SpotTokens } from "../../utils/StyleConstants";

// Aspect ratio of available space for image in IVLS report
const CROP_RATIO = 145 / 430;

const ImageCanvas = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
`;

interface ImageViewerCropViewProps {
  imageDimensions: Dimensions;
  setMoveCropTools: (move: boolean) => void;
  onSelectionChanged: (dimensions: CropDimensions) => void;
}

export function ImageViewerCropView(props: ImageViewerCropViewProps) {
  const [cropPanY, setCropPanY] = useState<number>(0);
  const cropCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const { t } = useTranslation();

  const dragText = t("imageViewer.labels.dragInstructions");

  const { onSelectionChanged } = props;

  const incrementPanY = useCallback(
    (amount: number) => {
      const newCropPanY = amount + cropPanY;
      const cropWidth = cropCanvasRef.current!.width;
      const cropHeight = CROP_RATIO * cropWidth;
      const maxPanY = cropCanvasRef.current!.clientHeight / 2 - cropHeight / 2;
      setCropPanY(Math.min(Math.max(-maxPanY, newCropPanY), maxPanY));

      const top = maxPanY + cropPanY;
      onSelectionChanged({
        height: cropHeight,
        width: cropWidth,
        x: 0,
        y: top,
      });
    },
    [cropPanY, onSelectionChanged]
  );

  const { attachListeners } = usePan({
    zoomFactor: 1,
    incrementPanX: () => {},
    incrementPanY: incrementPanY,
  });

  useEffect(() => {
    if (cropCanvasRef.current) {
      attachListeners(cropCanvasRef.current);
    }
    incrementPanY(0);
  }, [attachListeners, incrementPanY]);

  const { setMoveCropTools } = props;
  // Callback for drawing the cropping tool on the crop canvas
  useEffect(() => {
    const canvasContext = cropCanvasRef.current?.getContext("2d");
    if (canvasContext && props.imageDimensions) {
      cropCanvasRef.current!.width = props.imageDimensions.width;
      cropCanvasRef.current!.height = props.imageDimensions.height;

      const cropWidth = cropCanvasRef.current!.width;
      const cropHeight = CROP_RATIO * cropWidth;
      const top =
        cropCanvasRef.current!.clientHeight / 2 - cropHeight / 2 + cropPanY;
      canvasContext.strokeStyle = `${DarkTheme.colors?.interactive?.primary}`; // TODO - confirm color choice
      canvasContext.lineWidth = 3;

      const bottom = top + cropHeight;
      setMoveCropTools(bottom + 75 >= cropCanvasRef.current!.height);

      canvasContext.strokeRect?.(
        3,
        top + 3,
        cropCanvasRef.current!.width - 6,
        cropHeight - 6
      );

      canvasContext.shadowColor = "black";
      canvasContext.shadowBlur = 7;
      canvasContext.font = `16px ${SpotTokens.font.family["sans-serif"]}`;
      canvasContext.fillStyle = "white";
      canvasContext.fillText(dragText, 10, top + 30);
    }
  }, [cropPanY, dragText, props.imageDimensions, setMoveCropTools]);

  return <ImageCanvas ref={cropCanvasRef} style={{ zIndex: 9 }} />;
}
