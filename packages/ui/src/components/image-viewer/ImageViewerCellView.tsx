import { MutableRefObject, useEffect, useState } from "react";
import { Dimensions } from "./canvas-utils";
import styled from "styled-components";
import { CellsDto, CytologyImageObjectDto } from "@viewpoint/api";
import { useTranslation } from "react-i18next";
import { SpotTokens } from "../../utils/StyleConstants";

const ImageCanvas = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
`;

interface ImageViewerCellViewProps {
  cellsCanvasRef: MutableRefObject<HTMLCanvasElement | null>;
  canvasDimensions: Dimensions;
  imageDimensions: Dimensions;
  zoomFactor: number;
  panX: number;
  panY: number;
  cells: CellsDto[];
  imageObjects: CytologyImageObjectDto[];
  viewableAssays: string[];
}

export function ImageViewerCellView({
  cellsCanvasRef,
  ...props
}: ImageViewerCellViewProps) {
  const { t } = useTranslation();
  const [viewableAssaysSet, setViewableAssaysSet] = useState(
    new Set(props.viewableAssays)
  );
  useEffect(() => {
    setViewableAssaysSet(new Set(props.viewableAssays));
  }, [props.viewableAssays]);

  useEffect(() => {
    const canvasContext = cellsCanvasRef.current?.getContext("2d");
    if (canvasContext && props.imageDimensions) {
      // Use the full size image dimensions for canvas matrix since cell coordinates are based on those dimensions and not
      // the scaled down version
      cellsCanvasRef.current!.width = props.imageDimensions.width;
      cellsCanvasRef.current!.height = props.imageDimensions.height;

      canvasContext.shadowColor = "black";
      canvasContext.shadowBlur = 5;
      // use a font size proportional to the image dimensions to keep text size consistent across differing image sizes
      const fontHeight = 0.025 * props.imageDimensions.height;
      canvasContext.font = `bold ${fontHeight}px ${SpotTokens.font.family["sans-serif"]}`;
      canvasContext.fillStyle = "#F2E987";

      const xRatio = props.canvasDimensions.width / props.imageDimensions.width;
      const yRatio =
        props.canvasDimensions.height / props.imageDimensions.height;

      for (const cell of props.cells) {
        if (viewableAssaysSet.has(cell.identityName ?? "")) {
          for (const coordinate of cell.coordinates ?? []) {
            const pannedX = coordinate.x! + props.panX / xRatio; // convert pan values
            const pannedY = coordinate.y! + props.panY / yRatio;
            const { x, y } = scaleCoordinates(
              props.imageDimensions.width,
              props.imageDimensions.height,
              pannedX,
              pannedY,
              props.zoomFactor
            );
            canvasContext.fillText(
              t(`Assay.${cell.identityName!}` as any, cell.name),
              x,
              y + fontHeight
            );
          }
        }
      }

      for (const imageObject of props.imageObjects) {
        const pannedX = imageObject.centerX! + props.panX / xRatio; // convert pan values
        const pannedY = imageObject.centerY! + props.panY / yRatio;
        const { x, y } = scaleCoordinates(
          props.imageDimensions.width,
          props.imageDimensions.height,
          pannedX,
          pannedY,
          props.zoomFactor
        );
        canvasContext.fillText(
          t(
            `Assay.${imageObject.labelIdentifier!}` as any,
            imageObject.labelIdentifier
          ),
          x,
          y + fontHeight
        );
      }
    }
  }, [
    cellsCanvasRef.current,
    props.cells,
    props.imageObjects,
    props.zoomFactor,
    props.panX,
    props.panY,
  ]);

  return (
    <ImageCanvas
      ref={cellsCanvasRef}
      style={{
        zIndex: 9,
        pointerEvents: "none",
        width: `${props.canvasDimensions.width}px`,
        height: `${props.canvasDimensions.height}px`,
      }}
    />
  );
}

const scaleCoordinates = (
  width: number,
  height: number,
  x: number,
  y: number,
  scale: number
) => {
  const centerX = width / 2;
  const centerY = height / 2;
  const relX = x - centerX;
  const relY = y - centerY;
  const scaledX = relX * scale;
  const scaledY = relY * scale;
  return { x: scaledX + centerX, y: scaledY + centerY };
};
